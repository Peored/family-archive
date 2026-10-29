'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getFamilyId, mediaPath } from '@/lib/family'
import { useRole } from './RoleGuard'

export default function Voices({ showToast }: { showToast?: (msg: string, type?: 'success'|'error') => void }) {
  const { isAdmin } = useRole()
  const [voices, setVoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [form, setForm] = useState({ name:'', year:'', description:'' })
  const [saving, setSaving] = useState(false)
  const [playingId, setPlayingId] = useState<string|null>(null)
  const audioRefs = useRef<{[key:string]: HTMLAudioElement}>({})

  useEffect(() => { fetchVoices() }, [])

  async function fetchVoices() {
    const fid = await getFamilyId()
    if (!fid) { setVoices([]); setLoading(false); return }
    const { data } = await supabase.from('voices').select('*').eq('family_id', fid).order('created_at', { ascending: false })
    setVoices(data || [])
    setLoading(false)
  }

  async function saveVoice() {
    if (!form.name) return alert("Please enter the person's name")
    if (!file) return alert('Please upload an audio file')
    const fid = await getFamilyId()
    if (!fid) return alert('No family selected')
    setSaving(true)
    const path = mediaPath(fid, 'voices', file)
    await supabase.storage.from('family-media').upload(path, file)
    const { data: urlData } = supabase.storage.from('family-media').getPublicUrl(path)
    await supabase.from('voices').insert([{ ...form, audio_url: urlData.publicUrl, family_id: fid }])
    setSaving(false)
    setShowForm(false)
    setFile(null)
    setForm({ name:'', year:'', description:'' })
    fetchVoices()
    showToast?.('Voice preserved in the archive')
  }

  async function deleteVoice(id: string) {
    if (!confirm('Remove this recording?')) return
    await supabase.from('voices').delete().eq('id', id)
    fetchVoices()
    showToast?.('Recording removed', 'error')
  }

  function togglePlay(id: string, url: string) {
    if (!audioRefs.current[id]) {
      audioRefs.current[id] = new Audio(url)
      audioRefs.current[id].onended = () => setPlayingId(null)
    }
    if (playingId === id) {
      audioRefs.current[id].pause()
      setPlayingId(null)
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause()
        audioRefs.current[playingId].currentTime = 0
      }
      audioRefs.current[id].play()
      setPlayingId(id)
    }
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Voice <em className="text-[#C9A84C]">Recordings</em>
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#C9A84C] text-[#0A0804] px-5 py-2 text-xs tracking-widest hover:bg-[#E8C97A] transition-all"
          >
            + ADD RECORDING
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="border border-[#3A3020] p-8 mb-10 bg-[#110E08] relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
          <h3 className="text-[#C9A84C] text-xs tracking-widest mb-6">✦ NEW VOICE RECORDING</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">PERSON'S NAME</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="Whose voice is this?"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">YEAR RECORDED</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="e.g. 2003"
                type="number"
                value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">DESCRIPTION</label>
              <textarea
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors resize-none"
                placeholder="What are they saying? What was the occasion?"
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">AUDIO FILE</label>
              <input
                type="file"
                accept="audio/*"
                onChange={e => setFile(e.target.files?.[0]||null)}
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#9A8A6A] px-4 py-3 text-sm"
              />
              {file && <p className="text-[#5A4E38] text-xs mt-2 italic">🎵 {file.name}</p>}
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="border border-[#3A3020] text-[#9A8A6A] px-5 py-2 text-xs tracking-widest hover:border-[#9A8A6A]"
            >
              CANCEL
            </button>
            <button
              onClick={saveVoice}
              disabled={saving}
              className="bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {saving ? 'UPLOADING...' : 'PRESERVE THIS VOICE'}
            </button>
          </div>
        </div>
      )}

      {!voices.length ? (
        <div className="text-center py-24 text-[#5A4E38]">
          <p className="text-5xl mb-4">🎙</p>
          <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No voices preserved yet</p>
          <p className="text-xs tracking-widest">UPLOAD THE FIRST RECORDING</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {voices.map(v => (
            <div
              key={v.id}
              className="border border-[#2A2218] bg-[#110E08] p-6 hover:border-[#8B6914] transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl" style={{fontFamily:'Georgia,serif'}}>{v.name}</h3>
                <span className="text-[#5A4E38] text-xs italic">{v.year}</span>
              </div>
              {v.description && (
                <p className="text-[#9A8A6A] text-sm leading-relaxed mb-4">{v.description}</p>
              )}
              {v.audio_url && (
                <div className="flex items-center gap-3 bg-[#0A0804] border border-[#2A2218] p-3">
                  <button
                    onClick={() => togglePlay(v.id, v.audio_url)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B6914] to-[#C9A84C] flex items-center justify-center text-[#0A0804] text-sm hover:scale-110 transition-all flex-shrink-0"
                  >
                    {playingId === v.id ? '⏸' : '▶'}
                  </button>
                  <div className="flex-1">
                    <p className="text-[#F0E6D0] text-xs">{v.name} · {v.year || 'Unknown year'}</p>
                    <div className="h-1 bg-[#2A2218] mt-2 rounded">
                      <div className={`h-full bg-[#C9A84C] rounded transition-all ${playingId === v.id ? 'w-1/2' : 'w-0'}`}></div>
                    </div>
                  </div>
                </div>
              )}
              {isAdmin && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => deleteVoice(v.id)}
                    className="text-[#3A3020] text-xs tracking-widest hover:text-red-400 transition-all"
                  >
                    DELETE
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}