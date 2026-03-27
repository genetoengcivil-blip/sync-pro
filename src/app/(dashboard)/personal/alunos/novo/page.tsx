'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowLeft, Loader2, Fingerprint } from 'lucide-react'

export default function NewStudentPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    goal: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user: personal } } = await supabase.auth.getUser()
      
      // Limpa o CPF para salvar apenas números
      const cleanCpf = formData.cpf.replace(/\D/g, '')

      // Insere o aluno vinculado ao Personal logado
      const { error: stError } = await supabase
        .from('students')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          cpf: cleanCpf,
          goal: formData.goal,
          personal_id: personal?.id,
          status: 'active'
        })

      if (stError) throw stError

      alert(`Aluno ${formData.full_name} cadastrado com sucesso!`)
      router.push('/personal')
      router.refresh()

    } catch (err: any) {
      alert('Erro ao cadastrar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white selection:bg-[#CCFF00]">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-10 text-[10px] font-black uppercase tracking-widest hover:text-[#CCFF00] transition">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Novo <span className="text-[#CCFF00]">Aluno</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">O CPF será a senha inicial do aluno</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-5 shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-600 ml-4 tracking-widest">Nome Completo</label>
              <input 
                required
                className="w-full bg-slate-800/50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#CCFF00] transition outline-none"
                placeholder="Ex: Carlos Alberto"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-600 ml-4 tracking-widest">CPF (Apenas números)</label>
                <div className="relative">
                  <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    required
                    className="w-full bg-slate-800/50 border-none rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-[#CCFF00] transition outline-none"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-600 ml-4 tracking-widest">WhatsApp</label>
                <input 
                  required
                  className="w-full bg-slate-800/50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#CCFF00] transition outline-none"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-600 ml-4 tracking-widest">E-mail de Acesso</label>
              <input 
                type="email"
                required
                className="w-full bg-slate-800/50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#CCFF00] transition outline-none"
                placeholder="aluno@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-600 ml-4 tracking-widest">Objetivo</label>
              <select 
                required
                className="w-full bg-slate-800/50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#CCFF00] appearance-none cursor-pointer"
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Definição">Definição Muscular</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-[#CCFF00]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={22} />}
            CADASTRAR ALUNO
          </button>
        </form>
      </div>
    </div>
  )
}