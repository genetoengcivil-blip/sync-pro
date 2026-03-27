'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function StudentCard({ student }: { student: any }) {
  if (!student) return null;

  return (
    <Link 
      href={`/personal/alunos/${student.id}`} 
      className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-[#CCFF00]/40 transition-all"
    >
      <div className="flex items-center gap-5">
        <div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${student.payment_status ? 'bg-[#CCFF00] shadow-[#CCFF00]/40' : 'bg-red-500 shadow-red-500/40 animate-pulse'}`} />
        <div>
          <h4 className="font-black uppercase text-base group-hover:text-[#CCFF00] transition tracking-tight">
            {student.full_name}
          </h4>
          <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full text-slate-400 font-bold uppercase tracking-widest">
            {student.goal || 'Performance'}
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-700 group-hover:translate-x-1 group-hover:text-[#CCFF00] transition-all" />
    </Link>
  )
}