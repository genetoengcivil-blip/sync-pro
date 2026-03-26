import Link from 'next/link'
import { Check, Zap, Trophy, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="bg-[#0F172A] text-white min-h-screen font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-[#CCFF00]">
            SYNC<span className="text-white">PRO</span>
          </div>
          <div className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Performance máxima para Personal Trainers
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32">
        <section className="px-6 py-12 max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold tracking-widest uppercase">
            Acesso Exclusivo via Nexano
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            SUA CONSULTORIA <br/>
            <span className="text-[#CCFF00]">ESCALÁVEL.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Abandone as planilhas. Gerencie centenas de alunos, prescreva treinos em segundos e automatize seu faturamento em um só lugar.
          </p>
        </section>

        {/* Seção de Preços / Ofertas */}
        <section className="px-6 py-20 bg-white/5 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Escolha seu plano</h2>
              <p className="text-slate-500">Acesso imediato após a confirmação do pagamento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano Mensal */}
              <div className="p-8 rounded-[2.5rem] bg-[#0F172A] border border-white/5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase text-slate-500">Mensal</span>
                    <Zap size={20} className="text-slate-600" />
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-black">R$ 97,00</span>
                    <span className="text-slate-500 text-sm"> /mês</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Alunos Ilimitados</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Prescrição via JSON</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Dashboard de Check-in</li>
                  </ul>
                </div>
                <Link 
                  href="https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=PADFFKA" 
                  className="w-full py-4 bg-white/5 text-white text-center font-bold rounded-2xl hover:bg-white/10 transition"
                >
                  Assinar Mensal
                </Link>
              </div>

              {/* Plano Semestral - DESTAQUE */}
              <div className="p-8 rounded-[2.5rem] bg-[#0F172A] border-2 border-[#CCFF00] flex flex-col justify-between relative shadow-[0_0_40px_-15px_rgba(204,255,0,0.3)] transform md:scale-105 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase">
                  Mais Popular
                </div>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase text-[#CCFF00]">Semestral</span>
                    <Star size={20} className="text-[#CCFF00]" />
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-black">R$ 497,00</span>
                    <span className="text-slate-500 text-sm text-block block mt-1">Economia de R$ 85,00</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-[#CCFF00]"/> Todos os recursos Pro</li>
                    <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-[#CCFF00]"/> Suporte Prioritário</li>
                    <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-[#CCFF00]"/> Selo de Verificado</li>
                  </ul>
                </div>
                <Link 
                  href="https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=5H1UXDY" 
                  className="w-full py-4 bg-[#CCFF00] text-black text-center font-black rounded-2xl hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition"
                >
                  Assinar Semestral
                </Link>
              </div>

              {/* Plano Anual */}
              <div className="p-8 rounded-[2.5rem] bg-[#0F172A] border border-white/5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase text-slate-500">Anual</span>
                    <Trophy size={20} className="text-slate-600" />
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-black">R$ 697,00</span>
                    <span className="text-slate-500 text-sm text-block block mt-1">Melhor Custo-Benefício</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Acesso Vitalício às atualizações</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Mentoria de Escala</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><Check size={16} className="text-[#CCFF00]"/> Menor preço por mês</li>
                  </ul>
                </div>
                <Link 
                  href="https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=W48813L" 
                  className="w-full py-4 bg-white/5 text-white text-center font-bold rounded-2xl hover:bg-white/10 transition"
                >
                  Assinar Anual
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Rápidas */}
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-[#CCFF00] text-3xl mb-4 font-black">01.</div>
              <h3 className="text-xl font-bold mb-2">Pague e Acesse</h3>
              <p className="text-slate-500 text-sm">Integração imediata com a Nexano para liberar seu dashboard na hora.</p>
            </div>
            <div>
              <div className="text-[#CCFF00] text-3xl mb-4 font-black">02.</div>
              <h3 className="text-xl font-bold mb-2">Conecte Alunos</h3>
              <p className="text-slate-500 text-sm">Seus alunos entram de graça com seu código exclusivo de Personal.</p>
            </div>
            <div>
              <div className="text-[#CCFF00] text-3xl mb-4 font-black">03.</div>
              <h3 className="text-xl font-bold mb-2">Foco em Resultado</h3>
              <p className="text-slate-500 text-sm">Dashboards que mostram quem está treinando e quem precisa de atenção.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase">
        &copy; 2026 SyncPro • Pagamentos Seguros via Nexano
      </footer>
    </div>
  )
}