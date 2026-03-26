import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-[#CCFF00]">
            SYNC<span className="text-white">PRO</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition">
              Entrar
            </Link>
            <Link href="/login" className="bg-[#CCFF00] text-black px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 transition active:scale-95">
              COMEÇAR AGORA
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 pt-32">
        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold tracking-widest uppercase">
            O Futuro da Consultoria Fitness
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            SUA CARREIRA <br/>
            <span className="text-[#CCFF00]">SEM LIMITES.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            A plataforma definitiva para Personal Trainers que desejam escala, profissionalismo e resultados reais.
          </p>
          <Link href="/login" className="inline-block bg-[#CCFF00] text-black px-12 py-5 rounded-2xl text-lg font-black shadow-[0_0_50px_-12px_rgba(204,255,0,0.5)] hover:shadow-[#CCFF00]/40 transition-all">
            QUERO ME TORNAR SYNCPRO
          </Link>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24 bg-white/5">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-[#0F172A] border border-white/5 hover:border-[#CCFF00]/50 transition-colors group">
              <div className="w-12 h-12 bg-[#CCFF00] rounded-xl flex items-center justify-center text-black mb-6 group-hover:rotate-12 transition-transform">
                <span className="text-2xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Gestão Ágil</h3>
              <p className="text-slate-400 leading-relaxed">Prescreva treinos complexos em segundos com nossa interface otimizada para alta performance.</p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-[#0F172A] border border-white/5 hover:border-[#CCFF00]/50 transition-colors group">
              <div className="w-12 h-12 bg-[#CCFF00] rounded-xl flex items-center justify-center text-black mb-6 group-hover:rotate-12 transition-transform">
                <span className="text-2xl font-bold">💎</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Branding Premium</h3>
              <p className="text-slate-400 leading-relaxed">Entregue um aplicativo exclusivo para seus alunos, aumentando seu valor percebido no mercado.</p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-[#0F172A] border border-white/5 hover:border-[#CCFF00]/50 transition-colors group">
              <div className="w-12 h-12 bg-[#CCFF00] rounded-xl flex items-center justify-center text-black mb-6 group-hover:rotate-12 transition-transform">
                <span className="text-2xl font-bold">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Métricas de Check-in</h3>
              <p className="text-slate-400 leading-relaxed">Saiba exatamente quem está treinando e receba alertas de alunos inativos automaticamente.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-xs font-medium tracking-widest uppercase">
        &copy; 2026 SyncPro SaaS • Built for Performance
      </footer>
    </div>
  )
}