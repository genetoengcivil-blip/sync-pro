import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Configuração do cliente Admin (ignora RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // 1. Extração dos Dados da Requisição
    const tokenEnviado = request.headers.get('x-nexano-token');
    const body = await request.json();

    // --- LOGS DE DEPURAÇÃO (Ver na aba LOGS da Vercel) ---
    console.log(">>> Webhook Nexano Iniciado");
    console.log("Token recebido no Header:", tokenEnviado);
    console.log("Payload Completo:", JSON.stringify(body, null, 2));

    // 2. Mapeamento dos Tokens do Ambiente
    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    // Validação de Segurança
    const isTokenValido = Object.values(TOKENS).includes(tokenEnviado);

    if (!isTokenValido) {
      console.error("ERRO 401: Token inválido ou não configurado corretamente.");
      return NextResponse.json({ 
        error: 'Token não autorizado', 
        debug_token_recebido: tokenEnviado 
      }, { status: 401 });
    }

    // 3. Extração Robusta de Dados (Trata diferentes formatos de payload)
    const email = body.email || body.customer?.email || body.data?.customer?.email || body.data?.email;
    const name = body.name || body.customer?.name || body.data?.customer?.name || body.data?.name;
    const cpf = body.cpf || body.customer?.document || body.data?.customer?.document || body.data?.cpf;

    if (!email) {
      console.error("ERRO 400: Email não encontrado no payload.");
      return NextResponse.json({ error: "Email ausente" }, { status: 400 });
    }

    // 4. Lógica de Negócio baseada no Token
    switch (tokenEnviado) {
      case TOKENS.APPROVED:
        console.log("Processando APROVAÇÃO para:", email);
        return await handleApproval(email, name, cpf);

      case TOKENS.CANCELED:
      case TOKENS.REFUNDED:
      case TOKENS.DISPUTED:
        console.log("Processando SUSPENSÃO para:", email);
        return await handleSuspension(email);

      default:
        return NextResponse.json({ message: 'Token reconhecido mas sem ação definida' }, { status: 200 });
    }

  } catch (error: any) {
    console.error("ERRO CRÍTICO NO WEBHOOK:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- FUNÇÕES AUXILIARES ---

async function handleApproval(email: string, name: string, cpf: string) {
  // Senha padrão = CPF (só números). Se não houver CPF, gera uma baseada no email.
  const temporaryPassword = cpf ? cpf.replace(/\D/g, '') : email.split('@')[0] + '123';
  
  // Tentar criar o usuário no Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { full_name: name || 'Personal SyncPro' }
  });

  if (authError) {
    // Se o usuário já existe, apenas garantimos que o status seja 'active'
    if (authError.message.includes('already exists')) {
       await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('email', email);
       return NextResponse.json({ message: 'Acesso reativado para usuário existente' });
    }
    throw authError;
  }

  // Se o usuário é novo, cria o perfil e o código de convite
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    full_name: name || 'Personal SyncPro',
    role: 'personal',
    invite_code: inviteCode,
    status: 'active',
    email: email
  });

  if (profileError) throw profileError;

  return NextResponse.json({ success: true, message: 'Novo Personal criado e ativo' });
}

async function handleSuspension(email: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('email', email);

  if (error) throw error;
  return NextResponse.json({ success: true, message: 'Acesso suspenso com sucesso' });
}