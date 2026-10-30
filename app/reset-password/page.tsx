'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Status = 'checking' | 'ready' | 'invalid' | 'done'

const input = 'w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 mb-3 outline-none focus:border-[#C9A84C] transition-colors'

export default function ResetPassword() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // An expired or already-used link comes back with an error in the URL
    const linkFailed = /error/i.test(window.location.hash) || /error/i.test(window.location.search)

    // The email link signs the user in temporarily and fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !linkFailed) setStatus(s => (s === 'checking' ? 'ready' : s))
      else setStatus(s => (s === 'ready' ? s : 'invalid'))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function submit() {
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirm) return setError('The two passwords do not match')
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) return setError(err.message)
    setStatus('done')
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <main className="min-h-screen bg-[#0A0804] flex items-center justify-center px-4">
      <div className="border border-[#3A3020] p-10 max-w-sm w-full text-center relative">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C9A84C]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C9A84C]"></div>
        <p className="text-[#C9A84C] text-xs tracking-widest font-light mb-4">✦ FAMILY ARCHIVE ✦</p>

        {status === 'checking' && (
          <p className="text-[#5A4E38] text-xs tracking-widest">CHECKING YOUR LINK...</p>
        )}

        {status === 'invalid' && (
          <>
            <h1 className="text-[#F0E6D0] text-2xl mb-3" style={{ fontFamily: 'Georgia,serif' }}>Link not valid</h1>
            <p className="text-[#9A8A6A] text-sm italic mb-6">
              This reset link has expired or was already used. Go back to sign in and choose &quot;Forgot password?&quot; to get a new one.
            </p>
            <button onClick={() => router.push('/')}
              className="text-[#5A4E38] text-xs tracking-widest bg-transparent border-none cursor-pointer">
              GO TO SIGN IN
            </button>
          </>
        )}

        {status === 'ready' && (
          <>
            <h1 className="text-[#F0E6D0] text-3xl mb-2" style={{ fontFamily: 'Georgia,serif' }}>New password</h1>
            <p className="text-[#9A8A6A] text-sm italic mb-8">Choose a password you will remember</p>
            <input className={input} type="password" placeholder="New password (8+ characters)" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }} />
            <input className={input} type="password" placeholder="Confirm new password" value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && submit()} />
            {error && <p className="text-red-400 text-xs mb-3">✗ {error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C] text-[#0A0804] py-3 text-xs tracking-widest hover:from-[#C9A84C] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {busy ? 'SAVING...' : 'SAVE NEW PASSWORD'}
            </button>
          </>
        )}

        {status === 'done' && (
          <>
            <h1 className="text-[#F0E6D0] text-2xl mb-3" style={{ fontFamily: 'Georgia,serif' }}>Password updated</h1>
            <p className="text-[#9A8A6A] text-sm italic">Taking you to your archive...</p>
          </>
        )}
      </div>
    </main>
  )
}
