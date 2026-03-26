import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // LOGS DE APOIO (Confira na aba Logs da Vercel)
    console.log(">>> [WEBHOOK] Evento:", body.event);
    console.log(">>> [WEBHOOK] Token:", body.token);

    // 1. Validação do Token
    const tokenEnviado = body.token;
    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    if (!tokenEnviado || !Object.values(TOKENS).includes(tokenEnviado)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2. CAPTURA REFORÇADA (Tenta ler 'client.email' e outras variações)
    const email = body.client?.email || body.email || body.customer?.email || body.data?.email;
    const name = body.client?.name || body.name || body.customer?.name || "Personal SyncPro";
    const rawCpf = body.client?.cpf || body.cpf || body.customer?.document;
    const cpf = rawCpf ? rawCpf.replace(/\D/g, '') : null;

    // Se o email ainda for nulo, vamos logar o body inteiro para ver o que houve
    if (!email) {
      console.error(">>> [ERRO] Não conseguimos achar o email no body:", JSON.stringify(body));
      return NextResponse.json({ 
        error: "Email ausente", 
        estrutura_recebida: Object.keys(body) 
      }, { status: 400 });
    }

    // 3. Decisão de Ação
    if (tokenEnviado === TOKENS.APPROVED) {
      return await handleApproval(email, name, cpf);
    } else {
      return await handleSuspension(email);
    }

  } catch (error: any) {
    console.error(">>> [ERRO CRÍTICO]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleApproval(email: string, name: string, cpf: string) {
  // Senha: CPF (apenas números). Se não tiver CPF, usa os 5 primeiros dígitos do email + 123
  const password = cpf ? cpf.replace(/\D/g, '') : email.split('@')[0].substring(0,5) + '123';
  
  // 1. Tenta criar o usuário no Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  });

  // 2. Se o usuário já existir, apenas reativa
  if (authError && authError.message.includes('already exists')) {
     await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('email', email);
     return NextResponse.json({ message: 'Acesso reativado' });
  }

  if (authError) throw authError;

  // 3. Se for novo, cria o perfil
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    full_name: name,
    role: 'personal',
    invite_code: inviteCode,
    status: 'active',
    email: email
  });

  if (profileError) throw profileError;

  return NextResponse.json({ success: true, message: "Novo Personal cadastrado" });
}

async function handleSuspension(email: string) {
  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('email', email);
  return NextResponse.json({ success: true, message: "Acesso suspenso" });
}