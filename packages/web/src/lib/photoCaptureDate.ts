import { parse } from 'exifr'
export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export async function photoCaptureDate(file: File): Promise<string | null> {
  try {
    const metadata: unknown = await parse(file, ['DateTimeOriginal'])
    if (!metadata || typeof metadata !== 'object' || !('DateTimeOriginal' in metadata)) return null
    const date = metadata.DateTimeOriginal
    return date instanceof Date && Number.isFinite(date.getTime()) ? localDateString(date) : null
  } catch {
    return null
  }
}
