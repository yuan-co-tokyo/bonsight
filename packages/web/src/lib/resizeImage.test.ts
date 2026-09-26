import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resizeImage } from './resizeImage'
const drawImage = vi.fn()
const close = vi.fn()
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    fillRect: vi.fn(),
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
    callback(new Blob(['jpeg'], { type: 'image/jpeg' }))
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
it.each([
  [4000, 3000, 1568, 1176],
  [3000, 4000, 1176, 1568],
  [640, 480, 640, 480],
])('converts %sx%s without upscaling', async (width, height, expectedWidth, expectedHeight) => {
  const bitmap = { width, height, close }
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap))
  const result = await resizeImage(new File(['png'], 'tree.png', { type: 'image/png' }))
  expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, expectedWidth, expectedHeight)
  expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
    expect.any(Function),
    'image/jpeg',
    0.85
  )
  expect(result.name).toBe('tree.jpg')
  expect(result.type).toBe('image/jpeg')
  expect(close).toHaveBeenCalledOnce()
})
it('falls back to an image element and releases its URL', async () => {
  vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('unsupported')))
  URL.createObjectURL = vi.fn(() => 'blob:input')
  URL.revokeObjectURL = vi.fn()
  class FakeImage {
    naturalWidth = 2000
    naturalHeight = 1000
    onload?: () => void
    set src(_value: string) {
      this.onload?.()
    }
  }
  vi.stubGlobal('Image', FakeImage)
  await resizeImage(new File(['image'], 'photo.webp'))
  expect(drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0, 1568, 784)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:input')
})
it('releases bitmap when encoding fails', async () => {
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 100, height: 100, close }))
  vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation((callback) => callback(null))
  await expect(resizeImage(new File(['image'], 'photo.png'))).rejects.toThrow('変換')
  expect(close).toHaveBeenCalledOnce()
})
