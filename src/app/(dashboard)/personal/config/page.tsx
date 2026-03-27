'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Save, Key, User, Loader2 } from 'lucide-react'

export default function ConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pixKey, setPixKey] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
      if (data) {
        setPixKey(data.pix_key || '')
        setFullName(data.full_name || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      pix_key: pixKey,
      full_name: fullName
    }).eq('id', user?.id)

    if (!error) alert('Configurações salvas com sucesso! 🚀')
    setSaving(false)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-70">Perfil do Treinador</p>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">CONFIG<span className="text-[#CCFF00]">URAÇÕES</span></h1>
      </header>

      <div className="bg-slate-900/40 border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-4 flex items-center gap-2">
            <User size={14} className="text-[#CCFF00]" /> Nome Completo
          </label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-bold outline-none focus:border-[#CCFF00]/40 transition"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-4 flex items-center gap-2">
            <Key size={14} className="text-[#CCFF00]" /> Minha Chave PIX (Para cobranças)
          </label>
          <input 
            type="text" 
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, E-mail ou Celular"
            className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-bold outline-none focus:border-[#CCFF00]/40 transition"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#CCFF00] text-black py-6 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-[#CCFF00]/10"
        >
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
        </button>
      </div>
    </div>
  )
}