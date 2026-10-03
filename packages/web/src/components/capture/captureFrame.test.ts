import { afterEach, expect, it, vi } from 'vitest'
import { captureFrame, coverCrop } from './captureFrame'
afterEach(() => vi.restoreAllMocks())
it('crops wide and tall streams like centered object-fit cover', () => {
  expect(coverCrop(3840, 2160, 4 / 3)).toEqual({ x: 480, y: 0, width: 2880, height: 2160 })
  expect(coverCrop(2160, 3840, 1)).toEqual({ x: 0, y: 840, width: 2160, height: 2160 })
})
it('creates a JPEG File from the visible source pixels without resizing to screen dimensions', async () => {
  const video = document.createElement('video')
  Object.defineProperties(video, { videoWidth: { value: 3840 }, videoHeight: { value: 2160 } })
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  const toBlob = vi
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((callback) => callback(new Blob(['jpeg'], { type: 'image/jpeg' })))
  const file = await captureFrame(video, 4 / 3)
  expect(file).toBeInstanceOf(File)
  expect(file.type).toBe('image/jpeg')
  expect(file.name).toMatch(/\.jpg$/)
  expect(drawImage).toHaveBeenCalledWith(video, 480, 0, 2880, 2160, 0, 0, 2880, 2160)
  expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92)
})
