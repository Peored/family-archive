'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', whatsapp:'', message:'' })
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit() {
    if (!form.name) return setError('Please enter your name')
    if (!form.email) return setError('Please enter your email')
    if (!form.message) return setError('Please enter your message')
    setSaving(true)
    setError('')
    const { error } = await supabase.from('contacts').insert([{ ...form }])
    if (error) {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    } else {
      setSent(true)
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0804] text-[#F0E6D0]">
      <header className="border-b border-[#3A3020] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest">THE ARCHIVE</p>
          <p className="text-[#5A4E38] text-xs tracking-widest">Adewumi Legacy</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-[#5A4E38] text-xs tracking-widest border border-[#2A2218] px-3 py-1 bg-transparent cursor-pointer"
        >
          ENTER ARCHIVE
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ GET IN TOUCH ✦</p>
          <h1 className="text-4xl md:text-5xl font-light mb-4" style={{fontFamily:'Georgia,serif'}}>
            Build Your Family{"'"}s <em className="text-[#C9A84C]">Legacy</em>
          </h1>
          <p className="text-[#9A8A6A] italic text-lg max-w-xl mx-auto leading-relaxed">
            I build private digital archives for families — preserving photos, stories, voices and family trees for generations to come.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-[#C9A84C] text-xs tracking-widest mb-6 border-b border-[#2A2218] pb-3">✦ WHAT YOU GET</p>
            {[
              { icon:'👤', title:'Family Member Profiles', desc:'Photos, biographies, career history, spouse, hometown and more for every ancestor.' },
              { icon:'🌳', title:'Interactive Family Tree', desc:'Visual tree organized by generation — paternal and maternal sides clearly separated.' },
              { icon:'📷', title:'Photo Gallery', desc:'Upload and preserve family photographs with captions and date stamps.' },
              { icon:'📜', title:'Written Stories', desc:'Record memories, legends and lessons passed down through the generations.' },
              { icon:'🎙', title:'Voice Recordings', desc:'Preserve the actual voices of your elders for future generations to hear.' },
              { icon:'🗺️', title:'Family Map', desc:'See where every ancestor came from on an interactive map.' },
              { icon:'🔐', title:'Password Protected', desc:'Only family members with access can view and contribute to the archive.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 mb-6">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-[#F0E6D0] mb-1" style={{fontFamily:'Georgia,serif'}}>{f.title}</p>
                  <p className="text-[#5A4E38] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

            <div className="border border-[#3A3020] p-6 mt-8 relative">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]"></div>
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ PRICING</p>
              <div className="space-y-3">
                {[
                  ['Standard Family Archive', '$300'],
                  ['Premium + Custom Domain', '$500'],
                  ['Monthly Maintenance', '$30/mo'],
                  ['Churches & Communities', 'Custom'],
                ].map(([label, price]) => (
                  <div key={label} className="flex justify-between items-center border-b border-[#2A2218] pb-3 last:border-0 last:pb-0">
                    <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>{label}</p>
                    <p className="text-[#C9A84C] text-sm tracking-widest">{price}</p>
                  </div>
                ))}
              </div>
              <p className="text-[#5A4E38] text-xs mt-4 italic">* Delivery within 48 hours. Free hosting included.</p>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ REACH ME DIRECTLY</p>
              <div className="flex items-center gap-3">
                <span>📱</span>
                <button
                  onClick={() => window.open('https://wa.me/2349062056611', '_blank')}
                  className="text-[#9A8A6A] text-sm tracking-widest bg-transparent border-none cursor-pointer"
                >
                  WHATSAPP
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span>📧</span>
                <button
                  onClick={() => window.open('mailto:adewole404@gmail.com')}
                  className="text-[#9A8A6A] text-sm tracking-widest bg-transparent border-none cursor-pointer"
                >
                  ADEWOLE404@GMAIL.COM
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span>𝕏</span>
                <button
                  onClick={() => window.open('https://twitter.com/alaric_121', '_blank')}
                  className="text-[#9A8A6A] text-sm tracking-widest bg-transparent border-none cursor-pointer"
                >
                  @alaric_121
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[#C9A84C] text-xs tracking-widest mb-6 border-b border-[#2A2218] pb-3">✦ SEND A MESSAGE</p>
            {sent ? (
              <div className="border border-[#C9A84C] bg-[#110E08] p-8 text-center relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]"></div>
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]"></div>
                <p className="text-4xl mb-4">✦</p>
                <h3 className="text-2xl font-light mb-3 text-[#C9A84C]" style={{fontFamily:'Georgia,serif'}}>Message Received</h3>
                <p className="text-[#9A8A6A] italic leading-relaxed">
                  Thank you for reaching out. I will get back to you within 24 hours to discuss your family archive.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', whatsapp:'', message:'' }) }}
                  className="mt-6 border border-[#3A3020] text-[#5A4E38] px-6 py-2 text-xs tracking-widest hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <div className="border border-[#3A3020] bg-[#110E08] p-8 relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]"></div>
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]"></div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">YOUR NAME</label>
                    <input
                      className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => { setForm({...form, name: e.target.value}); setError('') }}
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">EMAIL ADDRESS</label>
                    <input
                      className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="your@email.com"
                      type="email"
                      value={form.email}
                      onChange={e => { setForm({...form, email: e.target.value}); setError('') }}
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">
                      WHATSAPP NUMBER <span className="text-[#3A3020]">(optional)</span>
                    </label>
                    <input
                      className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="+44 7000 000000"
                      value={form.whatsapp}
                      onChange={e => setForm({...form, whatsapp: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest block mb-2">YOUR MESSAGE</label>
                    <textarea
                      className="w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors resize-none"
                      placeholder="Tell me about your family and what you would like to preserve..."
                      rows={6}
                      value={form.message}
                      onChange={e => { setForm({...form, message: e.target.value}); setError('') }}
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs">✗ {error}</p>}
                  <button
                    onClick={submit}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] py-4 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
                  >
                    {saving ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                  <p className="text-[#3A3020] text-xs text-center tracking-widest">I respond within 24 hours</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-16 border-t border-[#2A2218] pt-10">
          <p className="text-[#5A4E38] text-xs tracking-widest mb-3">WANT TO SEE A LIVE DEMO FIRST?</p>
          <button
            onClick={() => router.push('/')}
            className="text-[#C9A84C] text-sm tracking-widest bg-transparent border-none cursor-pointer underline"
          >
            VIEW DEMO ARCHIVE
          </button>
        </div>
      </div>
    </main>
  )
}