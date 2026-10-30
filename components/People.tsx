'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getFamilyId } from '@/lib/family'

type Person = { user_id: string; email: string; role: 'admin' | 'viewer'; joined_at: string }

type Props = {
  showToast?: (msg: string, type?: 'success' | 'error') => void
}

export default function People({ showToast }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: { user } }, fid] = await Promise.all([supabase.auth.getUser(), getFamilyId()])
    setMe(user?.id ?? null)
    setFamilyId(fid)
    if (!fid) { setPeople([]); setLoading(false); return }
    const { data, error } = await supabase.rpc('list_family_members', { p_family_id: fid })
    if (error) showToast?.('Could not load the list of people', 'error')
    setPeople((data as Person[]) || [])
    setLoading(false)
  }

  async function changeRole(p: Person, role: 'admin' | 'viewer') {
    if (!familyId || role === p.role) return
    const msg = role === 'admin'
      ? `Make ${p.email} an admin? Admins can add, edit and delete everything, and invite or remove people.`
      : `Change ${p.email} to viewer? They will only be able to look.`
    if (!confirm(msg)) return
    setBusyId(p.user_id)
    const { error } = await supabase.rpc('set_member_role', { p_family_id: familyId, p_user_id: p.user_id, p_role: role })
    setBusyId(null)
    if (error) return showToast?.(error.message, 'error')
    showToast?.('Access updated')
    load()
  }

  async function remove(p: Person) {
    if (!familyId) return
    const isMe = p.user_id === me
    const msg = isMe
      ? 'Leave this archive? You will lose access until someone invites you again.'
      : `Remove ${p.email} from this archive? They will lose access immediately.`
    if (!confirm(msg)) return
    setBusyId(p.user_id)
    const { error } = await supabase.rpc('remove_member', { p_family_id: familyId, p_user_id: p.user_id })
    setBusyId(null)
    if (error) return showToast?.(error.message, 'error')
    if (isMe) { window.location.href = '/'; return }
    showToast?.('Person removed', 'error')
    load()
  }

  if (loading) return <p className="text-[#5A4E38] text-sm tracking-widest">LOADING...</p>

  return (
    <div>
      <div className="mb-8 border-b border-[#2A2218] pb-4">
        <h2 className="text-3xl font-light" style={{ fontFamily: 'Georgia,serif' }}>
          People with <em className="text-[#C9A84C]">Access</em>
        </h2>
        <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
          {people.length} PERSON{people.length !== 1 ? 'S' : ''} · ADMINS CAN EDIT · VIEWERS CAN ONLY LOOK
        </p>
      </div>

      {!people.length ? (
        <p className="text-[#5A4E38] text-sm italic">No one found</p>
      ) : (
        <div className="space-y-3">
          {people.map(p => {
            const isMe = p.user_id === me
            return (
              <div key={p.user_id} className="border border-[#2A2218] bg-[#110E08] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#F0E6D0] text-sm break-all">
                    {p.email}
                    {isMe && <span className="text-[#C9A84C] text-xs ml-2 tracking-widest">YOU</span>}
                  </p>
                  <p className="text-[#5A4E38] text-xs tracking-widest mt-1">
                    JOINED {new Date(p.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={p.role}
                    disabled={busyId === p.user_id}
                    onChange={e => changeRole(p, e.target.value as 'admin' | 'viewer')}
                    className="bg-[#0A0804] border border-[#3A3020] text-[#F0E6D0] text-xs tracking-widest px-3 py-2 outline-none focus:border-[#C9A84C]"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => remove(p)}
                    disabled={busyId === p.user_id}
                    className="text-red-900 text-xs tracking-widest border border-[#2A2218] px-3 py-2 hover:text-red-400 transition-all disabled:opacity-50"
                  >
                    {isMe ? 'LEAVE' : 'REMOVE'}
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
