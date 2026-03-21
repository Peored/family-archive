'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from './RoleGuard'

export default function Photos({ showToast }: { showToast?: (msg: string, type?: 'success'|'error') => void }) {
  const { isAdmin } = useRole()
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [lightbox, setLightbox] = useState<any>(null)
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [form, setForm] = useState({ caption:'', year:'', people:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPhotos() }, [])

  async function fetchPhotos() {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function savePhoto() {
    if (!file) return alert('Please select a photo')
    setSaving(true)
    const ext = file.name.split('.').pop()
    const path = `photos/${Date.now()}.${ext}`
    await supabase.storage.from('family-media').upload(path, file)
    const { data: urlData } = supabase.storage.from('family-media').getPublicUrl(path)
    await supabase.from('photos').insert([{ ...form, url: urlData.publicUrl }])
    setSaving(false)
    setShowForm(false)
    setFile(null)
    setPreview(null)
    setForm({ caption:'', year:'', people:'' })
    fetchPhotos()
    showToast?.('Photo added to the gallery')
  }

  async function deletePhoto(id: string) {
    if (!confirm('Remove this photo?')) return
    await supabase.from('photos').delete().eq('id', id)
    setLightbox(null)
    fetchPhotos()
    showToast?.('Photo removed', 'error')
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Photo <em className="text-[#C9A84C]">Gallery</em>
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#C9A84C] text-[#0A0804] px-5 py-2 text-xs tracking-widest hover:bg-[#E8C97A] transition-all"
          >
            + ADD PHOTO
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="border border-[#3A3020] p-8 mb-10 bg-[#110E08] relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
          <h3 className="text-[#C9A84C] text-xs tracking-widest mb-6">✦ NEW PHOTOGRAPH</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">PHOTO</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#9A8A6A] px-4 py-3 text-sm"
              />
              {preview && <img src={preview} className="mt-3 max-h-48 object-contain"/>}
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">CAPTION</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="Describe this moment"
                value={form.caption}
                onChange={e => setForm({...form, caption: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">YEAR</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="e.g. 1985"
                type="number"
                value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">PEOPLE IN PHOTO</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="e.g. Grandpa James, Aunt Ruth..."
                value={form.people}
                onChange={e => setForm({...form, people: e.target.value})}
              />
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
              onClick={savePhoto}
              disabled={saving}
              className="bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {saving ? 'UPLOADING...' : 'ADD TO GALLERY'}
            </button>
          </div>
        </div>
      )}

      {!photos.length ? (
        <div className="text-center py-24 text-[#5A4E38]">
          <p className="text-5xl mb-4">📷</p>
          <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No photographs yet</p>
          <p className="text-xs tracking-widest">UPLOAD THE FIRST IMAGE</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {photos.map(p => (
            <div
              key={p.id}
              onClick={() => setLightbox(p)}
              className="aspect-square overflow-hidden cursor-pointer relative group"
            >
              <img
                src={p.url}
                alt={p.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                <p className="text-white text-xs italic">{p.caption} {p.year && `· ${p.year}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/97 z-50 flex flex-col items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-6 text-[#9A8A6A] text-3xl hover:text-[#C9A84C]"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.caption}
            className="max-w-4xl max-h-[75vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="mt-4 text-center" onClick={e => e.stopPropagation()}>
            {lightbox.caption && (
              <p className="text-[#F0E6D0] italic" style={{fontFamily:'Georgia,serif'}}>{lightbox.caption}</p>
            )}
            {lightbox.year && <p className="text-[#9A8A6A] text-sm mt-1">{lightbox.year}</p>}
            {lightbox.people && <p className="text-[#5A4E38] text-xs tracking-widest mt-1">{lightbox.people}</p>}
            {isAdmin && (
              <button
                onClick={() => deletePhoto(lightbox.id)}
                className="mt-4 border border-[#3A3020] text-[#5A4E38] px-4 py-2 text-xs tracking-widest hover:border-red-900 hover:text-red-400 transition-all"
              >
                DELETE PHOTO
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}