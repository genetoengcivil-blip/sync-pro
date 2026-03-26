'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'active' | 'suspended' | 'loading'>('loading')
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single()

      if (profile?.status === 'suspended') {
        setStatus('suspended')
      } else {
        setStatus('active')
      }
    }
    checkStatus()
  }, [router])

  if (status === 'loading') return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-[#CCFF00] font-mono">Verificando assinatura...</div>

  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-amber-500 mb-6" />
        <h1 className="text-3xl font-black mb-2">ASSINATURA PENDENTE</h1>
        <p className="text-slate-400 max-w-sm mb-8">Detectamos um problema com seu pagamento na Nexano. Regularize sua situação para retomar o acesso aos seus alunos.</p>
        <button onClick={() => window.location.href = 'https://suporte.nexano.com.br'} className="bg-amber-500 text-black px-8 py-3 rounded-xl font-bold">Falar com Suporte</button>
      </div>
    )
  }

  return <>{children}</>
}