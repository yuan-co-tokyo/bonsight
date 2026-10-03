import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import GrowthCompare from './GrowthCompare'
import { getMedia, type MediaDtoEx } from '../../api/mediaApi'
import { getBonsai } from '../../api/bonsaiApi'
import { dateGap } from './photoDates'
vi.mock('../../api/mediaApi', () => ({ getMedia: vi.fn() }))
vi.mock('../../api/bonsaiApi', () => ({ getBonsai: vi.fn() }))
const photos: MediaDtoEx[] = [
  {
    id: 'latest',
    bonsaiId: 'b1',
    type: 'PHOTO',
    s3Key: 'latest',
    cloudfrontUrl: '/latest.jpg',
    createdAt: '2026-06-01T00:00:00Z',
    takenAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'old',
    bonsaiId: 'b1',
    type: 'PHOTO',
    s3Key: 'old',
    cloudfrontUrl: '/old.jpg',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'middle',
    bonsaiId: 'b1',
    type: 'PHOTO',
    s3Key: 'middle',
    cloudfrontUrl: '/middle.jpg',
    createdAt: '2026-06-02T00:00:00Z',
    takenAt: '2025-05-01T00:00:00Z',
  },
]
function Location() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output>{location.search}</output>
      <button onClick={() => navigate(-1)}>戻る</button>
    </>
  )
}
function mount(query = '') {
  render(
    <MemoryRouter initialEntries={['/bonsai/b1/compare' + query]}>
      <Location />
      <Routes>
        <Route path="/bonsai/:id/compare" element={<GrowthCompare />} />
      </Routes>
    </MemoryRouter>
  )
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getMedia).mockResolvedValue(photos)
  vi.mocked(getBonsai).mockResolvedValue({ name: '五葉松' } as Awaited<
    ReturnType<typeof getBonsai>
  >)
})
it('defaults to oldest/latest by takenAt with createdAt fallback and shows elapsed months', async () => {
  mount()
  expect(await screen.findByRole('img', { name: '前の写真' })).toHaveAttribute('src', '/old.jpg')
  expect(screen.getByRole('img', { name: '後の写真' })).toHaveAttribute('src', '/latest.jpg')
  expect(screen.getByText('撮影日の差：1年5か月')).toBeInTheDocument()
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('before=old&after=latest')
  )
})
it('respects query selection, swaps, changes thumbnails and follows browser history', async () => {
  mount('?before=middle&after=old')
  expect(await screen.findByRole('img', { name: '前の写真' })).toHaveAttribute('src', '/middle.jpg')
  fireEvent.click(screen.getByRole('button', { name: '前後を入れ替える' }))
  expect(screen.getByRole('status')).toHaveTextContent('before=old&after=middle')
  fireEvent.click(screen.getByRole('button', { name: /後：.*latest/ }))
  expect(screen.getByRole('status')).toHaveTextContent('after=latest')
  fireEvent.click(screen.getByRole('button', { name: '戻る' }))
  await waitFor(() =>
    expect(screen.getByRole('img', { name: '後の写真' })).toHaveAttribute('src', '/middle.jpg')
  )
})
it('switches layouts and range changes the clipping boundary', async () => {
  mount()
  await screen.findByRole('img', { name: '前の写真' })
  fireEvent.change(screen.getByRole('slider', { name: '比較の境目' }), { target: { value: '25' } })
  expect(screen.getByRole('img', { name: '前の写真' })).toHaveStyle({
    clipPath: 'inset(0 75% 0 0)',
  })
  const after = screen.getByRole('img', { name: '後の写真' })
  Object.defineProperties(after, { naturalWidth: { value: 800 }, naturalHeight: { value: 1200 } })
  fireEvent.load(after)
  expect(parseFloat(screen.getByTestId('compare-frame').style.aspectRatio)).toBeCloseTo(800 / 1200)
  fireEvent.click(screen.getByRole('button', { name: '並べて表示' }))
  expect(screen.getByTestId('compare-side')).toBeInTheDocument()
  expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'スライダー表示' }))
  expect(screen.getByRole('slider')).toHaveValue('25')
})
it('replaces unknown query IDs with safe defaults', async () => {
  mount('?before=deleted&after=missing')
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('before=old&after=latest')
  )
})
it('does not compare fewer than two photos or videos', async () => {
  vi.mocked(getMedia).mockResolvedValue([photos[0], { ...photos[1], type: 'VIDEO' }])
  mount()
  expect(await screen.findByText(/比較には写真が2枚以上/)).toBeInTheDocument()
  expect(screen.queryByRole('slider')).not.toBeInTheDocument()
})
it('formats short and reverse date gaps', () => {
  expect(dateGap('2026-06-02', '2026-06-01')).toBe('1日')
  expect(dateGap('2026-06-01', '2026-06-01')).toBe('同じ日')
})

it('updates the boundary through pointer dragging', async () => {
  vi.stubGlobal('PointerEvent', MouseEvent)
  try {
    mount(); await screen.findByRole('img', { name: '前の写真' })
    const frame = screen.getByTestId('compare-frame')
    frame.setPointerCapture = vi.fn()
    frame.hasPointerCapture = vi.fn(() => true)
    frame.releasePointerCapture = vi.fn()
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ left: 10, width: 200 } as DOMRect)
    fireEvent.pointerDown(frame, { clientX: 60 })
    expect(screen.getByRole('slider')).toHaveValue('25')
    fireEvent.pointerMove(frame, { clientX: 160 })
    expect(screen.getByRole('slider')).toHaveValue('75')
    fireEvent.pointerUp(frame)
    expect(frame.releasePointerCapture).toHaveBeenCalled()
  } finally { vi.unstubAllGlobals() }
})
