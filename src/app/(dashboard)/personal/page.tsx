'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, TrendingUp, Plus, DollarSign, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/personal/stat-card'
import { StudentCard } from '@/components/personal/student-card'
//import { Student } from '@/types/database'

export default function PersonalDashboard() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [stats, setStats] = useState({ active: 0, pending: 0, revenue: 0 })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('students').select('*').eq('personal_id', user.id).order('full_name')
      
      const list = data || []
      setStudents(list)
      setStats({
        active: list.length,
        pending: list.filter(s => !s.payment_status).length,
        revenue: list.reduce((acc, s) => acc + (s.payment_status ? s.monthly_fee : 0), 0)
      })
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Management</p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">MEU <span className="text-[#CCFF00]">PAINEL</span></h1>
        </div>
        <Link href="/personal/alunos/novo" className="w-full md:w-auto bg-[#CCFF00] text-black px-8 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:scale-105 transition shadow-lg shadow-[#CCFF00]/10">
          <Plus size={18} strokeWidth={3} /> Novo Aluno
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Alunos Ativos" value={stats.active} icon={Users} />
        <StatCard label="Inadimplentes" value={stats.pending} icon={TrendingUp} color="text-red-500" />
        <StatCard label="Receita Mensal" value={`R$ ${stats.revenue}`} icon={DollarSign} color="text-black" />
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Listagem de Clientes</h3>
        <div className="grid grid-cols-1 gap-4">
          {students.map(s => <StudentCard key={s.id} student={s} />)}
        </div>
      </div>
    </div>
  )
}