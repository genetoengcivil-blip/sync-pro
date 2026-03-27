'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, Plus, Phone, Target, 
  Loader2, TrendingUp, Activity, Clock, Share2, 
  Dumbbell, CheckCircle2, Trophy, Calendar, Zap,
  MessageSquare, Trash2, ChevronRight, Scale, DollarSign
} from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function StudentProfile() {
  const { id } = useParams()
  const router = useRouter()
  
  // 1. TODOS OS HOOKS DEVEM FICAR NO TOPO
  const [student, setStudent] = useState<any>(null)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [todayLogs, setTodayLogs] = useState<any[]>([])
  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [sessionCount, setSessionCount] = useState(0)
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([])
  const [evolution, setEvolution] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [targetLoad, setTargetLoad] = useState('')
  const [monthlyGoal, setMonthlyGoal] = useState(12)
  const [paymentStatus, setPaymentStatus] = useState(false)
  const [monthlyFee, setMonthlyFee] = useState('0')
  const [paymentDay, setPaymentDay] = useState(10)

  // Carregamento de dados
  useEffect(() => {
    if (!id) return
    loadAllData()
  }, [id])

  // Radar Live
  useEffect(() => {
    if (!id) return
    const fetchLiveToday = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('exercise_logs')
        .select(`load, created_at, workout_exercises(exercises(name))`)
        .eq('student_id', id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
      if (data) setTodayLogs(data)
    }
    fetchLiveToday()
    const interval = setInterval(fetchLiveToday, 20000)
    return () => clearInterval(interval)
  }, [id])

  async function loadAllData() {
    try {
      setLoading(true)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0,0,0,0)

      const [st, wk, ss, fb, evo] = await Promise.all([
        supabase.from('students').select('*').eq('id', id).single(),
        supabase.from('workout_plans').select('*').eq('student_id', id).order('created_at', { ascending: false }),
        supabase.from('workout_sessions').select('*', { count: 'exact' }).eq('student_id', id).gte('completed_at', startOfMonth.toISOString()),
        supabase.from('workout_sessions').select('feedback, completed_at').eq('student_id', id).not('feedback', 'is', null).order('completed_at', { ascending: false }).limit(3),
        supabase.from('body_evolution').select('*').eq('student_id', id).order('created_at', { ascending: false })
      ])

      if (st.data) {
        const s = st.data
        setStudent(s)
        setTargetLoad(s.target_load || '')
        setMonthlyGoal(s.monthly_goal || 12)
        setPaymentStatus(s.payment_status || false)
        setMonthlyFee(s.monthly_fee?.toString() || '0')
        setPaymentDay(s.payment_day || 10)
      }

      setWorkouts(wk.data || [])
      setSessionCount(ss.count || 0)
      setRecentFeedbacks(fb.data || [])
      setEvolution(evo.data || [])

      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      const { data: logs } = await supabase
        .from('exercise_logs')
        .select(`load, created_at, workout_exercises(exercises(name))`)
        .eq('student_id', id)
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      setEvolutionData(logs || [])
    } catch (err) {
      console.error("Erro ao carregar:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePayment = async () => {
    setIsUpdating(true)
    const newStatus = !paymentStatus
    const { data: { user } } = await supabase.auth.getUser()

    try {
      if (newStatus === true) {
        const now = new Date()
        await supabase.from('payment_logs').insert({
          student_id: id,
          personal_id: user?.id,
          amount: parseFloat(monthlyFee),
          month: now.getMonth() + 1,
          year: now.getFullYear()
        })
      }
      await supabase.from('students').update({ payment_status: newStatus }).eq('id', id)
      setPaymentStatus(newStatus)
    } catch (error) {
      alert('Erro ao atualizar.')
    } finally {
      setIsUpdating(false)
    }
  }

  // 2. RETORNOS CONDICIONAIS SÓ DEPOIS DOS HOOKS
  if (loading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white">
        <p className="mb-4 opacity-50 uppercase font-black text-xs tracking-widest">Aluno não encontrado</p>
        <button onClick={() => router.push('/personal')} className="text-[#CCFF00] font-black text-xs uppercase tracking-widest">Voltar</button>
      </div>
    )
  }

  // 3. AGORA OS CÁLCULOS PODEM USAR O OBJETO STUDENT COM SEGURANÇA
  const lastLoadValue = parseInt(evolutionData[evolutionData.length - 1]?.load) || 0
  const loadProgress = parseInt(targetLoad) > 0 ? Math.min((lastLoadValue / parseInt(targetLoad)) * 100, 100) : 0
  const freqProgress = Math.min((sessionCount / monthlyGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white selection:bg-[#CCFF00]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <button onClick={() => router.push('/personal')} className="group flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        {/* HEADER DINÂMICO */}
        <section className={`p-10 rounded-[3.5rem] relative overflow-hidden shadow-2xl transition-colors duration-500 ${!paymentStatus ? 'bg-red-600' : 'bg-[#CCFF00] text-black'}`}>
          <div className="relative z-10">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-10">{student.full_name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col"><span className="text-[9px] font-black uppercase opacity-40 mb-1">Status</span><span className="font-black text-sm uppercase">{paymentStatus ? 'PAGO' : 'PENDENTE'}</span></div>
              <div className="flex flex-col"><span className="text-[9px] font-black uppercase opacity-40 mb-1">WhatsApp</span><a href={`https://wa.me/${student.phone?.replace(/\D/g, '')}`} target="_blank" className="font-bold text-sm underline italic">CONTATO</a></div>
              <div className="flex flex-col"><span className="text-[9px] font-black uppercase opacity-40 mb-1">Frequência</span><span className="font-black text-sm">{sessionCount} / {monthlyGoal}</span></div>
              <div className="flex flex-col"><span className="text-[9px] font-black uppercase opacity-40 mb-1">Objetivo</span><span className="font-black text-sm uppercase">{student.goal}</span></div>
            </div>
          </div>
          <Activity className="absolute -right-10 -bottom-10 opacity-10 w-64 h-64" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-slate-900 border-2 border-white/5 p-8 rounded-[3rem] shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="text-[#CCFF00]" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Mensalidade</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <input type="number" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-[#CCFF00]" />
                <input type="number" value={paymentDay} onChange={e => setPaymentDay(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-[#CCFF00]" />
              </div>
              <button 
                onClick={handleTogglePayment}
                disabled={isUpdating}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${paymentStatus ? 'bg-[#CCFF00] text-black shadow-[0_10px_30px_rgba(204,255,0,0.1)]' : 'bg-red-500 text-white'}`}
              >
                {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20} /> : (paymentStatus ? '✅ PAGAMENTO RECEBIDO' : 'CONFIRMAR RECEBIMENTO')}
              </button>
            </section>

            <section className="bg-slate-900 border-2 border-white/5 p-8 rounded-[3rem]">
              <div className="flex items-center gap-2 mb-8 px-2">
                <Scale className="text-[#CCFF00]" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Evolução Corporal</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {evolution.length === 0 ? <div className="col-span-full py-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-slate-700 font-black uppercase text-[10px]">Sem fotos</div> : (
                  evolution.map((item, i) => (
                    <div key={i} className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-[#CCFF00]/40 transition shadow-lg">
                      <img src={item.photo_url} className="w-full aspect-[3/4] object-cover group-hover:scale-110 transition duration-500" />
                      <div className="p-3 text-center bg-black/40">
                        <p className="text-xs font-black text-[#CCFF00]">{item.weight}kg</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Planilhas</h3>
              <Link href={`/personal/treinos/novo?studentId=${id}`} className="bg-[#CCFF00] text-black p-2 rounded-lg hover:scale-110 transition-transform"><Plus size={18} /></Link>
            </div>
            
            <div className="space-y-4">
              {workouts.length === 0 ? <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center italic text-slate-600 text-[10px] font-black uppercase">Nenhuma ficha</div> : workouts.map(wk => (
                <div key={wk.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-[#CCFF00]/30 transition-all">
                  <div>
                    <h4 className="font-black uppercase tracking-tighter text-sm mb-1">{wk.name}</h4>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">{new Date(wk.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-800" />
                </div>
              ))}
            </div>

            <section className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Radar Live</h3>
              </div>
              <div className="space-y-4">
                {todayLogs.length === 0 ? <p className="text-slate-700 text-[10px] font-black uppercase italic">Sem atividade hoje</p> : todayLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border-l-2 border-[#CCFF00]">
                    <div><p className="text-[8px] font-black text-slate-500 uppercase">{log.workout_exercises?.exercises?.name}</p><p className="text-lg font-black">{log.load}</p></div>
                    <Clock size={14} className="text-slate-800" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}