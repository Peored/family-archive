'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getFamilyId } from '@/lib/family'
import { signMedia } from '@/lib/media'

export default function Map() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const fid = await getFamilyId()
    if (!fid) { setMembers([]); setLoading(false); return }
    const { data } = await supabase
      .from('members')
      .select('id, name, hometown, photo_url, birth_year, death_year, role, generation')
      .eq('family_id', fid)
      .not('hometown', 'is', null)
    setMembers(await signMedia((data || []).filter(m => m.hometown && m.hometown.trim() !== ''), ['photo_url']))
    setLoading(false)
  }

  const hometowns = members.reduce((acc: any, m) => {
    const key = m.hometown
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const firstLocation = Object.keys(hometowns)[0] || ''

  if (loading) return (
    <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>
  )

  return (
    <div>
      <div className="mb-8 border-b border-[#2A2218] pb-4">
        <h2
          className="text-3xl font-light"
          style={{fontFamily:'Georgia,serif'}}>
          Family <em className="text-[#C9A84C]">Map</em>
        </h2>
        <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
          WHERE YOUR ANCESTORS CAME FROM
        </p>
      </div>

      {!members.length ? (
        <div className="text-center py-20 text-[#5A4E38]">
          <p className="text-4xl mb-4">🗺️</p>
          <p
            className="text-xl italic"
            style={{fontFamily:'Georgia,serif'}}>
            No locations recorded yet
          </p>
          <p className="text-xs tracking-widest mt-2">
            ADD HOMETOWNS TO MEMBER PROFILES TO SEE THEM HERE
          </p>
        </div>
      ) : (
        <>
          {/* Embedded Map */}
          <div
            className="border border-[#2A2218] mb-8 overflow-hidden"
            style={{height:'420px'}}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{filter:'invert(90%) hue-rotate(180deg) grayscale(30%)'}}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(firstLocation)}&t=&z=4&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen>
            </iframe>
          </div>

          {/* Stats */}
          <p className="text-[#C9A84C] text-xs tracking-widest mb-6 border-b border-[#2A2218] pb-2">
            {Object.keys(hometowns).length} LOCATION{Object.keys(hometowns).length > 1 ? 'S' : ''} ON RECORD
          </p>

          {/* Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(hometowns).map(([hometown, people]: any) => (
              <div
                key={hometown}
                className="border border-[#2A2218] bg-[#110E08] p-5 hover:border-[#8B6914] transition-all cursor-pointer"
                onClick={() => setSelected({ hometown, people })}>
                <p className="text-[#C9A84C] text-xs tracking-widest mb-1">📍</p>
                <p
                  className="text-[#F0E6D0] text-lg mb-2"
                  style={{fontFamily:'Georgia,serif'}}>
                  {hometown}
                </p>
                <p className="text-[#5A4E38] text-xs tracking-widest">
                  {people.length} MEMBER{people.length > 1 ? 'S' : ''}
                </p>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {people.slice(0, 4).map((m: any) => (
                    m.photo_url
                      ? <img
                          key={m.id}
                          src={m.photo_url}
                          className="w-7 h-7 rounded-full object-cover border border-[#3A3020]"
                        />
                      : <div
                          key={m.id}
                          className="w-7 h-7 rounded-full bg-[#16120C] flex items-center justify-center text-xs border border-[#2A2218]">
                          👤
                        </div>
                  ))}
                  {people.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-[#16120C] flex items-center justify-center text-xs border border-[#2A2218] text-[#5A4E38]">
                      +{people.length - 4}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Location Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}>
          <div
            className="bg-[#110E08] border border-[#3A3020] max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-8 border-b border-[#2A2218]">
              <div>
                <p className="text-[#C9A84C] text-xs tracking-widest mb-1">📍 LOCATION</p>
                <h2
                  className="text-2xl font-light"
                  style={{fontFamily:'Georgia,serif'}}>
                  {selected.hometown}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#5A4E38] text-2xl hover:text-[#C9A84C]">
                ×
              </button>
            </div>
            <div className="p-8">
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4">
                {selected.people.length} MEMBER{selected.people.length > 1 ? 'S' : ''} FROM THIS LOCATION
              </p>
              {selected.people.map((m: any) => (
                <div
                  key={m.id}
                  className="flex gap-4 items-center mb-4 border border-[#2A2218] p-3">
                  {m.photo_url
                    ? <img
                        src={m.photo_url}
                        className="w-12 h-12 object-cover border border-[#3A3020] flex-shrink-0"
                      />
                    : <div className="w-12 h-12 bg-[#16120C] flex items-center justify-center text-xl border border-[#2A2218] flex-shrink-0">
                        👤
                      </div>}
                  <div>
                    <p
                      className="text-[#F0E6D0]"
                      style={{fontFamily:'Georgia,serif'}}>
                      {m.name}
                    </p>
                    <p className="text-[#5A4E38] text-xs italic">
                      {m.generation ? m.generation + ' · ' : ''}
                      {m.birth_year || '?'}{m.death_year ? ' – ' + m.death_year : ''}
                    </p>
                    {m.role && (
                      <p className="text-[#C9A84C] text-xs tracking-widest mt-1">
                        {m.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}