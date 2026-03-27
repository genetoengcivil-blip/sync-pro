'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Mail, Lock, Phone, 
  Target, DollarSign, Calendar, Save, Loader2 
} from 'lucide-react'

export default function NewStudent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '', // Senha que você definirá para o aluno
    goal: 'Hipertrofia',
    monthly_fee: '150',
    payment_day: '10'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Chamada para a nossa API segura
      const response = await fetch('/api/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          personal_id: user?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Aluno cadastrado e acesso liberado! 🔥')
        router.push('/personal/alunos')
      } else {
        alert('Erro: ' + result.error)
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <button onClick={() => router.back()} className="text-slate-500 hover:text-[#CCFF00] text-[10px] font-black uppercase flex items-center gap-2">
        <ArrowLeft size={16} /> Voltar
      </button>

      <header>
        <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Onboarding</p>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">NOVO <span className="text-[#CCFF00]">ALUNO</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DADOS DE ACESSO */}
        <div className="md:col-span-2 bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 px-2">
            <Lock size={14} className="text-[#CCFF00]" /> Credenciais de Acesso
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic">E-mail (Login)</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" placeholder="aluno@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic">Senha Inicial do Aluno</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" placeholder="Ex: aluno123" />
            </div>
          </div>
        </div>

        {/* DADOS PESSOAIS */}
        <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 px-2"><User size={14}/> Perfil</h3>
          <div className="space-y-4">
            <input required type="text" placeholder="Nome Completo" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" />
            <input required type="text" placeholder="WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" />
            <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold outline-none focus:border-[#CCFF00] appearance-none">
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Performance">Performance</option>
              <option value="Saúde">Saúde</option>
            </select>
          </div>
        </div>

        {/* FINANCEIRO */}
        <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 px-2"><DollarSign size={14}/> Financeiro</h3>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#CCFF00] text-xs">R$</span>
              <input required type="number" placeholder="Valor Mensal" value={formData.monthly_fee} onChange={e => setFormData({...formData, monthly_fee: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input required type="number" placeholder="Dia do Vencimento" value={formData.payment_day} onChange={e => setFormData({...formData, payment_day: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl font-bold outline-none focus:border-[#CCFF00]" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="md:col-span-2 w-full py-6 bg-[#CCFF00] text-black font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-lg shadow-[#CCFF00]/10 hover:scale-[1.01] transition-all">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} strokeWidth={3} />}
          {loading ? 'SINCRONIZANDO...' : 'FINALIZAR E ENVIAR ACESSO'}
        </button>
      </form>
    </div>
  )
}