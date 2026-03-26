'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profile?.role === 'personal') {
      router.push('/personal')
    } else {
      router.push('/aluno')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] text-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-4xl font-black text-[#CCFF00] mb-2">FITSAAS</div>
          <p className="text-slate-400 text-sm italic">Sua melhor versão começa aqui.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full p-4 mt-1 rounded-2xl bg-slate-900 border border-slate-800 focus:border-[#CCFF00] outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full p-4 mt-1 rounded-2xl bg-slate-900 border border-slate-800 focus:border-[#CCFF00] outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b8e600] transition shadow-lg shadow-[#CCFF00]/10"
          >
            {loading ? 'CARREGANDO...' : 'ENTRAR NO DASHBOARD'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-xs">
          Não tem conta? Fale com seu Personal ou cadastre-se.
        </p>
      </div>
    </div>
  )
}