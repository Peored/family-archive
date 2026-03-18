'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .or(`name.ilike.%${query}%,hometown.ilike.%${query}%,career.ilike.%${query}%,tribe.ilike.%${query}%,role.ilike.%${query}%,bio.ilike.%${query}%`)
    setResults(data || [])
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
          Search the <em className="text-[#C9A84C]">Archive</em>
        </h2>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-10">
        <input
          className="flex-1 bg-[#110E08] border border-[#3A3020] text-[#F0E6D0] px-5 py-3 text-sm outline-none focus:border-[#C9A84C] placeholder-[#5A4E38]"
          placeholder="Search by name, hometown, career, tribe, role..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button
          onClick={search}
          className="bg-[#C9A84C] text-[#0A0804] px-8 py-3 text-xs tracking-widest hover:bg-[#E8C97A] transition-all">
          SEARCH
        </button>
      </div>

      {/* Results */}
      {loading && <p className="text-[#5A4E38] text-sm tracking-widest">SEARCHING...</p>}

      {!loading && searched && !results.length && (
        <div className="text-center py-20 text-[#5A4E38]">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl italic" style={{fontFamily:'Georgia,serif'}}>No results found for "{query}"</p>
          <p className="text-xs tracking-widest mt-2">TRY A DIFFERENT SEARCH TERM</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-[#5A4E38] text-xs tracking-widest mb-6">
            {results.length} RESULT{results.length > 1 ? 'S' : ''} FOR "{query.toUpperCase()}"
          </p>
          <div className="grid grid-cols-3 gap-6">
            {results.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className="border border-[#2A2218] bg-[#110E08] cursor-pointer hover:border-[#8B6914] transition-all hover:-translate-y-1">
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.name} className="w-full h-52 object-cover"/>
                  : <div className="w-full h-52 bg-[#16120C] flex items-center justify-center text-5xl text-[#2A2218]">👤</div>}
                <div className="p-5">
                  {m.generation && (
                    <p className="text-[#8B6914] text-xs tracking-widest mb-1">
                      {m.generation.toUpperCase()} GENERATION
                    </p>
                  )}
                  <h3 className="text-xl mb-1" style={{fontFamily:'Georgia,serif'}}>{m.name}</h3>
                  <p className="text-[#9A8A6A] text-sm italic">
                    {m.birth_year||'?'} {m.death_year ? '– '+m.death_year : ''}
                  </p>
                  {m.role && <p className="text-[#C9A84C] text-xs tracking-widest mt-2">{m.role}</p>}
                  {m.hometown && <p className="text-[#5A4E38] text-xs mt-1">📍 {m.hometown}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}>
          <div
            className="bg-[#110E08] border border-[#3A3020] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start p-8 border-b border-[#2A2218]">
              <div>
                {selected.generation && (
                  <p className="text-[#C9A84C] text-xs tracking-widest mb-1">
                    {selected.generation.toUpperCase()} GENERATION
                  </p>
                )}
                <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
                  {selected.name}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#5A4E38] text-2xl hover:text-[#C9A84C]">×</button>
            </div>
            <div className="p-8">
              <div className="flex gap-6 mb-6">
                {selected.photo_url
                  ? <img src={selected.photo_url} className="w-36 h-44 object-cover border border-[#3A3020] flex-shrink-0"/>
                  : <div className="w-36 h-44 bg-[#16120C] flex items-center justify-center text-4xl flex-shrink-0 border border-[#3A3020]">👤</div>}
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                  {[
                    ['Birth Year',       selected.birth_year],
                    ['Death Year',       selected.death_year],
                    ['Spouse',           selected.spouse],
                    ['Career',           selected.career],
                    ['Hometown',         selected.hometown],
                    ['Tribe / Religion', selected.tribe],
                  ].filter(([,v]) => v).map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-[#8B6914] text-xs tracking-widest">{(label as string).toUpperCase()}</p>
                      <p className="text-[#F0E6D0] text-sm mt-1">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selected.bio && (
                <>
                  <p className="text-[#C9A84C] text-xs tracking-widest mb-3 border-b border-[#2A2218] pb-2">BIOGRAPHY</p>
                  <p className="text-[#9A8A6A] leading-relaxed italic" style={{fontFamily:'Georgia,serif'}}>{selected.bio}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}