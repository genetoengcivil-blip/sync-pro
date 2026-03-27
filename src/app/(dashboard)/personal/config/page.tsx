'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, DollarSign, MessageSquare, 
  Save, Loader2, ShieldCheck, Sparkles, Smartphone
} from 'lucide-react'

export default function PersonalSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    pix_key: '',
    welcome_message: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, pix_key, welcome_message')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data)
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        pix_key: profile.pix_key,
        welcome_message: profile.welcome_message
      })
      .eq('id', user?.id)

    if (!error) {
      alert('Configurações atualizadas com sucesso! 🔥')
    } else {
      alert('Erro ao salvar: ' + error.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white selection:bg-[#CCFF00]">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <button onClick={() => router.push('/personal')} className="group flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <header>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Configurações<span className="text-[#CCFF00]">.</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Personalize sua experiência SyncPro</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SEÇÃO: IDENTIDADE */}
          <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#CCFF00]/10 p-2 rounded-lg text-[#CCFF00]"><User size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest">Identidade Visual</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Nome de Exibição (Como os alunos te veem)</label>
                <input 
                  required
                  type="text" 
                  value={profile.full_name}
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none focus:border-[#CCFF00] transition"
                  placeholder="Seu nome profissional"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO: FINANCEIRO */}
          <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-cyan-400/10 p-2 rounded-lg text-cyan-400"><DollarSign size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest">Checkout & Pagamentos</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Sua Chave PIX (Para cobrança automática)</label>
              <input 
                required
                type="text" 
                value={profile.pix_key}
                onChange={e => setProfile({...profile, pix_key: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none focus:border-cyan-400 transition"
                placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              />
              <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 ml-2">Essa chave será colada automaticamente nas mensagens de cobrança via WhatsApp.</p>
            </div>
          </section>

          {/* SEÇÃO: BOAS-VINDAS */}
          <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500"><MessageSquare size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest">Onboarding de Alunos</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Mensagem de Boas-Vindas Padrão</label>
              <textarea 
                value={profile.welcome_message}
                onChange={e => setProfile({...profile, welcome_message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none focus:border-purple-500 transition min-h-[120px] resize-none"
                placeholder="Olá! Estou feliz em ser seu treinador..."
              />
            </div>
          </section>

          {/* BOTÃO SALVAR GERAL */}
          <button 
            type="submit"
            disabled={saving}
            className="w-full py-6 bg-[#CCFF00] text-black font-black rounded-3xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(204,255,0,0.1)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? 'SALVANDO...' : 'CONFIRMAR TODAS AS ALTERAÇÕES'}
          </button>

        </form>
      </div>
    </div>
  )
}