'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', whatsapp:'', message:'' })
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

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
      {/* Header */}
      <header className="border-b border-[#3A3020] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest">THE ARCHIVE</p>
          <p className="text-[#5A4E38] text-xs tracking-widest">Adewumi Legacy</p>
        </div>
        <Link
          href="/"
          className="text-[#5A4E38] text-xs tracking-widest hover:text-[#9A8A6A] border border-[#2A2218] px-3 py-1 hover:border-[#5A4E38] transition-all">
          ENTER ARCHIVE
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ GET IN TOUCH ✦</p>
          <h1
            className="text-4xl md:text-5xl font-light mb-4"
            style={{fontFamily:'Georgia,serif'}}>
            Build Your Family's <em className="text-[#C9A84C]">Legacy</em>
          </h1>
          <p className="text-[#9A8A6A] italic text-lg max-w-xl mx-auto leading-relaxed">
            I build private digital archives for families — preserving photos, stories, voices and family trees for generations to come.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left — What you get */}
          <div>
            <p className="text-[#C9A84C] text-xs tracking-widest mb-6 border-b border-[#2A2218] pb-3">
              ✦ WHAT YOU GET
            </p>

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
                  <p
                    className="text-[#F0E6D0] mb-1"
                    style={{fontFamily:'Georgia,serif'}}>
                    {f.title}
                  </p>
                  <p className="text-[#5A4E38] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

            {/* Pricing */}
            <div className="border border-[#3A3020] p-6 mt-8 relative">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]"></div>
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ PRICING</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-[#2A2218] pb-3">
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>Standard Family Archive</p>
                  <p className="text-[#C9A84C] text-sm tracking-widest">$300</p>
                </div>
                <div className="flex justify-between items-center border-b border-[#2A2218] pb-3">
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>Premium + Custom Domain</p>
                  <p className="text-[#C9A84C] text-sm tracking-widest">$500</p>
                </div>
                <div className="flex justify-between items-center border-b border-[#2A2218] pb-3">
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>Monthly Maintenance</p>
                  <p className="text-[#C9A84C] text-sm tracking-widest">$30/mo</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[#F0E6D0] text-sm" style={{fontFamily:'Georgia,serif'}}>Churches & Communities</p>
                  <p className="text-[#C9A84C] text-sm tracking-widest">Custom</p>
                </div>
              </div>
              <p className="text-[#5A4E38] text-xs mt-4 italic">
                * Delivery within 48 hours. Free hosting included.
              </p>
            </div>

            {/* Contact details */}
            <div className="mt-8 space-y-3">
              <p className="text-[#C9A84C] text-xs tracking-widest mb-4">✦ REACH ME DIRECTLY</p>
              
                href="https://wa.me/2349062056611"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#9A8A6A] hover:text-[#C9A84C] transition-colors">
                <span>📱</span>
                <span className="text-sm tracking-widest">WHATSAPP</span>
              </a>
              
                href="adewole404@gmail.com"
                className="flex items-center gap-3 text-[#9A8A6A] hover:text-[#C9A84C] transition-colors">
                <span>📧</span>
                <span className="text-sm tracking-widest">adewole404@gmail.com</span>
              </a>
              
                href="https://twitter.com/alaric_121"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#9A8A6A] hover:text-[#C9A84C] transition-colors">
                <span>𝕏</span>
                <span className="text-sm tracking-widest">@alaric_121</span>
              </a>
            </div>
          </div>

          {/* Right — Contact form */}
          <div>
            <p className="text-[#C9A84C] text-xs tracking-widest mb-6 border-b border-[#2A2218] pb-3">
              ✦ SEND A MESSAGE
            </p>

            {sent ? (
              <div className="border border-[#C9A84C] bg-[#110E08] p-8 text-center relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]"></div>
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]"></div>
                <p className="text-4xl mb-4">✦</p>
                <h3
                  className="text-2xl font-light mb-3 text-[#C9A84C]"
                  style={{fontFamily:'Georgia,serif'}}>
                  Message Received
                </h3>
                <p className="text-[#9A8A6A] italic leading-relaxed">
                  Thank you for reaching out. I will get back to you within 24 hours to discuss your family archive.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', whatsapp:'', message:'' }) }}
                  className="mt-6 border border-[#3A3020] text-[#5A4E38] px-6 py-2 text-xs tracking-widest hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
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
                      placeholder="Tell me about your family and what you'd like to preserve..."
                      rows={6}
                      value={form.message}
                      onChange={e => { setForm({...form, message: e.target.value}); setError('') }}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs">✗ {error}</p>
                  )}

                  <button
                    onClick={submit}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] py-4 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50">
                    {saving ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>

                  <p className="text-[#3A3020] text-xs text-center tracking-widest">
                    I respond within 24 hours
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo link */}
        <div className="text-center mt-16 border-t border-[#2A2218] pt-10">
          <p className="text-[#5A4E38] text-xs tracking-widest mb-3">WANT TO SEE A LIVE DEMO FIRST?</p>
          
            href="/"
            className="text-[#C9A84C] text-sm tracking-widest hover:text-[#E8C97A] transition-colors border-b border-[#8B6914] pb-1">
            VIEW DEMO ARCHIVE →
          </a>
        </div>

      </div>
    </main>
  )
}