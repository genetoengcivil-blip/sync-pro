import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const token = request.headers.get('x-nexano-token')
    const body = await request.json()

    // LOG CRÍTICO: Veja isso no painel da Vercel (Logs do Deployment)
    console.log("--- PAYLOAD RECEBIDO DA NEXANO ---")
    console.log(JSON.stringify(body, null, 2))

    // Tenta pegar os dados de vários lugares possíveis (Nexano varia conforme a versão)
    const email = body.email || body.customer?.email || body.data?.customer?.email || body.data?.email
    const name = body.name || body.customer?.name || body.data?.customer?.name || body.data?.name
    const cpf = body.cpf || body.customer?.document || body.data?.customer?.document || body.data?.cpf

    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    if (!email) {
      console.error("ERRO: Email não encontrado no corpo da requisição.")
      return NextResponse.json({ error: "Email ausente no payload" }, { status: 400 })
    }

    switch (token) {
      case TOKENS.APPROVED:
        return await handleApproval(email, name, cpf)
      case TOKENS.CANCELED:
      case TOKENS.REFUNDED:
      case TOKENS.DISPUTED:
        return await handleSuspension(email)
      default:
        console.error("ERRO: Token não reconhecido:", token)
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
  } catch (error: any) {
    console.error("ERRO GLOBAL WEBHOOK:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleApproval(email: string, name: string, cpf: string) {
  // Se o CPF não vier, usamos uma senha padrão ou o próprio email
  const password = cpf ? cpf.replace(/\D/g, '') : email.split('@')[0] + '123'
  
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || 'Usuário SyncPro' }
  })

  if (authError) {
    if (authError.message.includes('already exists')) {
       // Se já existe, garante que está ativo
       const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single()
       if (user) await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', user.id)
       return NextResponse.json({ message: 'Acesso reativado' })
    }
    throw authError
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    full_name: name || 'Usuário SyncPro',
    role: 'personal',
    invite_code: inviteCode,
    status: 'active',
    email: email // Guardamos o email em profiles para facilitar suspensões
  })

  return NextResponse.json({ message: 'Acesso liberado' })
}

async function handleSuspension(email: string) {
  await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('email', email)
  return NextResponse.json({ message: 'Acesso suspenso' })
}