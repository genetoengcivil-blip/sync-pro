import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use a Service Role Key do seu painel Supabase
  )

  try {
    const { email, password, full_name, phone, personal_id, goal, monthly_fee, payment_day } = await req.json()

    // 1. Cria o usuário no Auth (sem deslogar o personal)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', full_name }
    })

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    // 2. Salva na tabela de alunos vinculando ao ID do Auth
    const { error: dbError } = await supabaseAdmin
      .from('students')
      .insert({
        id: authUser.user.id, // O ID do aluno no DB será o mesmo do Auth
        full_name,
        email,
        phone,
        personal_id,
        goal,
        monthly_fee: parseFloat(monthly_fee),
        payment_day: parseInt(payment_day),
        payment_status: false
      })

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}