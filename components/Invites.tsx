'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getFamilyId } from '@/lib/family'

type Invite = {
  id: string
  token: string
  kind: 'family' | 'platform'
  role: 'admin' | 'viewer'
  email: string | null
  max_uses: number
  uses: number
  expires_at: string | null
  created_at: string
}

type Props = {
  scope: 'family' | 'platform'
  showToast?: (msg: string, type?: 'success' | 'error') => void
}

export default function Invites({ scope, showToast }: Props) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'viewer' | 'admin'>('viewer')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchInvites() }, [])

  async function fetchInvites() {
    let query = supabase.from('invites').select('*').eq('kind', scope).order('created_at', { ascending: false })
    if (scope === 'family') {
      const fid = await getFamilyId()
      if (!fid) { setInvites([]); setLoading(false); return }
      query = query.eq('family_id', fid)
    }
    const { data } = await query
    setInvites((data as Invite[]) || [])
    setLoading(false)
  }

  function linkFor(i: Invite) {
    return `${window.location.origin}/join?token=${i.token}`
  }

  async function copy(i: Invite, quiet = false) {
    const link = linkFor(i)
    try {
      await navigator.clipboard.writeText(link)
      if (!quiet) showToast?.('Invite link copied')
    } catch {
      window.prompt('Copy this invite link:', link)
    }
  }

  async function createInvite() {
    setError('')
    const cleanEmail = email.trim()
    if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError('That email address does not look right')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const family_id = scope === 'family' ? await getFamilyId() : null
    if (!user || (scope === 'family' && !family_id)) {
      setSaving(false)
      return setError('Could not find your archive. Please sign in again.')
    }
    const { data, error: err } = await supabase
      .from('invites')
      .insert([{
        kind: scope,
        family_id,
        role: scope === 'family' ? role : 'admin',
        email: cleanEmail || null,
        created_by: user.id,
      }])
      .select()
      .single()
    if (err || !data) {
      setSaving(false)
      return setError('Could not create the invite. Please try again.')
    }

    setEmail('')
    await fetchInvites()

    if (cleanEmail) {
      const { data: { session } } = await supabase.auth.getSession()
      try {
        const res = await fetch('/api/send-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ inviteId: (data as Invite).id }),
        })
        if (res.ok) {
          showToast?.(`Invite emailed to ${cleanEmail}`)
        } else {
          const body = await res.json().catch(() => ({}))
          showToast?.(`Email failed (${res.status}${body?.error ? ': ' + body.error : ''}). Link copied.`, 'error')
          copy(data as Invite, true)
        }
      } catch {
        showToast?.('Email failed (network error). Link copied.', 'error')
        copy(data as Invite, true)
      }
    } else {
      copy(data as Invite)
    }
    setSaving(false)
  }

  async function revoke(id: string) {
    if (!confirm('Cancel this invite link?')) return
    await supabase.from('invites').delete().eq('id', id)
    fetchInvites()
    showToast?.('Invite cancelled', 'error')
  }

  function status(i: Invite) {
    if (i.uses >= i.max_uses) return 'USED'
    if (i.expires_at && new Date(i.expires_at) < new Date()) return 'EXPIRED'
    return 'ACTIVE'
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  const input = 'w-full bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] px-4 py-3 outline-none focus:border-[#C9A84C] transition-colors'

  return (
    <div>
      <div className="mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{ fontFamily: 'Georgia,serif' }}>
          {scope === 'family'
            ? <>Invite <em className="text-[#C9A84C]">Relatives</em></>
            : <>Invite a <em className="text-[#C9A84C]">Family</em></>}
        </h2>
        <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
          {scope === 'family'
            ? 'EACH LINK LETS ONE PERSON JOIN YOUR ARCHIVE · EXPIRES IN 14 DAYS'
            : 'EACH LINK LETS ONE PERSON CREATE THEIR OWN ARCHIVE · EXPIRES IN 14 DAYS'}
        </p>
      </div>

      <div className="border border-[#2A2218] bg-[#110E08] p-6 mb-8 grid gap-3 md:grid-cols-[1fr_auto_auto] items-end">
        <div>
          <p className="text-[#5A4E38] text-xs tracking-widest mb-2">THEIR EMAIL (OPTIONAL — LOCKS THE LINK TO THEM)</p>
          <input className={input} type="email" placeholder="name@example.com" value={email}
            onChange={e => { setEmail(e.target.value); setError('') }} />
        </div>
        {scope === 'family' && (
          <div>
            <p className="text-[#5A4E38] text-xs tracking-widest mb-2">ACCESS</p>
            <select className={input} value={role} onChange={e => setRole(e.target.value as 'viewer' | 'admin')}>
              <option value="viewer">Viewer (can look)</option>
              <option value="admin">Admin (can add and edit)</option>
            </select>
          </div>
        )}
        <button
          onClick={createInvite}
          disabled={saving}
          className="bg-[#C9A84C] text-[#0A0804] px-5 py-3 text-xs tracking-widest hover:bg-[#E8C97A] transition-all disabled:opacity-50"
        >
          {saving ? 'CREATING...' : '+ CREATE LINK'}
        </button>
        {error && <p className="text-red-400 text-xs md:col-span-3">✗ {error}</p>}
      </div>

      {!invites.length ? (
        <p className="text-[#5A4E38] text-sm italic">No invites yet</p>
      ) : (
        <div className="space-y-3">
          {invites.map(i => {
            const s = status(i)
            return (
              <div key={i.id} className="border border-[#2A2218] bg-[#110E08] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#F0E6D0] text-sm">
                    {i.email || 'Anyone with the link'}
                    <span className="text-[#5A4E38] text-xs ml-2">
                      {scope === 'family' ? `· ${i.role}` : ''}
                    </span>
                  </p>
                  <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
                    <span className={s === 'ACTIVE' ? 'text-[#C9A84C]' : ''}>{s}</span>
                    {' · '}{new Date(i.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {s === 'ACTIVE' && (
                    <button onClick={() => copy(i)}
                      className="text-[#C9A84C] text-xs tracking-widest border border-[#3A3020] px-3 py-2 hover:border-[#C9A84C] transition-all">
                      COPY LINK
                    </button>
                  )}
                  <button onClick={() => revoke(i.id)}
                    className="text-red-900 text-xs tracking-widest border border-[#2A2218] px-3 py-2 hover:text-red-400 transition-all">
                    {s === 'ACTIVE' ? 'CANCEL' : 'REMOVE'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}