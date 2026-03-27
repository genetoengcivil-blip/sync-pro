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
    const tokenEnviado = body.token;

    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    if (!tokenEnviado || !Object.values(TOKENS).includes(tokenEnviado)) {
      return NextResponse.json({ error: 'Token não autorizado' }, { status: 401 });
    }

    const email = body.client?.email || body.email;
    const name = body.client?.name || "Personal SyncPro";
    const rawCpf = body.client?.cpf || body.cpf;
    const cpf = rawCpf ? rawCpf.replace(/\D/g, '') : null;

    if (!email) return NextResponse.json({ error: "Email ausente" }, { status: 400 });

    if (tokenEnviado === TOKENS.APPROVED) {
      return await handleApproval(email, name, cpf);
    } else {
      return await handleSuspension(email);
    }

  } catch (error: any) {
    console.error("ERRO WEBHOOK:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleApproval(email: string, name: string, cpf: string | null) {
  const temporaryPassword = cpf ? cpf : email.split('@')[0].substring(0, 6) + '123';
  
  // 1. Tenta criar o usuário no Auth com a flag 'first_access'
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { 
      full_name: name, 
      cpf: cpf,
      first_access: true // Marcação para o Dashboard saber que deve trocar a senha
    }
  });

  let userId = authUser.user?.id;

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const user = existingUsers?.users.find(u => u.email === email);
      if (user) userId = user.id;
    } else {
      throw authError;
    }
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: email,
    full_name: name,
    cpf: cpf,
    role: 'personal',
    status: 'active',
    invite_code: inviteCode 
  }, { onConflict: 'id' });

  if (profileError) throw profileError;

  return NextResponse.json({ success: true, message: "Acesso processado" });
}

async function handleSuspension(email: string) {
  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('email', email);
  return NextResponse.json({ success: true });
}