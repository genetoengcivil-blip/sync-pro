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

    // --- LOG PARA CONFERÊNCIA ---
    console.log(">>> [PRODUÇÃO] Processando evento:", body.event);
    console.log(">>> [PRODUÇÃO] Token recebido no corpo:", body.token);

    // 1. Pega o token direto do corpo do JSON (como vimos no log)
    const tokenEnviado = body.token;

    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    // Validação
    if (!tokenEnviado || !Object.values(TOKENS).includes(tokenEnviado)) {
      console.error("ERRO 401: Token inválido. Recebemos:", tokenEnviado);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2. Mapeamento exato conforme o seu log
    const email = body.client?.email;
    const name = body.client?.name;
    const cpf = body.client?.cpf;

    if (!email) {
      console.error("ERRO 400: Email ausente dentro do objeto 'client'.");
      return NextResponse.json({ error: "Email ausente" }, { status: 400 });
    }

    // 3. Lógica de Status baseada no Token
    if (tokenEnviado === TOKENS.APPROVED) {
      console.log("Aprovando acesso para:", email);
      return await handleApproval(email, name, cpf);
    } else {
      console.log("Suspendendo acesso para:", email);
      return await handleSuspension(email);
    }

  } catch (error: any) {
    console.error("ERRO NO WEBHOOK:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleApproval(email: string, name: string, cpf: string) {
  const password = cpf ? cpf.replace(/\D/g, '') : email.split('@')[0] + '123';
  
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || 'Personal SyncPro' }
  });

  if (authError && authError.message.includes('already exists')) {
     await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('email', email);
     return NextResponse.json({ message: 'Acesso reativado' });
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    full_name: name || 'Personal SyncPro',
    role: 'personal',
    invite_code: inviteCode,
    status: 'active',
    email: email
  });

  return NextResponse.json({ success: true });
}

async function handleSuspension(email: string) {
  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('email', email);
  return NextResponse.json({ success: true });
}