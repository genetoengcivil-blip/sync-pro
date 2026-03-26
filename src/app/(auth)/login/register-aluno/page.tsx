'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StudentRegister() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validar se o código do Personal existe
    const { data: personal } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!personal) return alert('Código de Personal inválido!')

    // 2. Criar Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return alert(authError.message)

    if (authData.user) {
      // 3. Criar Perfil Aluno
      await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: fullName,
        role: 'student'
      })

      // 4. Criar Vínculo Automático
      await supabase.from('student_relations').insert({
        personal_id: personal.id,
        student_id: authData.user.id
      })

      alert('Cadastro realizado! Agora faça login.')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <form onSubmit={handleRegister} className="w-full max-w-md space-y-4 bg-slate-900 p-8 rounded-[2rem] border border-white/5">
        <h1 className="text-2xl font-black text-[#CCFF00] text-center mb-6">CADASTRO DE ALUNO</h1>
        <input placeholder="Nome Completo" className="w-full p-4 rounded-xl bg-slate-800 outline-none" onChange={e => setFullName(e.target.value)} />
        <input placeholder="E-mail" type="email" className="w-full p-4 rounded-xl bg-slate-800 outline-none" onChange={e => setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" className="w-full p-4 rounded-xl bg-slate-800 outline-none" onChange={e => setPassword(e.target.value)} />
        <input placeholder="CÓDIGO DO PERSONAL" className="w-full p-4 rounded-xl bg-slate-800 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-center" onChange={e => setInviteCode(e.target.value)} />
        <button className="w-full py-4 bg-[#CCFF00] text-black font-black rounded-xl">CRIAR MEU ACESSO</button>
      </form>
    </div>
  )
}