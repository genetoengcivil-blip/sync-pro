import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const tokenEnviado = request.headers.get('x-nexano-token');
    const body = await request.json();

    // --- O MAPA DO PROBLEMA ---
    // Esse log aqui é o mais importante. Ele vai imprimir o JSON inteiro na Vercel.
    console.log(">>> PAYLOAD RECEBIDO:", JSON.stringify(body, null, 2));

    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    if (!Object.values(TOKENS).includes(tokenEnviado)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Tenta encontrar o email em TODAS as estruturas possíveis da Nexano
    const email = body.email || 
                  body.customer?.email || 
                  body.data?.customer?.email || 
                  body.data?.email || 
                  body.payload?.customer?.email ||
                  body.transaction?.customer?.email;

    const name = body.name || 
                 body.customer?.name || 
                 body.data?.customer?.name || 
                 body.data?.name ||
                 body.payload?.customer?.name;

    const cpf = body.cpf || 
                body.customer?.document || 
                body.data?.customer?.document || 
                body.data?.cpf ||
                body.payload?.customer?.document;

    // Se mesmo assim não achar, vamos retornar o que recebemos para debugar
    if (!email) {
      console.error("ERRO: Email não encontrado. Chaves recebidas:", Object.keys(body));
      return NextResponse.json({ 
        error: "Email ausente no payload", 
        keys_recebidas: Object.keys(body) 
      }, { status: 400 });
    }

    // Lógica de Status
    if (tokenEnviado === TOKENS.APPROVED) {
      return await handleApproval(email, name, cpf);
    } else {
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