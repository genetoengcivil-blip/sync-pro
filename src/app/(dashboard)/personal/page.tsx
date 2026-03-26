'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

export default function PersonalDashboard() {
  const [students, setStudents] = useState<any[]>([])
  const [personalProfile, setPersonalProfile] = useState<any>(null)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [workoutTitle, setWorkoutTitle] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', rest: '' }])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar perfil do Personal (para mostrar o invite_code)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setPersonalProfile(profile)

      // Buscar alunos vinculados
      const { data: relations } = await supabase
        .from('student_relations')
        .select('student_id, profiles!student_id(full_name, avatar_url)')
        .eq('personal_id', user.id)

      if (relations) setStudents(relations)
    }
    fetchData()
  }, [])

  const addExerciseField = () => setExercises([...exercises, { name: '', sets: '', reps: '', rest: '' }])

  const saveWorkout = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('workouts').insert({
      personal_id: user?.id,
      student_id: selectedStudent.student_id,
      title: workoutTitle,
      exercises: exercises
    })

    if (error) alert('Erro: ' + error.message)
    else {
      alert('Treino enviado!')
      setSelectedStudent(null)
      setExercises([{ name: '', sets: '', reps: '', rest: '' }])
    }
  }

  return (
    <div className="p-8 bg-[#0F172A] min-h-screen text-white">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#CCFF00]">Dashboard Personal</h1>
          <p className="text-slate-400">Gerencie seus alunos e prescrições.</p>
        </div>
        
        {/* Card do Código de Convite */}
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-right">
          <span className="text-xs text-slate-500 uppercase font-bold block">Seu Código de Aluno</span>
          <span className="text-xl font-mono text-[#00FAD9] font-bold">{personalProfile?.invite_code || '---'}</span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Meus Alunos ({students.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {students.map((item) => (
          <div key={item.student_id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition">
            <span className="font-medium text-lg">{item.profiles.full_name || 'Aluno Teste'}</span>
            <button 
              onClick={() => setSelectedStudent(item)}
              className="px-4 py-2 bg-[#CCFF00] text-black text-xs font-black rounded-lg uppercase tracking-wider"
            >
              Prescrever
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Treino */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">Treino para <span className="text-[#CCFF00]">{selectedStudent.profiles.full_name}</span></h2>
            
            <input 
              type="text" 
              placeholder="Ex: Treino A - Peito e Tríceps" 
              className="w-full p-4 mb-6 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-[#CCFF00] transition"
              onChange={(e) => setWorkoutTitle(e.target.value)}
            />

            <div className="space-y-3 mb-6">
              {exercises.map((ex, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 bg-slate-800/50 p-3 rounded-xl">
                  <input placeholder="Exercício" className="col-span-6 p-2 bg-transparent border-b border-slate-700 outline-none" onChange={(e) => { const n = [...exercises]; n[index].name = e.target.value; setExercises(n) }} />
                  <input placeholder="Séries" className="col-span-2 p-2 bg-transparent border-b border-slate-700 outline-none text-center" onChange={(e) => { const n = [...exercises]; n[index].sets = e.target.value; setExercises(n) }} />
                  <input placeholder="Reps" className="col-span-2 p-2 bg-transparent border-b border-slate-700 outline-none text-center" onChange={(e) => { const n = [...exercises]; n[index].reps = e.target.value; setExercises(n) }} />
                  <input placeholder="Desc" className="col-span-2 p-2 bg-transparent border-b border-slate-700 outline-none text-center" onChange={(e) => { const n = [...exercises]; n[index].rest = e.target.value; setExercises(n) }} />
                </div>
              ))}
            </div>

            <button onClick={addExerciseField} className="text-[#CCFF00] font-bold mb-8 hover:underline">+ Adicionar Exercício</button>

            <div className="flex gap-4">
              <button onClick={saveWorkout} className="flex-1 py-4 bg-[#CCFF00] text-black font-bold rounded-xl shadow-lg shadow-[#CCFF00]/10">ENVIAR TREINO</button>
              <button onClick={() => setSelectedStudent(null)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}