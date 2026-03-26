import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // A Nexano envia geralmente 'email' e 'name' ou 'customer_name'
    const { email, name } = body 

    // 1. Criar o Personal no Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Senha provisória
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (authError) throw authError

    // 2. Criar o perfil como PERSONAL e gerar o INVITE_CODE
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authUser.user.id,
      full_name: name,
      role: 'personal', // Sempre personal via Nexano
      invite_code: inviteCode
    })

    if (profileError) throw profileError

    // Opcional: Aqui você pode disparar um e-mail para o Personal 
    // com a senha gerada ou link de "Esqueci minha senha".

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}