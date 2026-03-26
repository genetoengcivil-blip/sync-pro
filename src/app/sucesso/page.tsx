import Link from 'next/link'
import { CheckCircle, Lock, Mail, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 rounded-[3rem] p-10 border border-[#CCFF00]/20 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#CCFF00]/10 p-4 rounded-full">
            <CheckCircle size={60} className="text-[#CCFF00]" />
          </div>
        </div>

        <h1 className="text-4xl font-black mb-4 tracking-tighter">PAGAMENTO APROVADO!</h1>
        <p className="text-slate-400 mb-10">Sua conta SyncPro já foi gerada. Siga os passos abaixo para acessar:</p>

        <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3 text-[#CCFF00]">
              <Mail size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">Usuário</span>
            </div>
            <p className="text-sm text-slate-300">Use o seu <span className="text-white font-bold">E-mail</span> cadastrado na Nexano.</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3 text-[#CCFF00]">
              <Lock size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">Senha Inicial</span>
            </div>
            <p className="text-sm text-slate-300">Use o seu <span className="text-white font-bold">CPF</span> (apenas números) como senha.</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-10">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-tighter">
            ⚠️ Por segurança, você deverá alterar sua senha logo após o primeiro acesso.
          </p>
        </div>

        <Link 
          href="/login" 
          className="group w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition shadow-lg shadow-[#CCFF00]/10"
        >
          ACESSAR MEU DASHBOARD
          <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  )
}