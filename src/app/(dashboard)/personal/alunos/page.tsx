'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, User, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { StudentCard } from '@/components/personal/student-card'

export default function StudentsList() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadStudents() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('personal_id', user?.id)
        .order('full_name')
      
      setStudents(data || [])
      setLoading(false)
    }
    loadStudents()
  }, [])

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-70">Gestão de Clientes</p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">MEUS <span className="text-[#CCFF00]">ALUNOS</span></h1>
        </div>
        <Link href="/personal/alunos/novo" className="w-full md:w-auto bg-[#CCFF00] text-black px-8 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:scale-105 transition shadow-lg shadow-[#CCFF00]/10">
          <Plus size={18} strokeWidth={3} /> Cadastrar Aluno
        </Link>
      </header>

      {/* Barra de Busca */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#CCFF00] transition" size={20} />
        <input 
          type="text" 
          placeholder="BUSCAR ALUNO PELO NOME..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/40 border border-white/5 py-6 pl-16 pr-8 rounded-[2rem] text-sm font-bold outline-none focus:border-[#CCFF00]/40 transition-all placeholder:text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map(s => (
          <StudentCard key={s.id} student={s} />
        ))}
        {filteredStudents.length === 0 && (
          <div className="py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.5em]">Nenhum aluno encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}