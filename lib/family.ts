import { supabase } from './supabase'

export type Role = 'admin' | 'viewer'

export type Family = {
  id: string
  slug: string
  name: string
  tagline: string | null
}

export type ActiveFamily = { family: Family; role: Role }

const STORAGE_KEY = 'activeFamilyId'

let cache: Promise<ActiveFamily | null> | null = null

// Any sign-in / sign-out invalidates the cached family.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(() => {
    cache = null
  })
}

export function resetActiveFamily() {
  cache = null
}

export function setPreferredFamily(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  cache = null
}

async function load(): Promise<ActiveFamily | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('memberships')
    .select('role, created_at, families(id, slug, name, tagline)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error || !data?.length) return null

  let preferred: string | null = null
  try { preferred = localStorage.getItem(STORAGE_KEY) } catch {}

  const rows = data as any[]
  const row = rows.find(r => r.families?.id === preferred) ?? rows[0]
  const family = Array.isArray(row.families) ? row.families[0] : row.families
  if (!family) return null

  return { family, role: row.role === 'admin' ? 'admin' : 'viewer' }
}

/** The family the signed-in user is currently working in (null if none). */
export function getActiveFamily(): Promise<ActiveFamily | null> {
  if (!cache) cache = load()
  return cache
}

export async function getFamilyId(): Promise<string | null> {
  return (await getActiveFamily())?.family.id ?? null
}

/** Storage path inside the family-media bucket: <family_id>/<kind>/<random>.<ext> */
export function mediaPath(familyId: string, kind: 'photos' | 'voices' | 'members', file: File) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${familyId}/${kind}/${crypto.randomUUID()}.${ext || 'bin'}`
}
