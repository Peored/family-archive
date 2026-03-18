'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Tree() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').order('created_at')
    setMembers(data || [])
    setLoading(false)
  }

  // Automatically detect all unique generations from the database
  const allGenerations = Array.from(
    new Set(members.map(m => m.generation).filter(Boolean))
  )

  // Smart sort — paternal first, then maternal, then others
  const sortedGenerations = allGenerations.sort((a, b) => {
    const order = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th']
    const paternalOrder = ['Paternal 1st','Paternal 2nd','Paternal 3rd','Paternal 4th','Paternal 5th']
    const maternalOrder = ['Maternal 1st','Maternal 2nd','Maternal 3rd','Maternal 4th','Maternal 5th']
    const allOrder = [...order, ...paternalOrder, ...maternalOrder]
    const aIndex = allOrder.indexOf(a)
    const bIndex = allOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  // Smart label generator
  function getLabel(gen: string) {
    const labels: any = {
      '1st': 'Great-Great-Grandparents',
      '2nd': 'Grandparents',
      '3rd': 'Parents',
      '4th': 'Current Generation',
      '5th': 'Children',
      '6th': 'Grandchildren',
      '7th': 'Great-Grandchildren',
      'Paternal 1st': 'Paternal Great-Grandparents',
      'Paternal 2nd': 'Paternal Grandparents',
      'Paternal 3rd': 'Paternal Parents',
      'Paternal 4th': 'Paternal Current Generation',
      'Paternal 5th': 'Paternal Children',
      'Maternal 1st': 'Maternal Great-Grandparents',
      'Maternal 2nd': 'Maternal Grandparents',
      'Maternal 3rd': 'Maternal Parents',
      'Maternal 4th': 'Maternal Current Generation',
      'Maternal 5th': 'Maternal Children',
    }
    return labels[gen] || gen
  }

  if (loading) return (
    <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>
  )

  if (!members.length) return (
    <div className="text-center py-24 text-[#5A4E38]">
      <p className="text-5xl mb-4">🌳</p>
      <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No members yet</p>
      <p className="text-xs tracking-widest">ADD FAMILY MEMBERS TO SEE THE TREE</p>
    </div>
  )

  return (
    <div>
      <div className="mb-8 border-b border-[#2A2218] pb-4">
        <h2
          className="text-3xl font-light"
          style={{fontFamily:'Georgia,serif'}}>
          Family <em className="text-[#C9A84C]">Tree</em>
        </h2>
        <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
          YOUR LINEAGE ACROSS GENERATIONS
        </p>
      </div>

      {/* Scrollable tree */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div style={{minWidth:'320px'}}>
          {sortedGenerations.map((gen, i) => (
            <div key={gen}>
              {/* Generation label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3A3020] to-[#2A2218]"></div>
                <div className="flex items-center gap-2 px-3 py-1 border border-[#3A3020] bg-[#0A0804]">
                  <span className="text-[#C9A84C] text-xs">✦</span>
                  <p className="text-[#9A8A6A] text-xs tracking-widest font-light whitespace-nowrap">
                    {gen.toUpperCase()} &nbsp;·&nbsp; {getLabel(gen)}
                  </p>
                  <span className="text-[#C9A84C] text-xs">✦</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#3A3020] to-[#2A2218]"></div>
              </div>

              {/* Members row */}
              <div className="flex gap-4 justify-center flex-wrap mb-3">
                {members
                  .filter(m => m.generation === gen)
                  .map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`bg-[#110E08] p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50 flex-shrink-0 relative ${
                        gen.toLowerCase().includes('paternal')
                          ? 'border border-[#3A2810] hover:border-[#C9A84C]'
                          : gen.toLowerCase().includes('maternal')
                          ? 'border border-[#102A3A] hover:border-[#C9A84C]'
                          : 'border border-[#2A2218] hover:border-[#C9A84C]'
                      }`}
                      style={{width:'145px'}}>
                      {i === 0 && (
                        <>
                          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A84C]"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A84C]"></div>
                        </>
                      )}
                      {m.photo_url
                        ? <img
                            src={m.photo_url}
                            alt={m.name}
                            className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border-2 border-[#3A3020]"
                            style={{filter:'sepia(15%)'}}
                          />
                        : <div className="w-14 h-14 rounded-full bg-[#16120C] flex items-center justify-center mx-auto mb-3 border-2 border-[#2A2218] text-2xl">
                            👤
                          </div>}
                      <p
                        className="text-[#F0E6D0] text-xs leading-tight mb-1"
                        style={{fontFamily:'Georgia,serif'}}>
                        {m.name}
                      </p>
                      <p className="text-[#5A4E38] text-xs italic">
                        {m.birth_year||'?'}{m.death_year ? ' – '+m.death_year : ''}
                      </p>
                      {m.spouse && (
                        <p className="text-[#8B6914] text-xs mt-1">♥ {m.spouse}</p>
                      )}
                      {m.role && (
                        <p className="text-[#C9A84C] mt-1 tracking-widest" style={{fontSize:'9px'}}>
                          {m.role.toUpperCase()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {/* Connector */}
              {i < sortedGenerations.length - 1 && (
                <div className="flex flex-col items-center mb-3">
                  <div className="w-px h-6 bg-gradient-to-b from-[#C9A84C] to-[#3A3020]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B6914]"></div>
                  <div className="w-px h-6 bg-gradient-to-b from-[#3A3020] to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-10 border-t border-[#2A2218] pt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-[#3A2810] bg-[#110E08]"></div>
          <p className="text-[#5A4E38] text-xs tracking-widest">PATERNAL SIDE</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-[#102A3A] bg-[#110E08]"></div>
          <p className="text-[#5A4E38] text-xs tracking-widest">MATERNAL SIDE</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-[#2A2218] bg-[#110E08]"></div>
          <p className="text-[#5A4E38] text-xs tracking-widest">GENERAL</p>
        </div>
      </div>

      {/* Profile Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4"
          style={{backdropFilter:'blur(8px)'}}
          onClick={() => setSelected(null)}>
          <div
            className="bg-[#110E08] border border-[#3A3020] w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
            <div className="flex justify-between items-start p-6 border-b border-[#2A2218]">
              <div>
                <p className="text-[#C9A84C] text-xs tracking-widest mb-2">
                  ✦ {selected.generation?.toUpperCase()}
                </p>
                <h2
                  className="text-2xl font-light"
                  style={{fontFamily:'Georgia,serif'}}>
                  {selected.name}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#5A4E38] text-3xl hover:text-[#C9A84C] transition-colors ml-4 flex-shrink-0 leading-none">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {selected.photo_url
                  ? <img
                      src={selected.photo_url}
                      className="w-full sm:w-28 h-44 sm:h-36 object-cover border border-[#3A3020] flex-shrink-0"
                      style={{filter:'sepia(10%)'}}
                    />
                  : <div className="w-full sm:w-28 h-44 sm:h-36 bg-[#16120C] flex items-center justify-center text-4xl border border-[#2A2218] flex-shrink-0">
                      👤
                    </div>}
                <div className="grid grid-cols-2 gap-3 content-start flex-1">
                  {[
                    ['Born',     selected.birth_year],
                    ['Passed',   selected.death_year],
                    ['Spouse',   selected.spouse],
                    ['Career',   selected.career],
                    ['Hometown', selected.hometown],
                    ['Tribe',    selected.tribe],
                  ].filter(([,v]) => v).map(([l, v]) => (
                    <div key={l as string}>
                      <p className="text-[#8B6914] text-xs tracking-widest mb-1">{l as string}</p>
                      <p className="text-[#F0E6D0] text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selected.bio && (
                <>
                  <p className="text-[#C9A84C] text-xs tracking-widest mb-3 border-b border-[#2A2218] pb-3">
                    ✦ BIOGRAPHY
                  </p>
                  <p
                    className="text-[#9A8A6A] text-sm leading-loose italic"
                    style={{fontFamily:'Georgia,serif'}}>
                    {selected.bio}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}