'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Dumbbell, Save, ArrowLeft, Loader2 } from 'lucide-react'

// Componente interno para lidar com os SearchParams
function NewWorkoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentIdFromUrl = searchParams.get('studentId')

  const [students, setStudents] = useState<any[]>([])
  const [exercisesLibrary, setExercisesLibrary] = useState<any[]>([])
  
  const [selectedStudent, setSelectedStudent] = useState(studentIdFromUrl || '')
  const [workoutName, setWorkoutName] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Busca Alunos e Exercícios em paralelo
      const [stRes, exRes] = await Promise.all([
        supabase.from('students').select('id, full_name').eq('status', 'active'),
        supabase.from('exercises').select('*').order('name')
      ])

      if (stRes.data) setStudents(stRes.data)
      if (exRes.data) setExercisesLibrary(exRes.data)
      
      // Se o ID veio da URL, garante que o state seja atualizado
      if (studentIdFromUrl) {
        setSelectedStudent(studentIdFromUrl)
      }
      
      setFetching(false)
    }
    fetchData()
  }, [studentIdFromUrl])

  const addExerciseRow = () => {
    setWorkoutExercises([...workoutExercises, { exercise_id: '', sets: '', reps: '', rest: '' }])
  }

  const removeExerciseRow = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newArr = [...workoutExercises]
    newArr[index][field] = value
    setWorkoutExercises(newArr)
  }

  const handleSave = async () => {
    if (!selectedStudent || !workoutName || workoutExercises.length === 0) {
      return alert('Preencha os dados da ficha e adicione exercícios.')
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Cria a Ficha (Header)
      const { data: workout, error: wError } = await supabase
        .from('workout_plans')
        .insert({ 
          student_id: selectedStudent, 
          personal_id: user?.id, 
          name: workoutName 
        })
        .select().single()

      if (wError) throw wError

      // 2. Vincula os itens à ficha
      const items = workoutExercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        position: index
      }))

      const { error: iError } = await supabase.from('workout_exercises').insert(items)
      if (iError) throw iError

      alert('Treino prescrito com sucesso! 🔥')
      router.push(`/personal/alunos/${selectedStudent}`)
      router.refresh()

    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#CCFF00]" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 md:p-8 text-white selection:bg-[#CCFF00]">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#CCFF00] transition mb-8 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Cancelar e Voltar
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Montar <span className="text-[#CCFF00]">Série</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Selecione os exercícios do seu catálogo</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full md:w-auto bg-[#CCFF00] text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition shadow-lg shadow-[#CCFF00]/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            SALVAR FICHA
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Aluno Destinatário</label>
            <select 
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-4 px-6 focus:border-[#CCFF00] outline-none transition appearance-none cursor-pointer"
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
            >
              <option value="">Selecione o aluno...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Identificação do Treino</label>
            <input 
              className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-4 px-6 focus:border-[#CCFF00] outline-none transition"
              placeholder="Ex: Treino A - Inferiores"
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Estrutura da Série</h3>
          
          {workoutExercises.map((item, index) => (
            <div key={index} className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="md:col-span-5">
                <select 
                  className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold text-[#CCFF00]"
                  value={item.exercise_id}
                  onChange={e => updateItem(index, 'exercise_id', e.target.value)}
                >
                  <option value="">Buscar exercício...</option>
                  {exercisesLibrary.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <input className="w-full bg-slate-800 border-none rounded-xl py-3 px-2 text-center text-sm" placeholder="Séries" value={item.sets} onChange={e => updateItem(index, 'sets', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <input className="w-full bg-slate-800 border-none rounded-xl py-3 px-2 text-center text-sm" placeholder="Reps" value={item.reps} onChange={e => updateItem(index, 'reps', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <input className="w-full bg-slate-800 border-none rounded-xl py-3 px-2 text-center text-sm" placeholder="Pausa" value={item.rest} onChange={e => updateItem(index, 'rest', e.target.value)} />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button onClick={() => removeExerciseRow(index)} className="text-slate-600 hover:text-red-500 transition p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addExerciseRow}
            className="w-full py-6 border-2 border-dashed border-white/5 rounded-[2.5rem] text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:border-[#CCFF00]/40 hover:text-[#CCFF00] transition-all flex items-center justify-center gap-3"
          >
            <Plus size={20} /> Adicionar Exercício da Biblioteca
          </button>
        </div>
      </div>
    </div>
  )
}

// Wrapper necessário para usar useSearchParams no Next.js App Router
export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A]" />}>
      <NewWorkoutForm />
    </Suspense>
  )
}