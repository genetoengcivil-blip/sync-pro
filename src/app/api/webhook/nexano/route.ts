import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // 1. CAPTURA DE TODOS OS HEADERS PARA DEBUG
    const headersObj: any = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    const body = await request.json();

    // LOGS CRÍTICOS - VEJA NA VERCEL
    console.log(">>> [DEBUG] TODOS OS HEADERS RECEBIDOS:", JSON.stringify(headersObj, null, 2));
    console.log(">>> [DEBUG] BODY RECEBIDO:", JSON.stringify(body, null, 2));

    // 2. TENTAR ENCONTRAR O TOKEN EM DIFERENTES LUGARES
    const tokenEnviado = request.headers.get('x-nexano-token') || 
                         request.headers.get('nexano-token') || 
                         request.headers.get('authorization') ||
                         body.token; // Algumas plataformas enviam dentro do JSON

    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    // 3. VALIDAÇÃO FLEXÍVEL
    const isTokenValido = Object.values(TOKENS).includes(tokenEnviado);

    if (!isTokenValido) {
      console.error("ERRO 401: Token não autorizado. Recebido:", tokenEnviado);
      return NextResponse.json({ 
        error: 'Token não autorizado', 
        debug: {
          recebido: tokenEnviado,
          headers_keys: Object.keys(headersObj)
        }
      }, { status: 401 });
    }

    // 4. EXTRAÇÃO DE DADOS (EMAIL/NOME/CPF)
    const email = body.email || body.customer?.email || body.data?.customer?.email || body.data?.email;
    const name = body.name || body.customer?.name || body.data?.customer?.name || body.data?.name;
    const cpf = body.cpf || body.customer?.document || body.data?.customer?.document || body.data?.cpf;

    if (!email) return NextResponse.json({ error: "Email ausente" }, { status: 400 });

    // 5. LÓGICA DE STATUS
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

// ... (mantenha as funções handleApproval e handleSuspension iguais às anteriores)
async function handleApproval(email: string, name: string, cpf: string) {
  const password = cpf ? cpf.replace(/\D/g, '') : email.split('@')[0] + '123';
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: name || 'Personal SyncPro' }
  });
  if (authError && authError.message.includes('already exists')) {
     await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('email', email);
     return NextResponse.json({ message: 'Reativado' });
  }
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id, full_name: name || 'Personal SyncPro', role: 'personal', invite_code: inviteCode, status: 'active', email: email
  });
  return NextResponse.json({ success: true });
}

async function handleSuspension(email: string) {
  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('email', email);
  return NextResponse.json({ success: true });
}