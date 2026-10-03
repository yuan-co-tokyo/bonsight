import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import S4Upload from './S4Upload'
import { getMedia, type MediaDtoEx } from '../api/mediaApi'
import { photoCaptureDate } from '../lib/photoCaptureDate'
import { captureFrame } from '../components/capture/captureFrame'
vi.mock('../api/mediaApi', () => ({
  getMedia: vi.fn(),
  createMedia: vi.fn(),
  getPresignUrl: vi.fn(),
}))
vi.mock('../lib/photoCaptureDate', () => ({
  photoCaptureDate: vi.fn(),
  localDateString: () => '2026-10-03',
}))
vi.mock('../components/capture/captureFrame', () => ({ captureFrame: vi.fn() }))
const previous = {
  id: 'p1',
  type: 'PHOTO',
  takenAt: '2025-01-01',
  createdAt: '2026-01-01',
  cloudfrontUrl: '/previous.jpg',
} as MediaDtoEx
const stop = vi.fn()
const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
const getUserMedia = vi.fn()
function mount() {
  return render(
    <MemoryRouter initialEntries={['/bonsai/b1/photo']}>
      <Routes>
        <Route path="/bonsai/:id/photo" element={<S4Upload />} />
      </Routes>
    </MemoryRouter>
  )
}
function selectFile() {
  fireEvent.change(document.querySelector('input[type=file]')!, {
    target: { files: [new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' })] },
  })
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getMedia).mockResolvedValue([previous])
  vi.mocked(photoCaptureDate).mockResolvedValue(null)
  getUserMedia.mockResolvedValue(stream)
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  URL.createObjectURL = vi.fn(() => 'blob:photo')
  URL.revokeObjectURL = vi.fn()
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
})
afterEach(() => vi.restoreAllMocks())
it('opens the environment camera and stops all tracks on close', async () => {
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'ガイド付きで撮影' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled())
  expect(getUserMedia).toHaveBeenCalledWith({
    video: { facingMode: 'environment', width: { ideal: 3840 }, height: { ideal: 2160 } },
    audio: false,
  })
  fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
  expect(stop).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
it('stops a stream on unmount, including one resolved after closing', async () => {
  let resolve!: (stream: MediaStream) => void
  getUserMedia.mockReturnValue(
    new Promise<MediaStream>((r) => {
      resolve = r
    })
  )
  const view = mount()
  fireEvent.click(await screen.findByRole('button', { name: 'ガイド付きで撮影' }))
  view.unmount()
  await act(async () => resolve(stream))
  expect(stop).toHaveBeenCalledOnce()
})
it('captures a File, returns to preview and fills today', async () => {
  const file = new File(['jpeg'], 'capture.jpg', { type: 'image/jpeg' })
  vi.mocked(captureFrame).mockResolvedValue(file)
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'ガイド付きで撮影' }))
  await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled())
  const img = screen.getByRole('img', { name: '前回の写真' })
  Object.defineProperties(img, { naturalWidth: { value: 1200 }, naturalHeight: { value: 1600 } })
  fireEvent.load(img)
  const video = document.querySelector('video')!
  fireEvent.loadedData(video)
  fireEvent.click(screen.getByRole('button', { name: '撮影する' }))
  expect(await screen.findByRole('img', { name: '選択済み写真' })).toBeInTheDocument()
  expect(captureFrame).toHaveBeenCalledWith(video, 0.75)
  expect(URL.createObjectURL).toHaveBeenCalledWith(file)
  expect(screen.getByLabelText('撮影日')).toHaveValue('2026-10-03')
  expect(stop).toHaveBeenCalledOnce()
})
it('falls back to file selection after permission is denied', async () => {
  getUserMedia.mockRejectedValue(new Error('denied'))
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'ガイド付きで撮影' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('写真を選択')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '写真を選択' })).toBeInTheDocument()
})
it.each(['unsupported', 'no photos'])('hides guide when %s', async (reason) => {
  if (reason === 'unsupported')
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined })
  else vi.mocked(getMedia).mockResolvedValue([])
  mount()
  await act(async () => {})
  expect(screen.queryByRole('button', { name: 'ガイド付きで撮影' })).not.toBeInTheDocument()
})
it('fills EXIF date and shows its source', async () => {
  vi.mocked(photoCaptureDate).mockResolvedValue('2024-03-05')
  mount()
  selectFile()
  await waitFor(() => expect(screen.getByLabelText('撮影日')).toHaveValue('2024-03-05'))
  expect(screen.getByText('写真の撮影日を入力しました')).toBeInTheDocument()
})
it('uses today without EXIF', async () => {
  mount()
  selectFile()
  await waitFor(() =>
    expect(screen.queryByText('写真の撮影日を確認しています…')).not.toBeInTheDocument()
  )
  expect(screen.getByLabelText('撮影日')).toHaveValue('2026-10-03')
})
it('does not overwrite a manually changed date when EXIF resolves later', async () => {
  let resolve!: (date: string) => void
  vi.mocked(photoCaptureDate).mockReturnValue(
    new Promise((r) => {
      resolve = r
    })
  )
  mount()
  selectFile()
  fireEvent.change(screen.getByLabelText('撮影日'), { target: { value: '2023-01-02' } })
  await act(async () => resolve('2024-03-05'))
  expect(screen.getByLabelText('撮影日')).toHaveValue('2023-01-02')
  expect(screen.queryByText('写真の撮影日を入力しました')).not.toBeInTheDocument()
})
