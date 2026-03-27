'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, DollarSign, TrendingUp, Calendar, 
  ArrowUpCircle, ArrowDownCircle, Loader2, PieChart,
  ChevronRight, Download, Calculator
} from 'lucide-react'

export default function FinancialReport() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ projected: 0, real: 0, pending: 0 })
  const [annualData, setAnnualData] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => { loadFinancialData() }, [])

  async function loadFinancialData() {
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // 1. Busca todos os alunos para o "Previsto"
    const { data: students } = await supabase
      .from('students')
      .select('monthly_fee, payment_status')
      .eq('personal_id', user?.id)

    // 2. Busca histórico de pagamentos do ano atual
    const { data: logs } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('personal_id', user?.id)
      .eq('year', currentYear)

    // Cálculos Mensais
    let projected = 0
    let real = 0
    
    students?.forEach(s => {
      const fee = Number(s.monthly_fee) || 0
      projected += fee
      if (s.payment_status) real += fee
    })

    // Agrupamento Anual (Janeiro a Dezembro)
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    
    const yearlyMatrix = months.map((m, index) => {
      const monthLogs = logs?.filter(l => l.month === index + 1) || []
      const total = monthLogs.reduce((acc, curr) => acc + Number(curr.amount), 0)
      return { name: m, total }
    })

    setStats({ projected, real, pending: projected - real })
    setAnnualData(yearlyMatrix)
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white selection:bg-[#CCFF00]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Business<span className="text-[#CCFF00]">Hub</span></h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Gestão de Faturamento e Lucro</p>
          </div>
          <button className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-[#CCFF00] hover:text-black transition-all">
            <Download size={20} />
          </button>
        </header>

        {/* DASHBOARD MENSAL (PREVISTO VS REAL) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border-2 border-white/5 p-8 rounded-[3rem] relative overflow-hidden group">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento Previsto</p>
            <h2 className="text-4xl font-black text-white">R$ {stats.projected.toLocaleString()}</h2>
            <Calculator className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 group-hover:text-[#CCFF00]/10 transition-colors" />
          </div>

          <div className="bg-[#CCFF00] p-8 rounded-[3rem] relative overflow-hidden group">
            <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento Real (Pago)</p>
            <h2 className="text-4xl font-black text-black">R$ {stats.real.toLocaleString()}</h2>
            <ArrowUpCircle className="absolute -right-4 -bottom-4 text-black/10 w-24 h-24" />
          </div>

          <div className={`p-8 rounded-[3rem] border-2 relative overflow-hidden ${stats.pending > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-900 border-white/5'}`}>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Inadimplência (Pendente)</p>
            <h2 className={`text-4xl font-black ${stats.pending > 0 ? 'text-red-500' : 'text-white'}`}>R$ {stats.pending.toLocaleString()}</h2>
            <ArrowDownCircle className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24" />
          </div>
        </section>

        {/* RELATÓRIO ANUAL (GRÁFICO DE BARRAS) */}
        <section className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem]">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-[#CCFF00]" size={24} />
              <h3 className="text-sm font-black uppercase tracking-widest">Performance Anual ({new Date().getFullYear()})</h3>
            </div>
          </div>

          <div className="h-64 flex items-end gap-2 md:gap-4">
            {annualData.map((month, i) => {
              const maxVal = Math.max(...annualData.map(d => d.total)) || 1
              const height = (month.total / maxVal) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative flex flex-col justify-end h-full">
                    <div 
                      className="w-full bg-[#CCFF00]/5 group-hover:bg-[#CCFF00]/20 rounded-t-xl transition-all duration-500 relative"
                      style={{ height: `${height}%` }}
                    >
                      {month.total > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity">
                          R${month.total}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${month.total > 0 ? 'text-white' : 'text-slate-700'}`}>
                    {month.name}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* TABELA DE LUCRO REAL (IMPOSTO DE RENDA / CONTABILIDADE) */}
        <section className="bg-slate-900/50 border border-white/5 rounded-[3rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Mês Referência</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Total Recebido</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status Fiscal</th>
              </tr>
            </thead>
            <tbody>
              {annualData.filter(d => d.total > 0).map((d, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold text-sm">{d.name} / {new Date().getFullYear()}</td>
                  <td className="p-6 font-black text-[#CCFF00]">R$ {d.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-6 text-right">
                    <span className="text-[8px] font-black bg-white/5 px-3 py-1 rounded-full text-slate-400">DECLARÁVEL</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  )
}