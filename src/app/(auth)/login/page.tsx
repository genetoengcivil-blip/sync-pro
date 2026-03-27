'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, Zap, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('1. Tentando login...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      console.log('2. Login bem sucedido:', data.user?.id)
      
      if (!data.user) throw new Error('Usuário não encontrado')

      // Buscar perfil do usuário
      let redirectPath = '/personal'
      
      try {
        console.log('3. Buscando perfil...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.log('Erro ao buscar profile:', profileError)
        }
        
        if (profile?.role === 'aluno') {
          redirectPath = '/aluno'
          console.log('4. Usuário é aluno, redirecionando para:', redirectPath)
        } else {
          console.log('4. Usuário é personal, redirecionando para:', redirectPath)
        }
      } catch (err) {
        console.error('Erro ao buscar role:', err)
      }

      // Forçar redirecionamento com window.location como fallback
      console.log('5. Redirecionando para:', redirectPath)
      
      // Tenta com router primeiro
      setTimeout(() => {
        router.push(redirectPath)
        router.refresh()
      }, 100)
      
      // Fallback: se não redirecionar em 2 segundos, força com window.location
      setTimeout(() => {
        if (window.location.pathname !== redirectPath) {
          console.log('Fallback: forçando redirecionamento para:', redirectPath)
          window.location.href = redirectPath
        }
      }, 2000)
      
    } catch (err: any) {
      console.error("Erro de Autenticação:", err)
      
      if (err.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.')
      } else if (err.message === 'Email not confirmed') {
        setError('Por favor, confirme seu e-mail antes de acessar.')
      } else {
        setError('Falha na conexão. Tente novamente em instantes.')
      }
      
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 text-white selection:bg-[#CCFF00]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#CCFF00] rounded-full blur-[180px]" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
            SYNC<span className="text-[#CCFF00]">PRO</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-70">
            Performance Management System
          </p>
        </div>

        <form 
          onSubmit={handleLogin} 
          className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-6"
        >
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#CCFF00] transition-colors" size={18} />
              <input 
                required 
                type="email" 
                placeholder="E-mail de acesso"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:border-[#CCFF00] transition-all placeholder:text-slate-700"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#CCFF00] transition-colors" size={18} />
              <input 
                required 
                type="password" 
                placeholder="Senha"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:border-[#CCFF00] transition-all placeholder:text-slate-700"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(204,255,0,0.15)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="black" />}
            {loading ? 'SINCRONIZANDO...' : 'ENTRAR NO SISTEMA'}
          </button>

          <p className="text-[8px] text-center text-slate-600 font-black uppercase tracking-widest italic pt-2">
            Acesso restrito a profissionais e alunos SyncPro
          </p>
        </form>
      </div>
    </div>
  )
}