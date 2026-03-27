'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Upload, Scale, History, Loader2, CheckCircle2 } from 'lucide-react'

export default function BodyEvolution() {
  const [weight, setWeight] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: st } = await supabase.from('students').select('id').eq('email', user?.email).single()
    
    if (st) {
      const { data } = await supabase.from('body_evolution').select('*').eq('student_id', st.id).order('created_at', { ascending: false })
      setHistory(data || [])
    }
    setFetching(false)
  }

  async function handleUpload() {
    if (!weight || !file) return alert('Preencha o peso e selecione uma foto!')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: st } = await supabase.from('students').select('id').eq('email', user?.email).single()

    // 1. Upload da Foto para o Storage
    const fileName = `${st.id}/${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('transformations')
      .upload(fileName, file)

    if (uploadError) return alert('Erro no upload da imagem')

    // 2. Salva registro no Banco
    const { data: { publicUrl } } = supabase.storage.from('transformations').getPublicUrl(fileName)
    
    await supabase.from('body_evolution').insert({
      student_id: st.id,
      weight: parseFloat(weight),
      photo_url: publicUrl
    })

    setWeight('')
    setFile(null)
    fetchHistory()
    setLoading(false)
    alert('Transformação registrada! 🔥')
  }

  if (fetching) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white selection:bg-[#CCFF00]">
      <div className="max-w-xl mx-auto space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-[#CCFF00] transition">
          <ArrowLeft size={16} /> Voltar ao Treino
        </button>

        <header>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter italic">Minha <span className="text-[#CCFF00]">Evolução</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Acompanhe sua transformação física</p>
        </header>

        {/* FORMULÁRIO DE REGISTRO */}
        <section className="bg-slate-900 border-2 border-[#CCFF00]/10 p-8 rounded-[3rem] shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <Scale className="text-[#CCFF00]" size={24} />
              <input 
                type="number" 
                placeholder="Peso Atual (kg)" 
                className="bg-transparent border-none outline-none flex-1 font-black text-xl placeholder:text-slate-700"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>

            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="photo-upload" 
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] py-12 cursor-pointer hover:border-[#CCFF00]/40 transition group-hover:bg-white/5"
              >
                {file ? (
                  <div className="text-center">
                    <CheckCircle2 className="text-[#CCFF00] mx-auto mb-2" size={32} />
                    <p className="text-[10px] font-black uppercase text-white">{file.name}</p>
                  </div>
                ) : (
                  <>
                    <Camera className="text-slate-700 mb-2 group-hover:text-[#CCFF00] transition" size={32} />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tirar ou Anexar Foto</p>
                  </>
                )}
              </label>
            </div>

            <button 
              onClick={handleUpload}
              disabled={loading}
              className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? 'ENVIANDO...' : 'REGISTRAR AGORA'}
            </button>
          </div>
        </section>

        {/* HISTÓRICO VISUAL */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4 flex items-center gap-2">
            <History size={16} /> Linha do Tempo
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {history.map((item, i) => (
              <div key={i} className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden group">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={item.photo_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <div className="p-4 flex justify-between items-center bg-black/20">
                  <span className="text-sm font-black text-[#CCFF00]">{item.weight}kg</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}