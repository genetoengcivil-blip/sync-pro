'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, BarChart3, TrendingUp, Users, 
  Flame, Calendar, Activity, Zap, Loader2,
  ChevronRight, Award, BrainCircuit
} from 'lucide-react'

export default function BIDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => { fetchBI() }, [])

  async function fetchBI() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: bi, error } = await supabase.rpc('get_bi_metrics', { p_personal_id: user?.id })
    
    if (bi) setData(bi)
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white selection:bg-[#CCFF00]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Sync<span className="text-[#CCFF00]">Insights</span></h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Inteligência de Dados para Treinadores de Elite</p>
          </div>
          <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-6 py-4 rounded-3xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-slate-500">Taxa de Retenção</p>
              <h4 className="text-2xl font-black text-[#CCFF00]">{data?.retention?.toFixed(1)}%</h4>
            </div>
            <Award className="text-[#CCFF00]" size={32} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAPA DE CALOR (ACADEMIA VIRTUAL LOTADA) */}
          <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-8 rounded-[3.5rem] relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500"><Activity size={20} /></div>
              <h3 className="text-xs font-black uppercase tracking-widest italic">Mapa de Calor: Pico de Treinos</h3>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-2 px-4">
              {data?.heatmap?.map((day: any, i: number) => {
                const max = Math.max(...data.heatmap.map((h: any) => h.session_count)) || 1
                const height = (day.session_count / max) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                    <div className="w-full relative flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-gradient-to-t from-orange-600 to-yellow-400 rounded-2xl transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] font-black">{day.session_count}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">{day.day_name.substring(0, 3)}</span>
                  </div>
                )
              })}
            </div>
            <Activity className="absolute -right-10 -bottom-10 opacity-5 w-48 h-48 pointer-events-none" />
          </div>

          {/* TOP EXERCÍCIOS & EVOLUÇÃO */}
          <div className="bg-slate-900 border border-white/5 p-8 rounded-[3.5rem] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-cyan-400/20 p-2 rounded-lg text-cyan-400"><Flame size={20} /></div>
                <h3 className="text-xs font-black uppercase tracking-widest italic">Top 5: Favoritos</h3>
              </div>
              
              <div className="space-y-6">
                {data?.top_exercises?.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tighter group-hover:text-cyan-400 transition">{ex.name}</span>
                      <div className="w-32 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-1000" 
                          style={{ width: `${(ex.frequency / data.top_exercises[0].frequency) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase">{ex.frequency}x</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl">
              <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Destaque</p>
              <p className="text-[10px] font-bold text-slate-400 leading-tight">O agachamento teve um aumento de carga médio de 12% este mês.</p>
            </div>
          </div>
        </div>

        {/* INSIGHTS DE IA (SIMULADOS) */}
        <section className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/20 p-10 rounded-[4rem] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="bg-indigo-500/20 p-6 rounded-full ring-8 ring-indigo-500/5">
              <BrainCircuit className="text-indigo-400" size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">SyncPro <span className="text-indigo-400">Smart Analysis</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="text-[#CCFF00] mt-1" size={16} />
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Sua taxa de retenção de **{data?.retention?.toFixed(1)}%** está acima da média do mercado (65%). Mantenha os feedbacks semanais.</p>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="text-orange-500 mt-1" size={16} />
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Terça-feira é o dia mais produtivo. Considere postar seus anúncios de marketing neste dia para maior engajamento.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}