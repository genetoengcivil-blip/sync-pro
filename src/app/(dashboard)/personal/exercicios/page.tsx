'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Video, Dumbbell, Trash2, Loader2, PlayCircle } from 'lucide-react'

export default function ExercisesLibrary() {
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newVideo, setNewVideo] = useState('')
  const [newGroup, setNewGroup] = useState('Peito')

  useEffect(() => {
    fetchExercises()
  }, [])

  async function fetchExercises() {
    const { data } = await supabase.from('exercises').select('*').order('name')
    if (data) setExercises(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!newName) return
    await supabase.from('exercises').insert({
      name: newName,
      video_url: newVideo,
      muscle_group: newGroup
    })
    setShowAdd(false)
    setNewName('')
    setNewVideo('')
    fetchExercises()
  }

  const filtered = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-white selection:bg-[#CCFF00]">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Biblioteca <span className="text-[#CCFF00]">Técnica</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Vídeos de execução e bio-mecânica</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-[#CCFF00] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition flex items-center gap-2"
          >
            <Plus size={18} /> Novo Exercício
          </button>
        </header>

        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            className="w-full bg-slate-900 border-2 border-white/5 rounded-[2rem] py-5 pl-16 pr-6 outline-none focus:border-[#CCFF00] transition font-bold"
            placeholder="Buscar por nome ou grupo muscular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ex) => (
            <div key={ex.id} className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] group hover:border-[#CCFF00]/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 p-4 rounded-2xl text-[#CCFF00]"><Dumbbell size={24} /></div>
                {ex.video_url && <PlayCircle size={20} className="text-[#00FAD9] animate-pulse" />}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{ex.name}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">{ex.muscle_group}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-600 text-[9px] font-black uppercase">
                  <Video size={12} /> {ex.video_url ? 'Com Vídeo' : 'Sem Vídeo'}
                </div>
                <button className="text-red-500/30 hover:text-red-500 transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL ADICIONAR */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-10">
            <h2 className="text-2xl font-black uppercase italic mb-8">Novo Exercício</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Nome</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#CCFF00]" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">URL Vídeo (YouTube)</label>
                <input value={newVideo} onChange={e => setNewVideo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#CCFF00]" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
                <button onClick={handleAdd} className="flex-1 bg-[#CCFF00] text-black py-4 rounded-xl font-black uppercase text-[10px]">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}