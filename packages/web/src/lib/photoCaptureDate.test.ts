import { parse } from 'exifr'
import { expect, it, vi } from 'vitest'
import { localDateString, photoCaptureDate } from './photoCaptureDate'
vi.mock('exifr', () => ({ parse: vi.fn() }))
const file = new File(['photo'], 'photo.jpg')
it('uses DateTimeOriginal in local calendar time', async () => {
  vi.mocked(parse).mockResolvedValue({ DateTimeOriginal: new Date(2024, 2, 5, 0, 10) })
  expect(await photoCaptureDate(file)).toBe('2024-03-05')
  expect(parse).toHaveBeenCalledWith(file, ['DateTimeOriginal'])
  expect(localDateString(new Date(2024, 0, 1, 0, 1))).toBe('2024-01-01')
})
it('ignores missing, invalid and unreadable metadata', async () => {
  for (const value of [undefined, {}, { DateTimeOriginal: new Date('invalid') }]) {
    vi.mocked(parse).mockResolvedValue(value)
    expect(await photoCaptureDate(file)).toBeNull()
  }
  vi.mocked(parse).mockRejectedValue(new Error('invalid photo'))
  expect(await photoCaptureDate(file)).toBeNull()
})
