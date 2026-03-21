'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from './RoleGuard'

export default function Stories({ showToast }: { showToast?: (msg: string, type?: 'success'|'error') => void }) {
  const { isAdmin } = useRole()
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ title:'', author:'', subject:'', body:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchStories() }, [])

  async function fetchStories() {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    setStories(data || [])
    setLoading(false)
  }

  async function saveStory() {
    if (!form.title) return alert('Please enter a title')
    if (!form.body) return alert('Please write the story')
    setSaving(true)
    await supabase.from('stories').insert([{ ...form }])
    setSaving(false)
    setShowForm(false)
    setForm({ title:'', author:'', subject:'', body:'' })
    fetchStories()
    showToast?.('Story preserved in the archive')
  }

  async function deleteStory(id: string) {
    if (!confirm('Remove this story?')) return
    await supabase.from('stories').delete().eq('id', id)
    setSelected(null)
    fetchStories()
    showToast?.('Story removed', 'error')
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Written <em className="text-[#C9A84C]">Stories</em>
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#C9A84C] text-[#0A0804] px-5 py-2 text-xs tracking-widest hover:bg-[#E8C97A] transition-all"
          >
            + ADD STORY
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="border border-[#3A3020] p-8 mb-10 bg-[#110E08] relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
          <h3 className="text-[#C9A84C] text-xs tracking-widest mb-6">✦ NEW STORY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">STORY TITLE</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="Give this memory a name"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">WRITTEN BY</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="Your name"
                value={form.author}
                onChange={e => setForm({...form, author: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">ABOUT WHOM</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="Who is this story about?"
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">THE STORY</label>
              <textarea
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors resize-none"
                placeholder="Write the memory, the lesson, the tale..."
                rows={8}
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
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
              onClick={saveStory}
              disabled={saving}
              className="bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'PRESERVE THIS STORY'}
            </button>
          </div>
        </div>
      )}

      {!stories.length ? (
        <div className="text-center py-24 text-[#5A4E38]">
          <p className="text-5xl mb-4">📜</p>
          <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No stories recorded yet</p>
          <p className="text-xs tracking-widest">WRITE THE FIRST MEMORY</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className="border border-[#2A2218] bg-[#110E08] p-6 cursor-pointer hover:border-[#8B6914] transition-all"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#C9A84C] text-xs tracking-widest">{s.author || 'Anonymous'}</span>
                <span className="text-[#5A4E38] text-xs italic">
                  {new Date(s.created_at).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}
                </span>
              </div>
              <h3 className="text-xl mb-2" style={{fontFamily:'Georgia,serif'}}>{s.title}</h3>
              {s.subject && <p className="text-[#8B6914] text-xs tracking-widest mb-3">ABOUT: {s.subject}</p>}
              <p className="text-[#9A8A6A] text-sm leading-relaxed">
                {s.body?.substring(0,150)}...
              </p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#110E08] border border-[#3A3020] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
            <div className="flex justify-between items-start p-8 border-b border-[#2A2218]">
              <div>
                <p className="text-[#C9A84C] text-xs tracking-widest mb-1">
                  {selected.author || 'Anonymous'}
                  {selected.subject && ` · About: ${selected.subject}`}
                </p>
                <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#5A4E38] text-2xl hover:text-[#C9A84C] ml-4 flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="p-8">
              <p className="text-[#9A8A6A] leading-loose italic text-lg" style={{fontFamily:'Georgia,serif'}}>
                {selected.body}
              </p>
              {isAdmin && (
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => deleteStory(selected.id)}
                    className="border border-[#3A3020] text-[#5A4E38] px-4 py-2 text-xs tracking-widest hover:border-red-900 hover:text-red-400 transition-all"
                  >
                    DELETE STORY
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}