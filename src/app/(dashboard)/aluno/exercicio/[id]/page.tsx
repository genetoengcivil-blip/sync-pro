'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Play, Save, Dumbbell, Info, 
  Loader2, History, Timer, Zap, Clock, CheckCircle2, Video,
  HelpCircle, TrendingUp, Calculator
} from 'lucide-react'

export default function ExerciseExecutionPage() {
  const { id } = useParams()
  const router = useRouter()
  
  // Estados de Dados
  const [data, setData] = useState<any>(null)
  const [personalPhone, setPersonalPhone] = useState('')
  const [personalName, setPersonalName] = useState('')
  const [load, setLoad] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados dos Cronômetros
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [restAccumulated, setRestAccumulated] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restCountdown, setRestCountdown] = useState(0)

  const totalInterval = useRef<NodeJS.Timeout | null>(null)
  const restInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadExercise()
    
    totalInterval.current = setInterval(() => {
      setTotalSeconds(prev => prev + 1)
    }, 1000)

    return () => {
      if (totalInterval.current) clearInterval(totalInterval.current)
      if (restInterval.current) clearInterval(restInterval.current)
    }
  }, [id])

  useEffect(() => {
    if (isResting && restCountdown > 0) {
      restInterval.current = setInterval(() => {
        setRestCountdown(prev => prev - 1)
        setRestAccumulated(prev => prev + 1)
      }, 1000)
    } else {
      if (restInterval.current) clearInterval(restInterval.current)
      setIsResting(false)
    }
    return () => { if (restInterval.current) clearInterval(restInterval.current) }
  }, [isResting, restCountdown])

  async function loadExercise() {
    const { data: exData } = await supabase
      .from('workout_exercises')
      .select(`
        id, sets, reps, rest, 
        exercises ( id, name, video_url, instructions ),
        workout_plans ( 
          personal_id 
        )
      `)
      .eq('id', id)
      .single()

    if (exData) {
      setData(exData)
      
      const { data: personal } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', exData.workout_plans.personal_id)
        .single()
      
      if (personal) {
        setPersonalPhone(personal.phone || '')
        setPersonalName(personal.full_name || 'Personal')
      }

      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('load, created_at')
        .eq('workout_exercise_id', id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (logs) {
        setHistory(logs)
        if (logs.length > 0) setLoad(logs[0].load)
      }
    }
    setLoading(false)
  }

  // Lógica da Calculadora de 1RM (Fórmula de Brzycki)
  const calculate1RM = () => {
    const weight = parseFloat(load.replace(/[^0-9.]/g, ''))
    const reps = parseInt(data?.reps) || 1
    
    if (!weight || !reps) return 0
    
    // Fórmula: Peso / (1.0278 - (0.0278 * Reps))
    const orm = weight / (1.0278 - (0.0278 * reps))
    return orm.toFixed(1)
  }

  const handleHelpClick = () => {
    if (!personalPhone) return alert('Telefone do Personal não cadastrado.')
    const message = window.encodeURIComponent(
      `Olá ${personalName}! Estou com uma dúvida no exercício *${data.exercises.name}* do meu treino de hoje no SyncPro. Pode me ajudar?`
    )
    window.open(`https://wa.me/${personalPhone.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const startRestTimer = () => {
    const timeStr = data?.rest || "60"
    const seconds = timeStr.includes(':') 
      ? (parseInt(timeStr.split(':')[0]) * 60) + parseInt(timeStr.split(':')[1]) 
      : parseInt(timeStr) || 60
    
    setRestCountdown(seconds)
    setIsResting(true)
  }

  const handleSaveProgress = async () => {
    if (!load) return alert('Insira a carga utilizada!')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('exercise_logs').insert({
      student_id: user?.id,
      workout_exercise_id: id,
      load: load
    })
    if (!error) {
      startRestTimer()
      loadExercise()
    }
    setSaving(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-[#CCFF00] pb-20">
      
      {/* DASHBOARD DE INTENSIDADE */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[60] p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Total</p>
              <p className="text-sm font-mono font-bold text-white">{formatTime(totalSeconds)}</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-[8px] font-black uppercase text-[#00FAD9] tracking-widest mb-1">Repouso</p>
              <p className="text-sm font-mono font-bold text-[#00FAD9]">{formatTime(restAccumulated)}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-[#CCFF00] tracking-widest mb-1">Ativo</p>
              <p className="text-sm font-mono font-bold text-[#CCFF00]">{formatTime(totalSeconds - restAccumulated)}</p>
            </div>
          </div>
          
          <button 
            onClick={handleHelpClick}
            className="ml-4 p-3 bg-[#CCFF00] text-black rounded-2xl hover:scale-110 transition shadow-lg shadow-[#CCFF00]/10"
          >
            <HelpCircle size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8 mt-4">
        
        {/* VÍDEO */}
        <div className="aspect-video w-full bg-slate-800 rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl">
          {data.exercises.video_url ? (
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${data.exercises.video_url.split('v=')[1]}`} allowFullScreen></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20"><Video size={48} /><p className="text-[10px] font-black uppercase mt-2">Sem Vídeo</p></div>
          )}
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{data.exercises.name}</h1>
            <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <Zap size={12} /> {data.sets} Séries • {data.reps} Reps
            </p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
            <Timer size={14} className="text-[#00FAD9]" />
            <span className="text-xs font-black text-[#00FAD9]">{data.rest}s</span>
          </div>
        </div>

        {/* CALCULADORA DE 1RM (ESTIMATIVA DE FORÇA) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Força Estimada (1RM)</span>
            </div>
            <p className="text-3xl font-black text-[#CCFF00]">{calculate1RM()} <span className="text-sm text-slate-500 font-bold tracking-normal uppercase">kg</span></p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] leading-tight">
              Carga máxima <br/> para 1 repetição
            </p>
          </div>
        </div>

        {/* HISTÓRICO */}
        <section className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <History size={16} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Cargas Anteriores</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {history.length > 0 ? history.map((log, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-2xl min-w-[100px] border border-white/5 text-center">
                <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">{new Date(log.created_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</p>
                <p className="text-lg font-black text-[#CCFF00]">{log.load}</p>
              </div>
            )) : <p className="text-[10px] font-bold text-slate-600 uppercase italic">Primeira vez neste exercício.</p>}
          </div>
        </section>

        {/* REGISTRO */}
        <div className="bg-slate-900 border-2 border-[#CCFF00]/10 p-8 rounded-[3rem] shadow-xl relative">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-4 block tracking-widest">Peso utilizado agora</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              className="flex-1 bg-white/5 border-2 border-white/5 rounded-2xl p-4 text-2xl font-black outline-none focus:border-[#CCFF00] transition"
              placeholder="00kg"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
            />
            <button 
              onClick={handleSaveProgress}
              disabled={saving || isResting}
              className="bg-[#CCFF00] text-black px-8 rounded-2xl font-black hover:scale-105 transition disabled:opacity-50 shadow-lg shadow-[#CCFF00]/20"
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            </button>
          </div>
        </div>

        {/* INSTRUÇÕES */}
        <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-slate-500"><Info size={18} /><h3 className="text-xs font-black uppercase tracking-widest">Dica Técnica</h3></div>
          <p className="text-slate-400 text-sm leading-relaxed italic">{data.exercises.instructions || "Mantenha a postura e controle a descida do peso (fase excêntrica)."}</p>
        </div>

        {/* TIMER OVERLAY */}
        {isResting && (
          <div className="fixed inset-0 z-[100] bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[#CCFF00]" strokeDasharray="628" strokeDashoffset={628 - (628 * restCountdown) / 60} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-7xl font-black font-mono tracking-tighter text-white">{restCountdown}</span>
                  <span className="text-[10px] font-black uppercase text-[#CCFF00] tracking-[0.3em]">Repouso</span>
                </div>
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Recupere o Fôlego</h2>
              <button onClick={() => setIsResting(false)} className="mt-10 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-[#CCFF00] transition">Pular Descanso</button>
            </div>
          </div>
        )}

        <button onClick={() => router.back()} className="w-full py-6 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition">Concluir Exercício</button>
      </div>
    </div>
  )
}