"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { 
  Dumbbell, ArrowRight, Zap, BarChart3, 
  Users, DollarSign, Smartphone, Activity,
  ChevronDown, Star, Quote,
  Check, X, MessageCircle, TrendingUp, Award, Clock,
  GitBranch, Layers, Sparkles, Crown, Flame, Shield,
  HeartHandshake, Menu, X as XIcon, Play, Rocket,
  CheckCircle2, Globe, Volume2, VolumeX,
  Instagram, Linkedin, Github
} from 'lucide-react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'

// ========== TIPAGEM ==========
interface Plan {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonKey: 'mensal' | 'semestral' | 'anual'
  popular: boolean
  icon: React.ElementType
  savings: string
  color: string
}

interface Testimonial {
  name: string
  role: string
  text: string
  rating: number
  avatar: string
  achievement: string
}

interface Feature {
  icon: React.ElementType
  title: string
  desc: string
  color: string
  metric: string
  metricLabel: string
}

// ========== CONFIGURAÇÕES AVANÇADAS ==========
const CONFIG = {
  NAVBAR_HEIGHT: 80,
  SCROLL_THRESHOLD: 50,
  ANIMATION_DURATION: 0.5,
  STAGGER_CHILDREN: 0.1,
  PRICING_LINKS: {
    mensal: "https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=PADFFKA",
    semestral: "https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=5H1UXDY",
    anual: "https://checkout.nexano.com.br/checkout/cmn7t4m7206cu1xpdiesdei9d?offer=W48813L"
  },
  CONTACT: {
    email: "contato@syncpro.com.br",
    phone: "+55 (11) 99999-9999",
    whatsapp: "https://wa.me/5511999999999"
  },
  SOCIAL: {
    instagram: "https://instagram.com/syncpro",
    linkedin: "https://linkedin.com/company/syncpro",
    github: "https://github.com/syncpro"
  }
}

// ========== DADOS OTIMIZADOS ==========
const logos = [
  { name: "Nike", gradient: "from-red-500 to-orange-500", icon: "👟" },
  { name: "Adidas", gradient: "from-blue-500 to-cyan-500", icon: "👟" },
  { name: "SmartFit", gradient: "from-green-500 to-emerald-500", icon: "💪" },
  { name: "BioRitmo", gradient: "from-purple-500 to-pink-500", icon: "🧬" },
  { name: "Reebok", gradient: "from-yellow-500 to-orange-500", icon: "👟" },
  { name: "Puma", gradient: "from-gray-500 to-gray-700", icon: "🐆" }
]

const testimonials: Testimonial[] = [
  { 
    name: "Rodrigo Oliver", 
    role: "Elite Coach", 
    text: "O SyncPro não é um app, é uma vantagem competitiva desleal. Meus alunos sentem que estão em 2030.", 
    rating: 5, 
    avatar: "RO",
    achievement: "+230% faturamento"
  },
  { 
    name: "Beatriz Mello", 
    role: "Bodybuilder Pro", 
    text: "A automação financeira me devolveu 10 horas por semana. Dinheiro no bolso e paz mental.", 
    rating: 5, 
    avatar: "BM",
    achievement: "15h/semana economizadas"
  },
  { 
    name: "Caio Teixeira", 
    role: "Studio Owner", 
    text: "Saímos das planilhas para um sistema que respira performance. É o fim da era amadora.", 
    rating: 5, 
    avatar: "CT",
    achievement: "3x mais alunos"
  },
  { 
    name: "Sarah Jensen", 
    role: "Personal Online", 
    text: "O suporte e a interface são impecáveis. Meus alunos renovam só pela experiência do dashboard.", 
    rating: 5, 
    avatar: "SJ",
    achievement: "98% retenção"
  },
]

