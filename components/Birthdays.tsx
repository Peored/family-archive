'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getFamilyId } from '@/lib/family'
import { signMedia } from '@/lib/media'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Birthdays() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', birth_month:'', birth_day:'', birth_year:'', note:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const fid = await getFamilyId()
    if (!fid) { setMembers([]); setLoading(false); return }
    const { data } = await supabase
      .from('members')
      .select('id, name, birth_year, photo_url, birth_month, birth_day')
      .eq('family_id', fid)
      .order('birth_month', { ascending: true })
    setMembers(await signMedia(data || [], ['photo_url']))
    setLoading(false)
  }

  async function saveBirthday() {
    if (!form.name) return alert('Please enter a name')
    const fid = await getFamilyId()
    if (!fid) return alert('No family selected')
    setSaving(true)
    await supabase.from('members').insert([{
      family_id: fid,
      name: form.name,
      birth_year: form.birth_year,
      birth_month: form.birth_month ? parseInt(form.birth_month) : null,
      birth_day: form.birth_day ? parseInt(form.birth_day) : null,
      generation: '',
    }])
    setSaving(false)
    setShowForm(false)
    setForm({ name:'', birth_month:'', birth_day:'', birth_year:'', note:'' })
    fetchMembers()
  }

  const currentMonth = new Date().getMonth() + 1
  const withBirthdays = members.filter(m => m.birth_month)
  const thisMonth = withBirthdays.filter(m => m.birth_month === currentMonth)
  const byMonth = MONTHS.map((month, i) => ({
    month,
    index: i + 1,
    members: withBirthdays.filter(m => m.birth_month === i + 1)
  })).filter(g => g.members.length > 0)

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Birthdays & <em className="text-[#C9A84C]">Anniversaries</em>
        </h2>
      </div>

      {/* This month highlight */}
      {thisMonth.length > 0 && (
        <div className="border border-[#C9A84C] bg-[#110E08] p-6 mb-10">
          <p className="text-[#C9A84C] text-xs tracking-widest mb-4">🎂 THIS MONTH — {MONTHS[currentMonth-1].toUpperCase()}</p>
          <div className="flex gap-4 flex-wrap">
            {thisMonth.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                {m.photo_url
                  ? <img src={m.photo_url} className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"/>
                  : <div className="w-10 h-10 rounded-full bg-[#16120C] flex items-center justify-center border border-[#C9A84C]">👤</div>}
                <div>
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>{m.name}</p>
                  <p className="text-[#9A8A6A] text-xs italic">
                    {m.birth_day ? m.birth_day + ' ' : ''}{MONTHS[m.birth_month-1]}
                    {m.birth_year ? ' · Born ' + m.birth_year : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All birthdays by month */}
      {!byMonth.length ? (
        <div className="text-center py-20 text-[#5A4E38]">
          <p className="text-4xl mb-4">🎂</p>
          <p className="text-xl italic" style={{fontFamily:'Georgia,serif'}}>
            No birthdays recorded yet
          </p>
          <p className="text-xs tracking-widest mt-2">
            ADD BIRTH MONTH & DAY TO MEMBER PROFILES TO SEE THEM HERE
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {byMonth.map(g => (
            <div key={g.month} className="border border-[#2A2218] bg-[#110E08] p-6">
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4 border-b border-[#2A2218] pb-2">
                {g.month.toUpperCase()}
              </p>
              {g.members.map(m => (
                <div key={m.id} className="flex items-center gap-3 mb-3">
                  {m.photo_url
                    ? <img src={m.photo_url} className="w-8 h-8 rounded-full object-cover border border-[#3A3020]"/>
                    : <div className="w-8 h-8 rounded-full bg-[#16120C] flex items-center justify-center text-sm border border-[#2A2218]">👤</div>}
                  <div>
                    <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>{m.name}</p>
                    <p className="text-[#5A4E38] text-xs italic">
                      {m.birth_day ? m.birth_day + ' ' + g.month : g.month}
                      {m.birth_year ? ' · ' + m.birth_year : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border border-[#2A2218] p-5 bg-[#110E08]">
        <p className="text-[#5A4E38] text-xs tracking-widest">
          💡 TIP: To add birthdays, go to <span className="text-[#C9A84C]">Members</span> → Edit a member → Add their birth month and day in the biography or update their profile.
          <br/>Full birthday fields (month + day) will be added in the next update.
        </p>
      </div>
    </div>
  )
}