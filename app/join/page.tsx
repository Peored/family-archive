'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setPreferredFamily } from '@/lib/family'

type InviteInfo = {
  valid: boolean
  kind?: 'family' | 'platform'
  family_name?: string | null
  role?: string
  email?: string | null
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

function friendly(message: string) {
  if (/duplicate key|families_slug/i.test(message)) return 'That web address is already taken. Please choose another.'
  if (/families_slug_check|violates check/i.test(message)) return 'The web address must be 3 to 40 letters, numbers or dashes.'
  return message
}

const input = 'w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 mb-3 outline-none focus:border-[#C9A84C] transition-colors'

function JoinInner() {
  const token = useSearchParams().get('token') ?? ''
  const router = useRouter()

  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: invite }, { data: { session } }] = await Promise.all([
        supabase.rpc('get_invite', { p_token: token }),
        supabase.auth.getSession(),
      ])
      const i = (invite as InviteInfo) ?? { valid: false }
      setInfo(i)
      setSessionEmail(session?.user.email ?? null)
      if (i.email) setEmail(i.email)
      setChecking(false)
    }
    if (token) load()
    else { setInfo({ valid: false }); setChecking(false) }
  }, [token])

  async function submit() {
    if (!info?.valid) return
    setError('')
    setNotice('')

    if (info.kind === 'platform') {
      if (!familyName.trim()) return setError('Please name your family archive')
      if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return setError('The web address must be 3 to 40 letters, numbers or dashes')
    }

    setBusy(true)

    if (!sessionEmail) {
      if (!email || !password) { setBusy(false); return setError('Please enter your email and a password') }

      if (mode === 'signup') {
        if (password.length < 8) { setBusy(false); return setError('Password must be at least 8 characters') }
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        })
        if (err) { setBusy(false); return setError(err.message) }
        if (!data.session) {
          setBusy(false)
          setMode('signin')
          return setNotice('Almost there. Check your email and confirm your account, then you will be brought back to this page.')
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setBusy(false); return setError('Incorrect email or password') }
      }
    }

    const { data: fid, error: acceptErr } = await supabase.rpc('accept_invite', {
      p_token: token,
      p_name: info.kind === 'platform' ? familyName.trim() : null,
      p_slug: info.kind === 'platform' ? slug : null,
    })
    if (acceptErr) { setBusy(false); return setError(friendly(acceptErr.message)) }

    setPreferredFamily(fid as string)
    router.push('/')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSessionEmail(null)
  }

  return (
    <main className="min-h-screen bg-[#0A0804] flex items-center justify-center px-4 py-10">
      <div className="border border-[#3A3020] p-10 max-w-sm w-full text-center relative">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
        <p className="text-[#C9A84C] text-xs tracking-widest font-light mb-4">✦ FAMILY ARCHIVE ✦</p>

        {checking ? (
          <p className="text-[#5A4E38] text-xs tracking-widest">CHECKING YOUR INVITATION...</p>
        ) : !info?.valid ? (
          <>
            <h1 className="text-[#F0E6D0] text-2xl mb-3" style={{ fontFamily: 'Georgia,serif' }}>Invitation not valid</h1>
            <p className="text-[#9A8A6A] text-sm italic mb-6">
              This link is invalid, already used, or has expired. Please ask whoever invited you for a new one.
            </p>
            <button onClick={() => router.push('/')}
              className="text-[#5A4E38] text-xs tracking-widest bg-transparent border-none cursor-pointer">
              GO TO SIGN IN
            </button>
          </>
        ) : (
          <>
            <h1 className="text-[#F0E6D0] text-3xl mb-2" style={{ fontFamily: 'Georgia,serif' }}>
              {info.kind === 'family' ? info.family_name : 'Start your archive'}
            </h1>
            <p className="text-[#9A8A6A] text-sm italic mb-8">
              {info.kind === 'family'
                ? "You've been invited to join this family archive"
                : "You've been invited to create a family archive of your own"}
            </p>

            {sessionEmail ? (
              <p className="text-[#9A8A6A] text-xs mb-4">
                Signed in as <span className="text-[#C9A84C]">{sessionEmail}</span>{' '}
                <button onClick={signOut} className="underline bg-transparent border-none cursor-pointer text-[#5A4E38]">
                  not you?
                </button>
              </p>
            ) : (
              <>
                <input className={input} type="email" placeholder="Email address" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }} />
                <input className={input} type="password"
                  placeholder={mode === 'signup' ? 'Choose a password (8+ characters)' : 'Password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && info.kind === 'family' && submit()} />
              </>
            )}

            {info.kind === 'platform' && (
              <>
                <input className={input} placeholder="Family name (e.g. The Okafor Family)" value={familyName}
                  onChange={e => {
                    setFamilyName(e.target.value)
                    if (!slugEdited) setSlug(slugify(e.target.value))
                    setError('')
                  }} />
                <input className={input} placeholder="web-address" value={slug}
                  onChange={e => { setSlug(slugify(e.target.value)); setSlugEdited(true); setError('') }} />
              </>
            )}

            {error && <p className="text-red-400 text-xs mb-3">✗ {error}</p>}
            {notice && <p className="text-[#C9A84C] text-xs mb-3">{notice}</p>}

            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {busy ? 'PLEASE WAIT...'
                : sessionEmail ? (info.kind === 'family' ? 'JOIN THE ARCHIVE' : 'CREATE MY ARCHIVE')
                : mode === 'signup' ? 'CREATE ACCOUNT & CONTINUE' : 'SIGN IN & CONTINUE'}
            </button>

            {!sessionEmail && (
              <div className="mt-4">
                <button
                  onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setNotice('') }}
                  className="text-[#5A4E38] text-xs tracking-widest bg-transparent border-none cursor-pointer">
                  {mode === 'signup' ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : 'NEW HERE? CREATE AN ACCOUNT'}
                </button>
              </div>
            )}

            <p className="mt-6 text-[#3A3020] text-xs tracking-widest">
              BY CONTINUING YOU AGREE TO OUR{' '}
              <a href="/privacy" target="_blank" rel="noreferrer" className="underline hover:text-[#9A8A6A]">PRIVACY &amp; TERMS</a>
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0A0804] flex items-center justify-center">
        <p className="text-[#C9A84C] text-xs tracking-widest">LOADING...</p>
      </main>
    }>
      <JoinInner />
    </Suspense>
  )
}