const features: Feature[] = [
  { icon: Zap, title: "Velocidade 10x", desc: "Prescrição de treinos em segundos com nossa engine inteligente.", color: "from-[#CCFF00] to-[#CCFF00]/50", metric: "3s", metricLabel: "tempo médio" },
  { icon: BarChart3, title: "BI Avançado", desc: "Gráficos preditivos que mostram onde seu negócio vai chegar.", color: "from-blue-500 to-cyan-500", metric: "12+", metricLabel: "métricas em tempo real" },
  { icon: Users, title: "Gestão em Massa", desc: "Gerencie centenas de alunos sem perder a qualidade do atendimento.", color: "from-purple-500 to-pink-500", metric: "500+", metricLabel: "alunos por profissional" },
  { icon: DollarSign, title: "Financeiro Automático", desc: "Cobrança recorrente e controle de inadimplência automatizado.", color: "from-green-500 to-emerald-500", metric: "99.9%", metricLabel: "de redução de inadimplência" },
]

const plans: Plan[] = [
  {
    name: "Mensal",
    price: 97,
    period: "/mês",
    description: "Perfeito para começar",
    features: ["Alunos Ilimitados", "Prescrição Inteligente", "Dashboard Completo", "Suporte por Email", "App Mobile"],
    buttonText: "Assinar Mensal",
    buttonKey: "mensal",
    popular: false,
    icon: Zap,
    savings: "",
    color: "from-gray-600 to-gray-800"
  },
  {
    name: "Semestral",
    price: 497,
    period: "/6 meses",
    description: "Escolha dos campeões",
    features: ["Alunos Ilimitados", "Prescrição Inteligente", "Dashboard Completo", "Suporte Prioritário 24/7", "Selo Verificado", "Workshops Exclusivos"],
    buttonText: "Assinar Semestral",
    buttonKey: "semestral",
    popular: true,
    icon: Crown,
    savings: "Economia de R$ 85",
    color: "from-[#CCFF00] to-[#FFA500]"
  },
  {
    name: "Anual",
    price: 697,
    period: "/ano",
    description: "Melhor custo-benefício",
    features: ["Alunos Ilimitados", "Prescrição Inteligente", "Dashboard Completo", "Suporte VIP 24/7", "Selo Platinum", "Workshops + Mentoria", "Eventos Exclusivos", "Acesso Vitalício Updates"],
    buttonText: "Assinar Anual",
    buttonKey: "anual",
    popular: false,
    icon: Award,
    savings: "2 meses grátis",
    color: "from-amber-500 to-orange-600"
  }
]

const stats = [
  { icon: Users, value: "500+", label: "Personal Trainers", trend: "+120%", trendUp: true, description: "Profissionais ativos" },
  { icon: TrendingUp, value: "R$2.5M+", label: "Faturado", trend: "+85%", trendUp: true, description: "Em receita gerada" },
  { icon: Award, value: "98%", label: "Satisfação", trend: "+12%", trendUp: true, description: "Taxa de retenção" },
  { icon: Clock, value: "15h+", label: "Economia Semanal", trend: "por profissional", trendUp: true, description: "De tempo recuperado" },
]

const comparisonFeatures = [
  { feature: "Interface Netflix", syncPro: true, others: false },
  { feature: "Cobrança Automática", syncPro: true, others: false },
  { feature: "Radar de Atividade", syncPro: true, others: false },
  { feature: "Gráficos de BI", syncPro: true, others: false },
  { feature: "Suporte 24/7", syncPro: true, others: false },
  { feature: "App White Label", syncPro: true, others: false },
  { feature: "IA de Prescrição", syncPro: true, others: false },
  { feature: "Análise Preditiva", syncPro: true, others: false },
]

const faqs = [
  { q: "O sistema gera PDF de treino?", a: "Sim, gera PDFs profissionais com QR Code para vídeos dos exercícios e link direto para o app. Seus alunos podem acessar de qualquer dispositivo." },
  { q: "Posso usar minha marca?", a: "Totalmente! O sistema é White-Label na versão Pro, permitindo suas cores, logo e domínio personalizado. Seus alunos verão sua marca em todo lugar." },
  { q: "Tem período de teste?", a: "Sim, você tem 7 dias de acesso total sem precisar de cartão de crédito. Teste todas as funcionalidades sem compromisso." },
  { q: "Como funciona o suporte?", a: "Suporte prioritário via WhatsApp e email para todos os planos. Tempo médio de resposta: 15 minutos. Equipe especializada em tecnologia fitness." },
  { q: "Meus alunos precisam pagar?", a: "Não! Seus alunos têm acesso gratuito ao app. Você paga apenas pela sua assinatura como profissional. Escale sem limites." },
]

