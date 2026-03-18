'use client'
import { useState, useEffect } from 'react'
import Members from '@/components/Members'
import Photos from '@/components/Photos'
import Stories from '@/components/Stories'
import Voices from '@/components/Voices'
import Tree from '@/components/Tree'
import Search from '@/components/Search'
import Birthdays from '@/components/Birthdays'
import Map from '@/components/Map'
import { Toast, useToast } from '@/components/Toast'

const PASSWORD = 'adewole2025'

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [tab, setTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem('fa_authed')
    if (saved === 'true') setAuthed(true)
  }, [])

  function login() {
    if (pass === PASSWORD) {
      localStorage.setItem('fa_authed', 'true')
      setAuthed(true)
      showToast('Welcome to the Archive')
    } else {
      setError(true)
    }
  }

  function logout() {
    localStorage.removeItem('fa_authed')
    setAuthed(false)
  }

  if (!authed) return (
    <main className="min-h-screen bg-[#0A0804] flex items-center justify-center px-4">
      <div className="border border-[#3A3020] p-10 max-w-sm w-full text-center">
        <p className="text-[#C9A84C] text-xs tracking-widest font-light mb-4">
          ✦ FAMILY ARCHIVE ✦
        </p>
        <h1
          className="text-[#F0E6D0] text-3xl mb-2"
          style={{fontFamily:'Georgia,serif'}}>
          Adewumi Legacy
        </h1>
        <p className="text-[#9A8A6A] text-sm italic mb-8">
          Enter to walk among your ancestors
        </p>
        <input
          className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 mb-3 outline-none focus:border-[#C9A84C]"
          type="password"
          placeholder="Passphrase"
          value={pass}
          onChange={e => { setPass(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        {error && (
          <p className="text-red-400 text-xs mb-3">✗ Incorrect passphrase</p>
        )}
        <button
          className="w-full bg-[#C9A84C] text-[#0A0804] py-3 text-xs tracking-widest hover:bg-[#E8C97A] transition-all"
          onClick={login}>
          ENTER THE ARCHIVE
        </button>
      </div>
      <Toast toast={toast} />
    </main>
  )

  const tabs = ['home','members','tree','photos','stories','voices','birthdays','map','search']

  function goTo(t: string) {
    setTab(t)
    setMenuOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0804] text-[#F0E6D0]">
      <header className="border-b border-[#3A3020] px-6 py-4 sticky top-0 bg-[#0A0804] z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#C9A84C] text-xs tracking-widest">THE ARCHIVE</p>
            <p className="text-[#5A4E38] text-xs tracking-widest">Family Legacy</p>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 flex-wrap">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => goTo(t)}
                className={`px-3 py-2 text-xs tracking-widest uppercase transition-all border-b-2 ${
                  tab === t
                    ? 'text-[#C9A84C] border-[#C9A84C]'
                    : 'text-[#5A4E38] border-transparent hover:text-[#9A8A6A]'
                }`}>
                {t}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-[#C9A84C] text-2xl leading-none"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '×' : '☰'}
            </button>
            <button
              onClick={logout}
              className="hidden md:block text-[#5A4E38] text-xs tracking-widest hover:text-[#9A8A6A]">
              LEAVE
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-4 border-t border-[#2A2218] pt-4 grid grid-cols-3 gap-2">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => goTo(t)}
                className={`px-3 py-2 text-xs tracking-widest uppercase transition-all border ${
                  tab === t
                    ? 'text-[#C9A84C] border-[#C9A84C] bg-[#110E08]'
                    : 'text-[#5A4E38] border-[#2A2218] hover:text-[#9A8A6A]'
                }`}>
                {t}
              </button>
            ))}
            <button
              onClick={logout}
              className="px-3 py-2 text-xs tracking-widest uppercase text-red-900 border border-[#2A2218] hover:text-red-400">
              LEAVE
            </button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {tab === 'home'      && <Dashboard />}
        {tab === 'members'   && <Members showToast={showToast} />}
        {tab === 'tree'      && <Tree />}
        {tab === 'photos'    && <Photos showToast={showToast} />}
        {tab === 'stories'   && <Stories showToast={showToast} />}
        {tab === 'voices'    && <Voices showToast={showToast} />}
        {tab === 'birthdays' && <Birthdays />}
        {tab === 'map'       && <Map />}
        {tab === 'search'    && <Search />}
      </div>

      <Toast toast={toast} />
    </main>
  )
}

function Dashboard() {
  const [counts, setCounts] = useState({
    members: 0, photos: 0, stories: 0, voices: 0
  })
  const [members, setMembers] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { supabase } = await import('@/lib/supabase')
      const [mc, pc, sc, vc, mr, sr, pr] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('photos').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('id', { count: 'exact', head: true }),
        supabase.from('voices').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('stories').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(4),
      ])
      setCounts({
        members: mc.count || 0,
        photos: pc.count || 0,
        stories: sc.count || 0,
        voices: vc.count || 0,
      })
      setMembers(mr.data || [])
      setStories(sr.data || [])
      setPhotos(pr.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: 'Ancestors',   value: counts.members, icon: '👤' },
    { label: 'Photographs', value: counts.photos,  icon: '📷' },
    { label: 'Stories',     value: counts.stories, icon: '📜' },
    { label: 'Voices',      value: counts.voices,  icon: '🎙' },
  ]

  if (loading) return (
    <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>
  )

  return (
    <div>
      <div className="text-center py-10 mb-10 border-b border-[#2A2218]">
        <p className="text-[#C9A84C] text-xs tracking-widest mb-3">
          ✦ EST. SINCE THE BEGINNING ✦
        </p>
        <h1
          className="text-4xl md:text-5xl font-light mb-3"
          style={{fontFamily:'Georgia,serif'}}>
          The <em className="text-[#C9A84C]">Adewumi</em> Legacy
        </h1>
        <p className="text-[#9A8A6A] italic text-lg">
          A living record of our blood, our stories, our faces.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(s => (
          <div
            key={s.label}
            className="border border-[#2A2218] bg-[#110E08] p-6 text-center">
            <p className="text-3xl mb-3">{s.icon}</p>
            <p
              className="text-[#C9A84C] text-3xl font-light mb-1"
              style={{fontFamily:'Georgia,serif'}}>
              {s.value}
            </p>
            <p className="text-[#5A4E38] text-xs tracking-widest">
              {s.label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest mb-4 border-b border-[#2A2218] pb-2">
            RECENTLY ADDED MEMBERS
          </p>
          {!members.length
            ? <p className="text-[#5A4E38] text-sm italic">No members yet</p>
            : members.map(m => (
              <div
                key={m.id}
                className="flex gap-3 items-center mb-3 border border-[#2A2218] p-3 bg-[#110E08]">
                {m.photo_url
                  ? <img src={m.photo_url} className="w-10 h-10 object-cover border border-[#3A3020]"/>
                  : <div className="w-10 h-10 bg-[#16120C] flex items-center justify-center text-lg border border-[#2A2218]">👤</div>}
                <div>
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>{m.name}</p>
                  <p className="text-[#5A4E38] text-xs italic">
                    {m.generation ? m.generation + ' · ' : ''}{m.birth_year || '?'}
                  </p>
                </div>
              </div>
            ))
          }
        </div>

        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest mb-4 border-b border-[#2A2218] pb-2">
            RECENTLY ADDED STORIES
          </p>
          {!stories.length
            ? <p className="text-[#5A4E38] text-sm italic">No stories yet</p>
            : stories.map(s => (
              <div key={s.id} className="mb-3 border border-[#2A2218] p-3 bg-[#110E08]">
                <p className="text-[#F0E6D0] text-sm mb-1" style={{fontFamily:'Georgia,serif'}}>{s.title}</p>
                <p className="text-[#5A4E38] text-xs italic">By {s.author || 'Anonymous'}</p>
              </div>
            ))
          }
        </div>

        {photos.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-[#C9A84C] text-xs tracking-widest mb-4 border-b border-[#2A2218] pb-2">
              RECENTLY ADDED PHOTOS
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {photos.map(p => (
                <div key={p.id} className="aspect-square overflow-hidden">
                  <img
                    src={p.url}
                    alt={p.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}