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
    const { email, name, cpf } = body

    // 1. Mapeamento de Tokens (Cadastre estes nomes na Vercel)
    const TOKENS = {
      APPROVED: process.env.NEXANO_TOKEN_APPROVED,
      CANCELED: process.env.NEXANO_TOKEN_CANCELED,
      REFUNDED: process.env.NEXANO_TOKEN_REFUNDED,
      DISPUTED: process.env.NEXANO_TOKEN_DISPUTED
    }

    // 2. Lógica de Decisão baseada no Token enviado
    switch (token) {
      case TOKENS.APPROVED:
        return await handleApproval(email, name, cpf)

      case TOKENS.CANCELED:
      case TOKENS.REFUNDED:
      case TOKENS.DISPUTED:
        return await handleSuspension(email)

      default:
        return NextResponse.json({ error: 'Token inválido ou não configurado' }, { status: 401 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// FUNÇÃO PARA APROVAR/CRIAR ACESSO
async function handleApproval(email: string, name: string, cpf: string) {
  const password = cpf.replace(/\D/g, '')
  
  // Criar ou reativar usuário no Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  })

  // Se já existe, apenas garantimos que o perfil esteja 'active'
  if (authError && authError.message.includes('already exists')) {
     const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single()
     if (existingUser) {
        await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', existingUser.id)
     }
     return NextResponse.json({ message: 'Usuário reativado' })
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  await supabaseAdmin.from('profiles').insert({
    id: authUser.user?.id,
    full_name: name,
    role: 'personal',
    invite_code: inviteCode,
    status: 'active'
  })

  return NextResponse.json({ message: 'Acesso liberado' })
}

// FUNÇÃO PARA SUSPENDER ACESSO
async function handleSuspension(email: string) {
  // Buscamos o ID do usuário pelo email
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email) // Certifique-se de que a coluna email existe em profiles ou use rpc
    .single()

  if (user) {
    await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('id', user.id)
  }

  return NextResponse.json({ message: 'Acesso suspenso' })
}