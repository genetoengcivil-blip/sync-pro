'use client'

import { LucideIcon } from 'lucide-react'

export function StatCard({ label, value, icon: Icon, color = "text-[#CCFF00]" }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="relative z-10">
        <p className="text-slate-500 text-[9px] font-black uppercase mb-1 tracking-widest">{label}</p>
        <h2 className={`text-4xl font-black italic ${color === 'text-red-500' ? 'text-red-500' : 'text-white'}`}>
          {value}
        </h2>
      </div>
      <Icon className={`absolute -right-6 -bottom-6 ${color} opacity-5 w-32 h-32 group-hover:scale-110 transition-transform`} />
    </div>
  )
}