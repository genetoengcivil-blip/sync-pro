'use client'

import { useState } from 'react'
import { 
  Users, Dumbbell, DollarSign, Settings, 
  LogOut, Menu, X, Zap, Home 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { name: 'Início', icon: Home, href: '/personal' },
    { name: 'Meus Alunos', icon: Users, href: '/personal/alunos' },
    { name: 'Exercícios', icon: Dumbbell, href: '/personal/exercicios' },
    { name: 'Financeiro', icon: DollarSign, href: '/personal/financeiro' },
    { name: 'Configurações', icon: Settings, href: '/personal/config' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Botão Mobile (Hambúrguer) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-50 p-3 bg-[#CCFF00] text-black rounded-2xl shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Principal */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#0F172A] border-r border-white/5 p-8 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-12">
            <h2 className="text-3xl font-black italic tracking-tighter text-white">
              SYNC<span className="text-[#CCFF00]">PRO</span>
            </h2>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                    ${isActive 
                      ? 'bg-[#CCFF00] text-black shadow-[0_10px_20px_rgba(204,255,0,0.1)]' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Botão Sair */}
          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-4 px-6 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Overlay para fechar no mobile ao clicar fora */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  )
}