'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Dumbbell, Play, LogOut, Timer, Zap, Loader2, TrendingUp, 
  Flame, Bell, X, Medal, Trophy, MessageSquare, Send, BarChart3 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null)
  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [tip, setTip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTip, setShowTip] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  
  // Estados para Performance e Ranking
  const [weeklyVolume, setWeeklyVolume] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  
  const router = useRouter()

  useEffect(() => { fetchContent() }, [])

  async function fetchContent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: stData } = await supabase.from('students').select('*').eq('email', user.email).single()
    if (stData) {
      setStudent(stData)
      
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0,0,0,0)

      // Busca dados em paralelo, incluindo o Ranking via RPC
      const [wkData, tipData, sessions, volumeLogs, rankData] = await Promise.all([
        supabase.from('workout_plans').select('*').eq('student_id', stData.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('announcements').select('*').eq('personal_id', stData.personal_id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('workout_sessions').select('*', { count: 'exact' }).eq('student_id', stData.id).gte('completed_at', startOfMonth.toISOString()),
        supabase.from('exercise_logs').select(`load, created_at, workout_exercises ( sets, reps )`).eq('student_id', stData.id).order('created_at', { ascending: true }),
        supabase.rpc('get_student_ranking')
      ])

      if (wkData.data) {
        setWorkout(wkData.data)
        const { data: ex } = await supabase.from('workout_exercises').select('id, sets, reps, rest, exercises(name)').eq('workout_id', wkData.data.id).order('position')
        setExercises(ex || [])
      }
      
      if (tipData.data) setTip(tipData.data)
      setCompletedCount(sessions.count || 0)
      setRanking(rankData.data || [])

      if (volumeLogs.data) {
        processVolumeData(volumeLogs.data)
      }
    }
    setLoading(false)
  }

  const processVolumeData = (logs: any[]) => {
    const weeks: any = {}
    logs.forEach(log => {
      const date = new Date(log.created_at)
      const weekNumber = Math.ceil(date.getDate() / 7)
      const month = date.getMonth() + 1
      const key = `Sem. ${weekNumber}`
      
      const weight = parseFloat(log.load.replace(/[^0-9.]/g, '')) || 0
      const sets = parseInt(log.workout_exercises?.sets) || 0
      const reps = parseInt(log.workout_exercises?.reps) || 0
      const volume = weight * sets * reps

      weeks[key] = (weeks[key] || 0) + volume
    })

    const chartData = Object.keys(weeks).slice(-4).map(key => ({
      label: key,
      value: weeks[key]
    }))
    setWeeklyVolume(chartData)
  }

  const handleFinishWorkout = async () => {
    setIsFinishing(true)
    const { error } = await supabase.from('workout_sessions').insert({
      student_id: student.id,
      workout_plan_id: workout.id,
      feedback: feedbackText
    })

    if (!error) {
      setShowFeedbackModal(false)
      setFeedbackText('')
      fetchContent()
    }
    setIsFinishing(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  const goal = student?.monthly_goal || 12
  const progress = Math.min((completedCount / goal) * 100, 100)

  const getBadge = () => {
    if (progress >= 100) return { label: 'ELITE DIAMANTE', color: 'text-cyan-400', icon: <Trophy /> }
    if (progress >= 75) return { label: 'MESTRE OURO', color: 'text-yellow-400', icon: <Medal /> }
    if (progress >= 50) return { label: 'CONSTANTE PRATA', color: 'text-slate-300', icon: <Medal /> }
    return { label: 'INICIANTE BRONZE', color: 'text-orange-500', icon: <Medal /> }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white selection:bg-[#CCFF00] pb-32">
      
      <header className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Sync<span className="text-white/20">Pro</span></h1>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* GRÁFICO DE VOLUME SEMANAL (VTT) */}
      <section className="mb-10 bg-slate-900 border-2 border-white/5 p-8 rounded-[3rem] shadow-2xl overflow-hidden group">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#CCFF00] p-2 rounded-lg text-black"><BarChart3 size={18} /></div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Volume de Carga Semanal</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sets x Reps x Carga</p>
          </div>
        </div>
        <div className="h-40 flex items-end gap-3 px-2">
          {weeklyVolume.map((item, i) => {
            const maxVolume = Math.max(...weeklyVolume.map(v => v.value)) || 1
            const height = (item.value / maxVolume) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <div className="w-full relative h-full flex flex-col justify-end">
                  <div className="w-full bg-gradient-to-t from-[#CCFF00] to-[#00FAD9] rounded-t-xl transition-all duration-1000 shadow-[0_0_20px_rgba(204,255,0,0.2)]" style={{ height: `${height}%` }}></div>
                </div>
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ARENA SYNCPRO (RANKING) */}
      <section className="mb-10 bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 p-8 rounded-[3rem] shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-[#CCFF00]" size={20} />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Arena SyncPro: Top 3 da Semana</h3>
        </div>
        <div className="space-y-4">
          {ranking.slice(0, 3).map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-2xl ${index === 0 ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/20' : 'bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-black ${index === 0 ? 'text-[#CCFF00]' : 'text-slate-500'}`}>#{index + 1}</span>
                <p className="text-sm font-bold uppercase tracking-tighter">{item.full_name.split(' ')[0]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-500" />
                <span className="text-xs font-black">{item.session_count} Treinos</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS DE FREQUÊNCIA */}
      <section className="mb-10 bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`${getBadge().color}`}>{getBadge().icon}</div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${getBadge().color}`}>{getBadge().label}</span>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase">{completedCount} / {goal} TREINOS</span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </section>

      {tip && showTip && (
        <div className="mb-8 bg-[#CCFF00] text-black p-6 rounded-[2.5rem] relative shadow-lg">
          <div className="flex items-center gap-2 mb-2"><Bell size={14} fill="black" /><span className="text-[9px] font-black uppercase tracking-widest opacity-60">Dica do Personal</span></div>
          <h4 className="font-black uppercase tracking-tighter text-lg leading-tight">{tip.title}</h4>
          <p className="text-sm font-medium opacity-80 leading-tight mt-1">{tip.content}</p>
          <button onClick={() => setShowTip(false)} className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition"><X size={18} /></button>
        </div>
      )}

      {/* LISTA EXERCÍCIOS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4 mb-2">Treino de Hoje: {workout?.name}</h3>
        {exercises.map((item) => (
          <div key={item.id} onClick={() => router.push(`/aluno/exercicio/${item.id}`)} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex-1">
              <h4 className="text-lg font-black uppercase tracking-tighter group-hover:text-[#CCFF00] transition">{item.exercises.name}</h4>
              <div className="flex gap-4 mt-3 text-[10px] font-black uppercase text-slate-500">
                <span className="flex items-center gap-1"><Zap size={12} className="text-[#CCFF00]" /> {item.sets} x {item.reps}</span>
                <span className="flex items-center gap-1"><Timer size={12} className="text-[#00FAD9]" /> {item.rest}s</span>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
              <Play size={16} fill="currentColor" />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A] to-transparent z-50">
        <button onClick={() => setShowFeedbackModal(true)} className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl shadow-[0_20px_40px_rgba(204,255,0,0.2)] uppercase tracking-widest">
          FINALIZAR SESSÃO
        </button>
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border-2 border-white/5 p-10 rounded-[3rem] shadow-2xl text-center">
            <div className="bg-[#CCFF00]/10 w-16 h-16 rounded-full flex items-center justify-center text-[#CCFF00] mx-auto mb-6"><MessageSquare size={32} /></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-8">Fim do Treino!</h2>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-[#CCFF00] transition min-h-[120px] resize-none"
              placeholder="Como se sentiu? Alguma dor ou facilidade?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleFinishWorkout} disabled={isFinishing} className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl flex items-center justify-center gap-3">
                {isFinishing ? 'SALVANDO...' : 'ENVIAR FEEDBACK'}
                {!isFinishing && <Send size={18} />}
              </button>
              <button onClick={() => setShowFeedbackModal(false)} className="py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}