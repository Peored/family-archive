import { supabase } from './supabase'

const BUCKET = 'family-media'
const TTL_SECONDS = 60 * 60 * 4 // signed links last 4 hours

const cache = new Map<string, { url: string; expires: number }>()

/** Works with an old public URL (…/family-media/<path>) or a bare path. */
export function mediaPathFromUrl(value?: string | null): string | null {
  if (!value) return null
  const marker = `/${BUCKET}/`
  const i = value.indexOf(marker)
  if (i === -1) return value.startsWith('http') ? null : value
  try {
    return decodeURIComponent(value.slice(i + marker.length).split('?')[0])
  } catch {
    return null
  }
}

/**
 * Replaces the given URL fields on each row with short-lived signed links.
 * If signing fails for a file, the original value is left as it was.
 */
export async function signMedia<T extends Record<string, any>>(rows: T[], fields: string[]): Promise<T[]> {
  const now = Date.now()
  const wanted = new Set<string>()
  for (const r of rows) {
    for (const f of fields) {
      const p = mediaPathFromUrl(r[f])
      if (p && !(cache.get(p) && cache.get(p)!.expires > now)) wanted.add(p)
    }
  }

  if (wanted.size) {
    const paths = Array.from(wanted)
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, TTL_SECONDS)
    for (const item of data || []) {
      if (item.path && item.signedUrl && !item.error) {
        cache.set(item.path, { url: item.signedUrl, expires: now + (TTL_SECONDS - 600) * 1000 })
      }
    }
  }

  return rows.map(r => {
    const copy: any = { ...r }
    for (const f of fields) {
      const p = mediaPathFromUrl(r[f])
      const hit = p ? cache.get(p) : undefined
      if (hit) copy[f] = hit.url
    }
    return copy as T
  })
}

/** Forget cached links (call on sign-out). */
export function clearMediaCache() {
  cache.clear()
}
