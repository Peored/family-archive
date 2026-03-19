'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const router = useRouter()

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    fetchMessages()
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    await supabase.from('contacts').delete().eq('id', id)
    setSelected(null)
    fetchMessages()
  }

  const goldStyle = { color: '#C9A84C' }

  if (loading) return (
    <main className="min-h-screen bg-[#0A0804] flex items-center justify-center">
      <p className="text-[#C9A84C] text-xs tracking-widest">LOADING...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0804] text-[#F0E6D0]">
      <header className="border-b border-[#3A3020] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0804] z-50">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest">THE ARCHIVE</p>
          <p className="text-[#5A4E38] text-xs tracking-widest">Adewumi Legacy</p>
        </div>
        <Link href="/" className="text-[#5A4E38] text-xs tracking-widest hover:text-[#9A8A6A] transition-colors">
          BACK TO ARCHIVE
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-8 border-b border-[#2A2218] pb-4">
          <div>
            <h2 className="text-3xl font-light" style={{fontFamily:'Georgia,serif'}}>
              Contact <em className="text-[#C9A84C]">Messages</em>
            </h2>
            <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
              {messages.length} MESSAGE{messages.length !== 1 ? 'S' : ''} RECEIVED
            </p>
          </div>
        </div>

        {!messages.length ? (
          <div className="text-center py-24 text-[#5A4E38]">
            <p className="text-5xl mb-4">📧</p>
            <p className="text-2xl italic mb-2" style={{fontFamily:'Georgia,serif'}}>No messages yet</p>
            <p className="text-xs tracking-widest">SHARE YOUR CONTACT PAGE TO START RECEIVING INQUIRIES</p>
            <div className="mt-6">
              <a href="/contact" style={goldStyle} className="text-xs tracking-widest border-b border-[#8B6914] pb-1 hover:opacity-75 transition-all">
                VIEW CONTACT PAGE
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className="border border-[#2A2218] bg-[#110E08] p-6 cursor-pointer hover:border-[#8B6914] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[#F0E6D0] text-lg" style={{fontFamily:'Georgia,serif'}}>{m.name}</p>
                    <p className="text-[#C9A84C] text-xs tracking-widest mt-1">{m.email}</p>
                    {m.whatsapp && <p className="text-[#5A4E38] text-xs mt-1">📱 {m.whatsapp}</p>}
                  </div>
                  <p className="text-[#5A4E38] text-xs italic">
                    {new Date(m.created_at).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}
                  </p>
                </div>
                <p className="text-[#9A8A6A] text-sm leading-relaxed">
                  {m.message.substring(0, 150)}{m.message.length > 150 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <p className="text-[#C9A84C] text-xs tracking-widest mb-1">✦ MESSAGE FROM</p>
                <h2 className="text-2xl font-light" style={{fontFamily:'Georgia,serif'}}>{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#5A4E38] text-3xl hover:text-[#C9A84C] transition-colors ml-4 flex-shrink-0 leading-none">
                x
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-[#8B6914] text-xs tracking-widest mb-1">EMAIL</p>
                  <div>
                    <a href={`mailto:${selected.email}`} style={goldStyle} className="text-sm hover:opacity-75 transition-all">
                      {selected.email}
                    </a>
                  </div>
                </div>
                {selected.whatsapp && (
                  <div>
                    <p className="text-[#8B6914] text-xs tracking-widest mb-1">WHATSAPP</p>
                    <div>
                      
                        href={`https://wa.me/${selected.whatsapp.replace(/\D/g,'')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={goldStyle}
                        className="text-sm hover:opacity-75 transition-all">
                        {selected.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[#8B6914] text-xs tracking-widest mb-1">DATE</p>
                  <p className="text-[#F0E6D0] text-sm">
                    {new Date(selected.created_at).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}
                  </p>
                </div>
              </div>
              <p className="text-[#C9A84C] text-xs tracking-widest mb-3 border-b border-[#2A2218] pb-3">✦ MESSAGE</p>
              <p className="text-[#9A8A6A] leading-loose italic" style={{fontFamily:'Georgia,serif'}}>
                {selected.message}
              </p>
              <div className="flex justify-between mt-8 pt-4 border-t border-[#2A2218]">
                <button
                  onClick={() => deleteMessage(selected.id)}
                  className="border border-[#3A3020] text-[#5A4E38] px-4 py-2 text-xs tracking-widest hover:border-red-900 hover:text-red-400 transition-all">
                  DELETE
                </button>
                
                  href={`mailto:${selected.email}`}
                  className="bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] px-5 py-2 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all">
                  REPLY VIA EMAIL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}