'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Plus, Trash2, DollarSign, Calendar, 
  Package, Check, Loader2, Sparkles, Zap
} from 'lucide-react'

export default function PlansManagement() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  // Estado do formulário
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    duration_months: 1
  })

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('personal_id', user?.id)
      .order('duration_months', { ascending: true })
    
    setPlans(data || [])
    setLoading(false)
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('plans').insert({
      personal_id: user?.id,
      name: newPlan.name,
      description: newPlan.description,
      price: parseFloat(newPlan.price),
      duration_months: newPlan.duration_months
    })

    if (!error) {
      setShowAddForm(false)
      setNewPlan({ name: '', description: '', price: '', duration_months: 1 })
      fetchPlans()
    }
    setIsSaving(false)
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Excluir este plano? Alunos atuais não serão afetados.')) return
    await supabase.from('plans').delete().eq('id', id)
    fetchPlans()
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <button onClick={() => router.push('/personal')} className="flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Painel SyncPro
        </button>

        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Meus<span className="text-[#CCFF00]">Planos</span></h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Configure seus pacotes de consultoria</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#CCFF00] text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
          >
            {showAddForm ? 'Cancelar' : <><Plus size={18} /> Novo Plano</>}
          </button>
        </header>

        {showAddForm && (
          <section className="bg-slate-900 border-2 border-[#CCFF00]/20 p-8 rounded-[3rem] animate-in zoom-in-95 duration-300">
            <form onSubmit={handleCreatePlan} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input required placeholder="Nome do Plano (Ex: Black Anual)" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-[#CCFF00]" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                <textarea placeholder="O que inclui? (Ex: Treino, Dieta, Suporte 24h)" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm min-h-[100px] resize-none" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-4">
                  <span className="text-slate-500 mr-2 text-sm font-black">R$</span>
                  <input required type="number" placeholder="Preço" className="bg-transparent border-none outline-none font-bold w-full" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
                </div>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-sm outline-none appearance-none" value={newPlan.duration_months} onChange={e => setNewPlan({...newPlan, duration_months: parseInt(e.target.value)})}>
                  <option value={1} className="bg-slate-900">Mensal (30 dias)</option>
                  <option value={3} className="bg-slate-900">Trimestral (90 dias)</option>
                  <option value={6} className="bg-slate-900">Semestral (180 dias)</option>
                  <option value={12} className="bg-slate-900">Anual (365 dias)</option>
                </select>
                <button disabled={isSaving} className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl uppercase tracking-widest text-xs">
                  {isSaving ? 'Processando...' : 'Criar Plano Premium'}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-slate-900 border border-white/5 p-8 rounded-[3.5rem] flex flex-col justify-between group hover:border-[#CCFF00]/30 transition-all shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#CCFF00]/10 p-3 rounded-2xl text-[#CCFF00]"><Package size={24} /></div>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-800 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 group-hover:text-[#CCFF00] transition">{plan.name}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-2xl font-black italic">R$ {plan.price}</span>
                  <span className="text-[10px] font-black text-slate-600 uppercase">/ {plan.duration_months === 1 ? 'Mês' : `${plan.duration_months} Meses`}</span>
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase"><Check size={12} className="text-[#CCFF00]" /> Link de Venda Ativo</div>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase"><Check size={12} className="text-[#CCFF00]" /> Renovação Manual</div>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-10 -bottom-10 bg-[#CCFF00]/5 w-32 h-32 rounded-full blur-3xl group-hover:bg-[#CCFF00]/10 transition-all" />
            </div>
          ))}
          
          {plans.length === 0 && !showAddForm && (
            <div className="col-span-full py-20 border-4 border-dashed border-white/5 rounded-[4rem] text-center">
              <Zap size={48} className="mx-auto text-slate-800 mb-4" />
              <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Você ainda não criou nenhum plano de consultoria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}