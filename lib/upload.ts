// Keeps uploads small so a family cannot fill the storage by accident.

export const MAX_PHOTO_INPUT_BYTES = 20 * 1024 * 1024 // refuse anything bigger before even trying
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const MAX_EDGE = 1600            // longest side after resizing, in pixels
const JPEG_QUALITY = 0.82
const ALREADY_SMALL_BYTES = 600 * 1024
const UNREADABLE_OK_BYTES = 5 * 1024 * 1024 // formats the browser cannot decode (e.g. HEIC) pass through only if this small

export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Resizes and re-encodes a photo as JPEG. Returns the original file when it is
 * already small, animated (GIF) or cannot be read by the browser and is small enough.
 * Throws an Error with a message that is safe to show to the user.
 */
export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a picture file.')
  }
  if (file.size > MAX_PHOTO_INPUT_BYTES) {
    throw new Error(`That picture is ${formatBytes(file.size)}, which is too large. The limit is ${formatBytes(MAX_PHOTO_INPUT_BYTES)}.`)
  }
  if (file.type === 'image/gif') {
    if (file.size > UNREADABLE_OK_BYTES) throw new Error('That GIF is too large. Please use a smaller one (under 5 MB).')
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    if (file.size <= UNREADABLE_OK_BYTES) return file
    throw new Error('Could not read that picture. Please save it as a JPEG or PNG and try again.')
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= ALREADY_SMALL_BYTES) {
    bitmap.close()
    return file
  }

  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.fillStyle = '#ffffff' // JPEG has no transparency
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob) return file
  // never make a file bigger
  if (scale === 1 && blob.size >= file.size) return file

  const base = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}

/** Throws an Error with a friendly message if the recording is not acceptable. */
export function checkAudio(file: File): void {
  if (!file.type.startsWith('audio/')) {
    throw new Error('Please choose an audio file.')
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error(`That recording is ${formatBytes(file.size)}, which is too large. The limit is ${formatBytes(MAX_AUDIO_BYTES)}.`)
  }
}
