import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S7Viewer from './S7Viewer'
import type { MediaDtoEx } from '../api/mediaApi'

const { mockNavigate, mockDeleteMedia } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockDeleteMedia: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/mediaApi', () => ({
  deleteMedia: mockDeleteMedia,
}))

const mediaList: MediaDtoEx[] = [
  {
    id: 'm1',
    bonsaiId: 'b1',
    type: 'PHOTO',
    s3Key: 'users/sub/bonsai/b1/photo1.jpg',
    cloudfrontUrl: 'https://cdn.example.com/photo1.jpg',
    takenAt: '2026-01-15T00:00:00.000Z',
    caption: '冬の様子',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'm2',
    bonsaiId: 'b1',
    type: 'PHOTO',
    s3Key: 'users/sub/bonsai/b1/photo2.jpg',
    cloudfrontUrl: 'https://cdn.example.com/photo2.jpg',
    takenAt: '2026-06-10T00:00:00.000Z',
    caption: '芽摘み後',
    createdAt: '2026-06-10T00:00:00.000Z',
  },
]

function renderS7(options: { mediaList?: MediaDtoEx[]; initialIndex?: number; mediaId?: string } = {}) {
  const { mediaList: list = mediaList, initialIndex = 0, mediaId = 'm1' } = options
  const path = `/s7/${mediaId}`
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: path, state: { mediaList: list, initialIndex } }]}
    >
      <Routes>
        <Route path="/s7/:mediaId" element={<S7Viewer />} />
        <Route path="/s7" element={<S7Viewer />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S7Viewer', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockDeleteMedia.mockResolvedValue(undefined)
  })

  it('mediaListの最初のエントリの写真がimg srcとして表示される', () => {
    renderS7({ initialIndex: 0 })
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mediaList[0].cloudfrontUrl)
  })

  it('キャプションが表示される', () => {
    renderS7({ initialIndex: 0 })
    expect(screen.getByText('冬の様子')).toBeInTheDocument()
  })

  it('「この写真をAIに診てもらう」CTAボタンが存在する', () => {
    renderS7()
    expect(screen.getByRole('button', { name: /この写真をAIに診てもらう/ })).toBeInTheDocument()
  })

  it('次ボタンクリックでcurrentIndexが増加し2枚目の画像に切り替わる', () => {
    renderS7({ initialIndex: 0 })
    expect(screen.getByRole('img')).toHaveAttribute('src', mediaList[0].cloudfrontUrl)

    const nextBtn = screen.getByRole('button', { name: '次の写真' })
    fireEvent.click(nextBtn)

    expect(screen.getByRole('img')).toHaveAttribute('src', mediaList[1].cloudfrontUrl)
  })

  it('最初のエントリでは前ボタンが表示されない', () => {
    renderS7({ initialIndex: 0 })
    expect(screen.queryByRole('button', { name: '前の写真' })).not.toBeInTheDocument()
  })

  it('最後のエントリでは次ボタンが表示されない', () => {
    renderS7({ initialIndex: 1 })
    expect(screen.queryByRole('button', { name: '次の写真' })).not.toBeInTheDocument()
  })

  it('stateなしで表示すると「写真が見つかりません」が表示される', () => {
    render(
      <MemoryRouter initialEntries={['/s7']}>
        <Routes>
          <Route path="/s7" element={<S7Viewer />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('写真が見つかりません')).toBeInTheDocument()
  })

  it('カウンター表示が正しい(1 / 2)', () => {
    renderS7({ initialIndex: 0 })
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  // 写真削除テスト

  it('「写真を削除」ボタンが表示される', () => {
    renderS7({ initialIndex: 0 })
    expect(screen.getByRole('button', { name: '写真を削除' })).toBeInTheDocument()
  })

  it('削除ボタンクリックで確認ダイアログが表示され、キャンセルで閉じる', async () => {
    renderS7({ initialIndex: 0 })

    fireEvent.click(screen.getByRole('button', { name: '写真を削除' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('診断データも削除されます。')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(mockDeleteMedia).not.toHaveBeenCalled()
  })

  it('確認ダイアログで「削除する」クリック → deleteMediaが呼ばれS3Detail(/bonsai/b1)へ遷移する', async () => {
    renderS7({ initialIndex: 0 })

    fireEvent.click(screen.getByRole('button', { name: '写真を削除' }))
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByRole('button', { name: '削除する' }))
    await waitFor(() => expect(mockDeleteMedia).toHaveBeenCalledWith('b1', 'm1'))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/b1', { replace: true })
  })
})
