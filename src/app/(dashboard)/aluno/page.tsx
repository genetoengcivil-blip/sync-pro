'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StudentDashboard() {
  const [workout, setWorkout] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [isFinishing, setIsFinishing] = useState(false)

  const fetchContent = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*, profiles!personal_id(full_name)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setWorkout(workoutData)
    setLoading(false)
  }

  useEffect(() => { fetchContent() }, [])

  const handleJoinPersonal = async () => {
    const { data: personal, error: pError } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (pError || !personal) return alert('Código inválido!')
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('student_relations').insert({ personal_id: personal.id, student_id: user?.id })
    fetchContent()
  }

  const handleFinishWorkout = async () => {
    if (completedExercises.length === 0) return alert('Faça pelo menos um exercício!')
    
    setIsFinishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('workout_logs').insert({
      student_id: user?.id,
      workout_id: workout.id
    })

    if (!error) {
      alert('Treino concluído! Registro enviado ao seu Personal. 🔥')
      setCompletedExercises([])
    } else {
      alert('Erro ao salvar treino.')
    }
    setIsFinishing(false)
  }

  if (loading) return <div className="p-8 text-white bg-[#0F172A] min-h-screen">Carregando...</div>

  if (!workout) {
    return (
      <div className="p-6 bg-[#0F172A] min-h-screen text-white flex flex-col items-center justify-center">
        <div className="max-w-xs w-full text-center">
          <h2 className="text-2xl font-black mb-2 text-[#CCFF00]">CONECTE-SE</h2>
          <input 
            className="p-4 rounded-xl bg-slate-900 border border-slate-700 mb-4 w-full text-center uppercase font-mono text-xl outline-none focus:border-[#CCFF00]"
            placeholder="CÓDIGO"
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button onClick={handleJoinPersonal} className="bg-[#CCFF00] text-black w-full py-4 rounded-xl font-black">VINCULAR AGORA</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0F172A] min-h-screen text-white">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter">MEU <span className="text-[#CCFF00]">TREINO</span></h1>
      </header>

      <div className="bg-slate-900 p-6 rounded-3xl border-l-4 border-[#CCFF00] mb-8">
        <h2 className="text-xl font-black uppercase">{workout.title}</h2>
      </div>

      <div className="space-y-3 mb-24">
        {workout.exercises.map((ex: any, index: number) => (
          <div 
            key={index}
            onClick={() => setCompletedExercises(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])}
            className={`p-5 rounded-2xl border transition-all ${
              completedExercises.includes(index) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-bold ${completedExercises.includes(index) ? 'line-through text-slate-500' : 'text-white'}`}>{ex.name}</h3>
                <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase">
                  <span>{ex.sets} séries</span>
                  <span>{ex.reps} reps</span>
                  <span className="text-[#00FAD9]">{ex.rest} descanso</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${completedExercises.includes(index) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                {completedExercises.includes(index) && <span className="text-black text-[10px] font-black">✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A] to-transparent">
        <button 
          disabled={isFinishing}
          className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl shadow-xl uppercase tracking-widest disabled:opacity-50" 
          onClick={handleFinishWorkout}
        >
          {isFinishing ? 'SALVANDO...' : 'FINALIZAR TREINO'}
        </button>
      </div>
    </div>
  )
}