// ========== COMPONENTES ANIMADOS ==========
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.21, 0.45, 0.27, 0.9] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// ========== COMPONENTES REUTILIZÁVEIS AVANÇADOS ==========
const SectionHeader = ({ icon: Icon, title, subtitle, badge, delay = 0 }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="text-center mb-16"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/5 mb-6"
      >
        <Icon size={12} className="text-[#CCFF00]" />
        <span className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider">{badge}</span>
      </motion.div>
      <h2 className="text-5xl font-black uppercase mb-4">
        {title}
        <motion.span 
          initial={{ backgroundPosition: "0% 50%" }}
          whileInView={{ backgroundPosition: "100% 50%" }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="block bg-gradient-to-r from-[#CCFF00] via-[#FFA500] to-[#CCFF00] bg-clip-text text-transparent bg-300%"
        >
          {subtitle}
        </motion.span>
      </h2>
    </motion.div>
  )
}

const AnimatedNumber = ({ value, duration = 2000, suffix = "", prefix = "" }: { value: number; duration?: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0
          const increment = value / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (elementRef.current) observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={elementRef}>
      {prefix}{count}{suffix}
    </span>
  )
}

const PricingCard = ({ plan, scrollToSection, index }: { plan: Plan; scrollToSection: any; index: number }) => {
  const Icon = plan.icon
  const pricePerMonth = plan.period === "/ano" ? (plan.price / 12).toFixed(0) : plan.period === "/6 meses" ? (plan.price / 6).toFixed(0) : plan.price

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className={`relative p-8 rounded-2xl transition-all duration-500 ${
        plan.popular 
          ? 'bg-gradient-to-br from-[#CCFF00]/10 to-[#CCFF00]/5 border-2 border-[#CCFF00] shadow-xl shadow-[#CCFF00]/20' 
          : 'bg-white/5 border border-white/10 hover:border-[#CCFF00]/40'
      }`}
    >
      {plan.popular && (
        <motion.div 
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-[#CCFF00] to-[#FFA500] text-black text-xs font-bold px-6 py-2 rounded-full flex items-center gap-2">
            <Flame size={14} className="animate-pulse" /> MAIS VENDIDO <Flame size={14} className="animate-pulse" />
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
          <p className="text-slate-500 text-sm">{plan.description}</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}
        >
          <Icon className="text-white" size={24} />
        </motion.div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold">R$ {plan.price}</span>
          <span className="text-slate-500">{plan.period}</span>
        </div>
        {plan.savings && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-[#CCFF00] mt-2 font-semibold flex items-center gap-1"
          >
            <Sparkles size={12} /> {plan.savings}
          </motion.div>
        )}
        <div className="text-xs text-slate-500 mt-2">
          {plan.period !== "/mês" && `Equivalente a R$ ${pricePerMonth}/mês`}
        </div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, idx) => (
          <motion.li 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-2 text-sm text-slate-300 group"
          >
            <CheckCircle2 size={16} className="text-[#CCFF00] flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
      
      <Link 
        href={CONFIG.PRICING_LINKS[plan.buttonKey]}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full py-3 text-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:ring-offset-2 focus:ring-offset-black group ${
          plan.popular 
            ? 'bg-[#CCFF00] text-black hover:scale-105 hover:shadow-lg hover:shadow-[#CCFF00]/25' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {plan.buttonText}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  )
}

// ========== COMPONENTE DE VÍDEO DE FUNDO ==========
const HeroVideoBackground = () => {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // URLs de vídeos gratuitos e funcionais (Pexels, Pixabay)
  const videoSources = [
    {
      url: "https://cdn.pixabay.com/video/2021/08/25/86765-591401265_large.mp4",
      type: "video/mp4"
    },
    {
      url: "https://cdn.pixabay.com/video/2020/10/12/52809-469092148_large.mp4",
      type: "video/mp4"
    },
    {
      url: "https://cdn.pixabay.com/video/2022/01/25/106070-672706791_large.mp4",
      type: "video/mp4"
    }
  ]

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoError = () => {
    console.log("Erro ao carregar vídeo, tentando próximo source...")
    setHasError(true)
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Overlay escuro para melhor contraste do texto */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Gradiente adicional para suavizar */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
      
      {/* Vídeo de fundo */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadedData={() => {
          console.log("Vídeo carregado com sucesso!")
          setIsVideoLoaded(true)
          setHasError(false)
        }}
        onError={handleVideoError}
      >
        {!hasError && (
          <>
            <source src={videoSources[0].url} type={videoSources[0].type} />
            <source src={videoSources[1].url} type={videoSources[1].type} />
            <source src={videoSources[2].url} type={videoSources[2].type} />
          </>
        )}
      </video>
      
      {/* Fallback com imagem estática se o vídeo não carregar */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      )}
      
      {/* Indicador de loading enquanto o vídeo carrega */}
      {!isVideoLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-16 h-16 border-4 border-[#CCFF00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Botão para controlar o som */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-300 group"
        aria-label={isMuted ? "Ativar som" : "Desativar som"}
      >
        {isMuted ? (
          <VolumeX size={20} className="text-white group-hover:text-[#CCFF00] transition-colors" />
        ) : (
          <Volume2 size={20} className="text-white group-hover:text-[#CCFF00] transition-colors" />
        )}
      </button>
    </div>
  )
}

// ========== COMPONENTE PRINCIPAL ==========
export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > CONFIG.SCROLL_THRESHOLD)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - CONFIG.NAVBAR_HEIGHT,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false)
  }, [])

  const navItems = useMemo(() => [
    { name: "Planos", id: "planos" },
    { name: "Recursos", id: "features" },
    { name: "Vs Old", id: "compare" },
    { name: "Depoimentos", id: "testimonials" },
    { name: "FAQ", id: "faq" },
  ], [])

  return (
    <MotionConfig transition={{ duration: 0.3 }}>
      <div className="bg-black text-white font-sans overflow-x-hidden">
        {/* Cursor personalizado */}
        <div 
          className="fixed w-8 h-8 pointer-events-none z-[100] hidden lg:block"
          style={{
            transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-[#CCFF00] opacity-50"></div>
        </div>
        
        {/* Navbar */}
        <motion.nav 
          style={{ opacity }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-[#CCFF00]/20 py-3 shadow-2xl' : 'bg-transparent py-5'
          }`}
          aria-label="Navegação principal"
        >
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Página inicial">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <Dumbbell size={28} className="text-[#CCFF00]" />
                <motion.div 
                  className="absolute inset-0 bg-[#CCFF00] blur-xl opacity-0 group-hover:opacity-50 transition-opacity rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-2xl font-bold tracking-tight">SYNC<span className="text-[#CCFF00]">PRO</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className="relative text-sm text-white/70 hover:text-[#CCFF00] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] rounded px-2 py-1 group"
                >
                  {item.name}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#CCFF00]"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </a>
              ))}
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCFF00] transition-all"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <div className="bg-black/95 backdrop-blur-xl border-t border-[#CCFF00]/20 py-4">
                  <div className="flex flex-col px-6 space-y-3">
                    {navItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => scrollToSection(e, item.id)}
                        className="text-white/70 hover:text-[#CCFF00] py-3 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#CCFF00] rounded px-2 border-l-2 border-transparent hover:border-[#CCFF00]"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        <main>
          {/* Hero Section com Vídeo de Fundo */}
          <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-32 overflow-hidden">
            <HeroVideoBackground />
            
            <div className="relative z-20 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#CCFF00]/30 bg-black/40 backdrop-blur-sm mb-8"
              >
                <Rocket size={14} className="text-[#CCFF00]" />
                <span className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider">+500 Personal Trainers já transformaram seus negócios</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-8"
              >
                ELEVE SUA
                <br />
                <motion.span 
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: "100% 50%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="bg-gradient-to-r from-[#CCFF00] via-[#FFA500] to-[#CCFF00] bg-clip-text text-transparent bg-300%"
                >
                  PERFORMANCE
                </motion.span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-slate-200 max-w-2xl mx-auto mb-12"
              >
                A plataforma definitiva para Personal Trainers que querem escalar sua consultoria, 
                automatizar processos e multiplicar seus resultados.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#planos" 
                  onClick={(e) => scrollToSection(e, 'planos')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#CCFF00] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#CCFF00]/25 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:ring-offset-2 focus:ring-offset-black group"
                >
                  Começar Agora
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-[#CCFF00]/50"
                >
                  <Play size={18} />
                  Ver Demo
                </motion.a>
              </motion.div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 px-6 border-y border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {stats.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <motion.div 
                      key={i}
                      variants={fadeInUp}
                      className="text-center group cursor-pointer"
                      onMouseEnter={() => setHoveredStat(i)}
                      onMouseLeave={() => setHoveredStat(null)}
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ 
                            scale: hoveredStat === i ? 1.1 : 1,
                            rotate: hoveredStat === i ? 3 : 0
                          }}
                        >
                          <Icon className={`w-10 h-10 text-[#CCFF00] mx-auto mb-3 transition-all duration-300`} />
                        </motion.div>
                        {stat.trend && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: hoveredStat === i ? 1 : 0, y: hoveredStat === i ? 0 : -10 }}
                            className={`absolute -top-2 -right-2 text-xs font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {stat.trend}
                          </motion.div>
                        )}
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {stat.value.includes('+') ? (
                          <>
                            <AnimatedNumber value={parseInt(stat.value)} />+
                          </>
                        ) : stat.value.includes('R$') ? (
                          stat.value
                        ) : (
                          <AnimatedNumber value={parseInt(stat.value)} />
                        )}
                        {stat.value.includes('%') && !stat.value.includes('+') && '%'}
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: hoveredStat === i ? 1 : 0, height: hoveredStat === i ? "auto" : 0 }}
                        className="text-[10px] text-slate-500 mt-1 overflow-hidden"
                      >
                        {stat.description}
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </section>

          {/* Logo Cloud */}
          <div className="max-w-7xl mx-auto px-6 py-20">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-12 md:gap-16"
            >
              {logos.map((logo, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="group cursor-pointer"
                >
                  <span className={`text-2xl font-bold uppercase bg-gradient-to-r ${logo.gradient} bg-clip-text text-transparent opacity-70 group-hover:opacity-100 transition-all duration-300 inline-block`}>
                    {logo.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Planos */}
          <section id="planos" className="py-32 px-6 bg-gradient-to-b from-black to-[#CCFF00]/5 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                icon={Crown}
                title="Invista no seu"
                subtitle="Pico de Performance"
                badge="Planos que cabem no seu bolso"
              />
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-slate-400 text-lg max-w-2xl mx-auto text-center mb-16"
              >
                Escolha o plano ideal para sua jornada e comece a escalar hoje mesmo
              </motion.p>

              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                  <PricingCard key={i} plan={plan} scrollToSection={scrollToSection} index={i} />
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mt-12"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#CCFF00]/30 transition-all">
                  <Shield size={16} className="text-[#CCFF00]" />
                  <p className="text-slate-400 text-sm">Pagamento 100% seguro via Nexano • Cancele quando quiser</p>
                  <HeartHandshake size={16} className="text-[#CCFF00]" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-32 px-6 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                icon={Flame}
                title="Ferramentas que vão"
                subtitle="potencializar seus resultados"
                badge="Tecnologia de Ponta"
              />

              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {features.map((feature, i) => {
                  const Icon = feature.icon
                  return (
                    <motion.div 
                      key={i}
                      variants={fadeInUp}
                      whileHover={{ y: -10 }}
                      className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#CCFF00]/40 hover:bg-white/10 transition-all duration-500 text-center"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 mx-auto shadow-lg`}
                      >
                        <Icon className="w-full h-full text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-[#CCFF00] transition-colors">{feature.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">{feature.desc}</p>
                      {feature.metric && (
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          whileHover={{ scale: 1 }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold"
                        >
                          <TrendingUp size={12} />
                          {feature.metric} {feature.metricLabel}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </section>

          {/* Bento Grid */}
          <section className="py-32 px-6 bg-gradient-to-b from-black to-[#CCFF00]/5">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-6"
              >
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 hover:border-[#CCFF00]/30 transition-all duration-500"
                >
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#CCFF00] transition-colors">Financeiro Inteligente</h3>
                  <p className="text-slate-400 mb-8">Controle cada centavo com dashboards de BI que mostram seu crescimento real.</p>
                  <div className="flex justify-between items-end h-64 gap-2">
                    {[40, 70, 45, 90, 65, 100, 85].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="relative w-full group/chart"
                      >
                        <div 
                          className="w-full bg-gradient-to-t from-[#CCFF00] to-[#CCFF00]/50 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ height: `${h}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black text-xs px-2 py-1 rounded opacity-0 group-hover/chart:opacity-100 transition-opacity whitespace-nowrap">
                            {h}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 hover:border-[#CCFF00]/30 transition-all duration-500"
                >
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#CCFF00] transition-colors">Radar Live</h3>
                  <p className="text-slate-400 mb-6">Notificações em tempo real de atividade dos alunos</p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity size={48} className="text-[#CCFF00] mb-6" />
                  </motion.div>
                  <div className="space-y-3">
                    {['João finalizou treino', 'Maria fez check-in', 'Carlos bateu recorde'].map((activity, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <Check size={14} className="text-[#CCFF00]" />
                        <span>{activity}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 hover:border-[#CCFF00]/30 transition-all duration-500"
                >
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#CCFF00] transition-colors">Multi-Platform</h3>
                  <p className="text-slate-400 mb-6">Web App otimizado para iOS, Android e Desktop</p>
                  <div className="flex gap-6 justify-center">
                    <motion.div whileHover={{ scale: 1.2, y: -5 }}>
                      <Smartphone size={48} className="text-blue-400 hover:text-[#CCFF00] transition-colors cursor-pointer" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.2, y: -5 }}>
                      <Globe size={48} className="text-purple-400 hover:text-[#CCFF00] transition-colors cursor-pointer" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.2, y: -5 }}>
                      <Layers size={48} className="text-green-400 hover:text-[#CCFF00] transition-colors cursor-pointer" />
                    </motion.div>
                  </div>
                  <div className="mt-6 text-center text-xs text-slate-500">
                    Disponível em todas as plataformas
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Comparison */}
          <section id="compare" className="py-32 px-6 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              <SectionHeader 
                icon={GitBranch}
                title="SyncPro vs"
                subtitle="O Resto"
                badge="The Truth"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/5 to-transparent"
              >
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#CCFF00]/10 to-transparent">
                    <tr className="border-b border-white/10">
                      <th className="p-6 text-left text-xs font-bold uppercase tracking-wider">Feature</th>
                      <th className="p-6 text-left text-xs font-bold uppercase tracking-wider text-[#CCFF00]">SyncPro OS</th>
                      <th className="p-6 text-left text-xs font-bold uppercase tracking-wider text-slate-600">O Resto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-6 text-slate-300 font-medium">{row.feature}</td>
                        <td className="p-6 text-[#CCFF00]">
                          {row.syncPro ? <CheckCircle2 size={20} className="animate-in fade-in" /> : <X size={20} />}
                        </td>
                        <td className="p-6 text-slate-600">
                          {row.others ? <Check size={20} /> : <X size={20} />}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-32 px-6 bg-gradient-to-b from-[#CCFF00]/5 to-transparent scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                icon={Star}
                title="O que dizem"
                subtitle="nossos clientes"
                badge="Trusted by the best"
              />
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10 hover:border-[#CCFF00]/30 transition-all duration-500"
                  >
                    <Quote size={32} className="text-[#CCFF00] opacity-30 mb-4 group-hover:opacity-50 transition-opacity" />
                    <p className="text-sm mb-4 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CCFF00] to-blue-500 flex items-center justify-center text-black font-bold shadow-lg"
                      >
                        {t.avatar}
                      </motion.div>
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-[#CCFF00]">{t.role}</p>
                      </div>
                    </div>
                    {t.achievement && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1 text-xs text-[#CCFF00] font-semibold"
                      >
                        <TrendingUp size={12} />
                        {t.achievement}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-32 px-6 scroll-mt-20">
            <div className="max-w-3xl mx-auto">
              <SectionHeader 
                icon={MessageCircle}
                title="Dúvidas"
                subtitle="Frequentes"
                badge="Questions?"
              />
              
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border border-white/10 rounded-2xl overflow-hidden hover:border-[#CCFF00]/30 transition-all duration-300"
                  >
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)} 
                      className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-all group focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                      aria-expanded={activeFaq === i}
                    >
                      <span className="font-bold group-hover:text-[#CCFF00] transition-colors text-left flex-1">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: activeFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="p-6 pt-0 text-slate-400 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-32 px-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/5 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.1),transparent_70%)]"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto relative z-10"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 45 }}
                className="w-24 h-24 bg-gradient-to-br from-[#CCFF00] to-[#FFA500] rounded-2xl rotate-45 mx-auto mb-8 flex items-center justify-center"
              >
                <Dumbbell className="w-12 h-12 text-black -rotate-45" />
              </motion.div>
              
              <h2 className="text-5xl md:text-7xl font-black uppercase mb-6">
                Pronto para alcançar o
                <span className="block bg-gradient-to-r from-[#CCFF00] to-[#FFA500] bg-clip-text text-transparent">próximo nível?</span>
              </h2>
              
              <p className="text-xl text-slate-400 mb-10">
                Junte-se a centenas de profissionais que já estão faturando mais com menos trabalho
              </p>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 mb-8"
              >
                <div className="flex -space-x-2">
                  {['RO', 'BM', 'CT', 'SJ'].map((initial, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CCFF00] to-blue-500 flex items-center justify-center text-black text-xs font-bold border-2 border-black"
                    >
                      {initial}
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs text-[#CCFF00]">+500 profissionais</span>
              </motion.div>
              
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#planos" 
                onClick={(e) => scrollToSection(e, 'planos')}
                className="inline-flex items-center gap-3 px-12 py-5 bg-[#CCFF00] text-black font-bold rounded-2xl text-lg hover:shadow-2xl hover:shadow-[#CCFF00]/25 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:ring-offset-2 focus:ring-offset-black group"
              >
                Começar minha transformação
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm group">
                  <Shield size={16} className="text-[#CCFF00] group-hover:scale-110 transition-transform" />
                  Pagamento Seguro
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm group">
                  <HeartHandshake size={16} className="text-[#CCFF00] group-hover:scale-110 transition-transform" />
                  Sem Fidelidade
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm group">
                  <Clock size={16} className="text-[#CCFF00] group-hover:scale-110 transition-transform" />
                  Suporte 24/7
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell size={24} className="text-[#CCFF00]" />
                  <span className="text-xl font-bold">SYNC<span className="text-[#CCFF00]">PRO</span></span>
                </div>
                <p className="text-slate-500 text-sm">Elite Operating System for Personal Trainers</p>
                <div className="flex gap-4 mt-4">
                  <a href={CONFIG.SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#CCFF00] transition-colors">
                    <Instagram size={20} />
                  </a>
                  <a href={CONFIG.SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#CCFF00] transition-colors">
                    <Linkedin size={20} />
                  </a>
                  <a href={CONFIG.SOCIAL.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#CCFF00] transition-colors">
                    <Github size={20} />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Produto</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-[#CCFF00] transition-colors">Recursos</a></li>
                  <li><a href="#planos" onClick={(e) => scrollToSection(e, 'planos')} className="hover:text-[#CCFF00] transition-colors">Preços</a></li>
                  <li><a href="#compare" onClick={(e) => scrollToSection(e, 'compare')} className="hover:text-[#CCFF00] transition-colors">Comparação</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Suporte</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-[#CCFF00] transition-colors">FAQ</a></li>
                  <li><a href={CONFIG.CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#CCFF00] transition-colors">WhatsApp</a></li>
                  <li><a href={`mailto:${CONFIG.CONTACT.email}`} className="hover:text-[#CCFF00] transition-colors">Email</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-[#CCFF00] transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="hover:text-[#CCFF00] transition-colors">Política de Privacidade</a></li>
                  <li><a href="#" className="hover:text-[#CCFF00] transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 text-center">
              <p className="text-slate-600 text-xs">© 2026 SyncPro - Transformando carreiras | Powered by Nexano</p>
            </div>
          </div>
        </footer>

        <style jsx global>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .bg-300% {
            background-size: 300% auto;
          }
          .animate-gradient {
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </div>
    </MotionConfig>
  )
}