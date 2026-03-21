'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from './RoleGuard'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Members({ showToast }: { showToast?: (msg: string, type?: 'success'|'error') => void }) {
  const { isAdmin } = useRole()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [form, setForm] = useState({
    name:'', birth_year:'', death_year:'', generation:'',
    role:'', spouse:'', career:'', hometown:'', tribe:'', bio:'',
    birth_month:'', birth_day:''
  })
  const [photo, setPhoto] = useState<File|null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').order('created_at')
    setMembers(data || [])
    setLoading(false)
  }

  async function saveMember() {
    if (!form.name) return alert('Please enter a name')
    setSaving(true)
    let photo_url = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `members/${Date.now()}.${ext}`
      await supabase.storage.from('family-media').upload(path, photo)
      const { data: urlData } = supabase.storage.from('family-media').getPublicUrl(path)
      photo_url = urlData.publicUrl
    }

    const payload = {
      ...form,
      birth_month: form.birth_month ? parseInt(form.birth_month) : null,
      birth_day: form.birth_day ? parseInt(form.birth_day) : null,
    }

    if (editingId) {
      await supabase.from('members').update({
        ...payload,
        ...(photo_url ? { photo_url } : {})
      }).eq('id', editingId)
      setEditingId(null)
      showToast?.('Member updated successfully')
    } else {
      await supabase.from('members').insert([{ ...payload, photo_url }])
      showToast?.('Member added to the archive')
    }

    setSaving(false)
    setShowForm(false)
    setForm({
      name:'', birth_year:'', death_year:'', generation:'',
      role:'', spouse:'', career:'', hometown:'', tribe:'', bio:'',
      birth_month:'', birth_day:''
    })
    setPhoto(null)
    fetchMembers()
  }

  function openEdit(m: any) {
    setForm({
      name: m.name || '',
      birth_year: m.birth_year || '',
      death_year: m.death_year || '',
      generation: m.generation || '',
      role: m.role || '',
      spouse: m.spouse || '',
      career: m.career || '',
      hometown: m.hometown || '',
      tribe: m.tribe || '',
      bio: m.bio || '',
      birth_month: m.birth_month ? String(m.birth_month) : '',
      birth_day: m.birth_day ? String(m.birth_day) : '',
    })
    setEditingId(m.id)
    setSelected(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteMember(id: string) {
    if (!confirm('Remove this member?')) return
    await supabase.from('members').delete().eq('id', id)
    setSelected(null)
    fetchMembers()
    showToast?.('Member removed from archive', 'error')
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Family <em className="text-[#C9A84C]">Members</em>
        </h2>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null)
              setForm({ name:'', birth_year:'', death_year:'', generation:'', role:'', spouse:'', career:'', hometown:'', tribe:'', bio:'', birth_month:'', birth_day:'' })
              setShowForm(!showForm)
            }}
            className="bg-[#C9A84C] text-[#0A0804] px-5 py-2 text-xs tracking-widest hover:bg-[#E8C97A] transition-all"
          >
            + ADD MEMBER
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="border border-[#3A3020] p-8 mb-10 bg-[#110E08] relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
          <h3 className="text-[#C9A84C] text-xs tracking-widest mb-6">
            {editingId ? '✦ EDIT FAMILY MEMBER' : '✦ NEW FAMILY MEMBER'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label:'Full Name',        key:'name',       placeholder:'Full name' },
              { label:'Role / Title',     key:'role',       placeholder:'e.g. Patriarch, Elder' },
              { label:'Birth Year',       key:'birth_year', placeholder:'e.g. 1942' },
              { label:'Death Year',       key:'death_year', placeholder:'Leave blank if alive' },
              { label:'Spouse',           key:'spouse',     placeholder:"Spouse's name" },
              { label:'Career',           key:'career',     placeholder:'e.g. Farmer, Teacher' },
              { label:'Hometown',         key:'hometown',   placeholder:'City, Country' },
              { label:'Tribe / Religion', key:'tribe',      placeholder:'e.g. Yoruba, Christian' },
              { label:'Generation',       key:'generation', placeholder:'e.g. Paternal 2nd, Maternal 3rd...' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">{f.label.toUpperCase()}</label>
                <input
                  className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                />
              </div>
            ))}

            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">BIRTH MONTH</label>
              <select
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                value={form.birth_month}
                onChange={e => setForm({...form, birth_month: e.target.value})}
              >
                <option value="">Select month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">BIRTH DAY</label>
              <input
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="e.g. 14"
                type="number"
                min="1"
                max="31"
                value={form.birth_day}
                onChange={e => setForm({...form, birth_day: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">
                {editingId ? 'REPLACE PHOTO (optional)' : 'PHOTO'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhoto(e.target.files?.[0]||null)}
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#9A8A6A] px-4 py-3 text-sm"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">BIOGRAPHY</label>
              <textarea
                className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] h-28 resize-none transition-colors"
                placeholder="Tell their story..."
                value={form.bio}
                onChange={e => setForm({...form, bio: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="border border-[#3A3020] text-[#9A8A6A] px-6 py-3 text-xs tracking-widest hover:border-[#9A8A6A]"
            >
              CANCEL
            </button>
            <button
              onClick={saveMember}
              disabled={saving}
              className="bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {saving ? 'SAVING...' : editingId ? 'UPDATE RECORD' : 'PRESERVE RECORD'}
            </button>
          </div>
        </div>
      )}

      {!members.length ? (
        <div className="text-center py-24 text-[#5A4E38]">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No members yet</p>
          <p className="text-xs tracking-widest">ADD THE FIRST ANCESTOR</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map(m => (
            <div
              key={m.id}
              onClick={() => setSelected(m)}
              className="border border-[#2A2218] bg-[#110E08] cursor-pointer hover:border-[#8B6914] transition-all duration-300 hover:-translate-y-1"
            >
              {m.photo_url
                ? <img src={m.photo_url} alt={m.name} className="w-full h-56 object-cover" style={{filter:'sepia(15%) contrast(1.05)'}}/>
                : <div className="w-full h-56 bg-[#16120C] flex items-center justify-center text-6xl text-[#2A2218]">👤</div>}
              <div className="p-5">
                {m.generation && (
                  <p className="text-[#8B6914] text-xs tracking-widest mb-2">{m.generation.toUpperCase()}</p>
                )}
                <h3 className="text-xl mb-1" style={{fontFamily:'Georgia,serif'}}>{m.name}</h3>
                <p className="text-[#9A8A6A] text-sm italic mb-2">
                  {m.birth_year||'?'} {m.death_year ? '– '+m.death_year : ''}
                </p>
                {m.role && <p className="text-[#C9A84C] text-xs tracking-widest">{m.role}</p>}
                {m.hometown && <p className="text-[#5A4E38] text-xs mt-1">📍 {m.hometown}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4"
          style={{backdropFilter:'blur(8px)'}}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#110E08] border border-[#3A3020] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
            <div className="flex justify-between items-start p-8 border-b border-[#2A2218]">
              <div>
                {selected.generation && (
                  <p className="text-[#C9A84C] text-xs tracking-widest mb-2">✦ {selected.generation.toUpperCase()}</p>
                )}
                <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#5A4E38] text-3xl hover:text-[#C9A84C] transition-colors ml-4 flex-shrink-0 leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {selected.photo_url
                  ? <img src={selected.photo_url} alt={selected.name} className="w-full sm:w-40 h-52 sm:h-48 object-cover border border-[#3A3020] flex-shrink-0" style={{filter:'sepia(10%)'}}/>
                  : <div className="w-full sm:w-40 h-52 sm:h-48 bg-[#16120C] flex items-center justify-center text-5xl flex-shrink-0 border border-[#3A3020]">👤</div>}
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                  {[
                    ['Birth Year',       selected.birth_year],
                    ['Death Year',       selected.death_year],
                    ['Birthday',         selected.birth_month ? `${selected.birth_day ? selected.birth_day + ' ' : ''}${MONTHS[selected.birth_month - 1]}` : null],
                    ['Spouse',           selected.spouse],
                    ['Career',           selected.career],
                    ['Hometown',         selected.hometown],
                    ['Tribe / Religion', selected.tribe],
                    ['Generation',       selected.generation],
                  ].filter(([,v]) => v).map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-[#8B6914] text-xs tracking-widest mb-1">{(label as string).toUpperCase()}</p>
                      <p className="text-[#F0E6D0] text-sm">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selected.bio && (
                <>
                  <p className="text-[#C9A84C] text-xs tracking-widest mb-3 border-b border-[#2A2218] pb-3">✦ BIOGRAPHY</p>
                  <p className="text-[#9A8A6A] leading-loose italic text-base" style={{fontFamily:'Georgia,serif'}}>{selected.bio}</p>
                </>
              )}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8 pt-6 border-t border-[#2A2218]">
                  <button
                    onClick={() => deleteMember(selected.id)}
                    className="w-full sm:w-auto border border-[#3A3020] text-[#5A4E38] px-6 py-3 text-xs tracking-widest hover:border-red-900 hover:text-red-400 transition-all"
                  >
                    DELETE RECORD
                  </button>
                  <button
                    onClick={() => openEdit(selected)}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all"
                  >
                    EDIT RECORD
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