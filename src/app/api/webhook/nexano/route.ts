import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Cliente Admin para ignorar políticas de RLS no cadastro inicial
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validação do Token (Extraído do corpo conforme o log real)
    const tokenEnviado = body.token;
    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    if (!tokenEnviado || !Object.values(TOKENS).includes(tokenEnviado)) {
      console.error("Tentativa de acesso com token inválido:", tokenEnviado);
      return NextResponse.json({ error: 'Token não autorizado' }, { status: 401 });
    }

    // 2. Captura de Dados (Focada na estrutura 'client' do seu log)
    const email = body.client?.email || body.email;
    const name = body.client?.name || "Personal SyncPro";
    const rawCpf = body.client?.cpf || body.cpf;
    
    // Limpa o CPF: mantém apenas números para evitar erros no banco
    const cpf = rawCpf ? rawCpf.replace(/\D/g, '') : null;

    if (!email) {
      return NextResponse.json({ error: "Email não encontrado no payload" }, { status: 400 });
    }

    // 3. Lógica de Decisão
    if (tokenEnviado === TOKENS.APPROVED) {
      return await handleApproval(email, name, cpf);
    } else {
      return await handleSuspension(email);
    }

  } catch (error: any) {
    console.error("Erro interno no Webhook:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// FUNÇÃO PARA APROVAR/CRIAR ACESSO
async function handleApproval(email: string, name: string, cpf: string | null) {
  // Senha inicial: CPF (apenas números). Se não houver, usa prefixo do email.
  const temporaryPassword = cpf ? cpf : email.split('@')[0].substring(0, 6) + '123';
  
  // Criar no Auth do Supabase
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { 
      full_name: name,
      cpf: cpf 
    }
  });

  // Se o usuário já existe, reativamos o perfil dele
  if (authError && authError.message.includes('already exists')) {
     const { error: updateError } = await supabaseAdmin
       .from('profiles')
       .update({ status: 'active', cpf: cpf })
       .eq('email', email);
     
     if (updateError) throw updateError;
     return NextResponse.json({ message: 'Acesso reativado com sucesso' });
  }

  if (authError) throw authError;

  // Criar o perfil na tabela 'profiles' para o novo usuário
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    email: email,
    full_name: name,
    cpf: cpf, // Aqui o CPF será salvo como texto puro (apenas números)
    role: 'personal',
    invite_code: inviteCode,
    status: 'active'
  });

  if (profileError) {
    console.error("Erro ao criar perfil no DB:", profileError.message);
    throw profileError;
  }

  return NextResponse.json({ success: true, message: "Usuário e perfil criados" });
}

// FUNÇÃO PARA SUSPENDER ACESSO
async function handleSuspension(email: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('email', email);

  if (error) throw error;
  return NextResponse.json({ success: true, message: "Acesso suspenso" });
}