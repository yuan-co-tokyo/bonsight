import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S3Detail from './S3Detail'

const { mockNavigate, mockGetBonsai, mockGetMedia } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetBonsai: vi.fn(),
  mockGetMedia: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/bonsaiApi', () => ({
  getBonsai: mockGetBonsai,
}))
vi.mock('../api/mediaApi', () => ({
  getMedia: mockGetMedia,
}))

function bonsaiFixture(id: string) {
  return {
    id,
    owner: 'owner-1',
    visibility: 'PRIVATE',
    name: id === 'b1' ? '五葉松「翁」' : '欅「武蔵」',
    species: id === 'b1' ? 'ゴヨウマツ・五葉松' : 'ケヤキ・欅',
    estimatedAge: id === 'b1' ? 25 : 8,
    origin: '購入',
    style: id === 'b1' ? '根締木' : '直幹',
    acquiredAt: id === 'b1' ? '2025.5' : '2022.11',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
  }
}

function mediaFixture(bonsaiId: string) {
  return [
    {
      id: 'm1',
      bonsaiId,
      type: 'PHOTO' as const,
      s3Key: `users/sub/bonsai/${bonsaiId}/early.jpg`,
      cloudfrontUrl: `https://cdn.example.com/users/sub/bonsai/${bonsaiId}/early.jpg`,
      takenAt: '2026-01-15T00:00:00.000Z',
      caption: '冬の様子',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'm2',
      bonsaiId,
      type: 'PHOTO' as const,
      s3Key: `users/sub/bonsai/${bonsaiId}/later.jpg`,
      cloudfrontUrl: `https://cdn.example.com/users/sub/bonsai/${bonsaiId}/later.jpg`,
      takenAt: '2026-06-10T00:00:00.000Z',
      caption: '芽摘み後',
      createdAt: '2026-06-10T00:00:00.000Z',
    },
  ]
}

function renderS3Detail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/bonsai/${id}`]}>
      <Routes>
        <Route path="/bonsai/:id" element={<S3Detail />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S3Detail', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockGetBonsai.mockReset()
    mockGetMedia.mockReset()
    mockGetBonsai.mockImplementation((id: string) => Promise.resolve(bonsaiFixture(id)))
    mockGetMedia.mockResolvedValue([])
  })

  it('bonsaiId b1 で名前「五葉松「翁」」が表示される', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })).toBeInTheDocument()
    expect(mockGetBonsai).toHaveBeenCalledWith('b1')
  })

  it('樹齢・樹形・入手チップが表示される(S3-F4)', async () => {
    renderS3Detail('b1')
    expect(await screen.findByText('約25年')).toBeInTheDocument()
    expect(screen.getByText('根締木')).toBeInTheDocument()
    expect(screen.getByText('2025.5')).toBeInTheDocument()
  })

  it('「写真を追加」がprimary、「AIに診てもらう」がsecondary(S3-F5)', async () => {
    renderS3Detail('b1')
    const addPhotoBtn = await screen.findByRole('button', { name: '写真を追加' })
    expect(addPhotoBtn).toHaveAttribute('data-variant', 'primary')
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).toHaveAttribute('data-variant', 'secondary')
  })

  it('「成長タイムライン」見出しが表示される(S3-F7)', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('heading', { name: '成長タイムライン', level: 2 })).toBeInTheDocument()
  })

  it('getMediaが返すmediaが撮影日昇順でレンダリングされる', async () => {
    const media = mediaFixture('b1')
    // 降順で返しても昇順に並ぶことを確認
    mockGetMedia.mockResolvedValue([media[1], media[0]])

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const images = screen.getAllByRole('img')
    // 最初の画像が takenAt 早い方 (m1: 2026-01)
    expect(images[0]).toHaveAttribute('src', media[0].cloudfrontUrl)
    // 2番目が m2 (2026-06)
    expect(images[1]).toHaveAttribute('src', media[1].cloudfrontUrl)
  })

  it('0枚時の空状態「まだ写真がありません」が表示される', async () => {
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    expect(await screen.findByText('まだ写真がありません')).toBeInTheDocument()
  })

  it('coverImageUrlありのとき hero <img> が表示される', async () => {
    mockGetBonsai.mockResolvedValue({
      ...bonsaiFixture('b1'),
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
    })
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const heroImg = screen.getByRole('img', { name: '五葉松「翁」' })
    expect(heroImg).toHaveAttribute('src', 'https://cdn.example.com/cover.jpg')
  })

  it('coverImageUrlなしのとき PhotoPlaceholder が表示され hero img はない', async () => {
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    // bonsaiFixture に coverImageUrl なし → PhotoPlaceholder (img ではない)
    expect(screen.queryByRole('img', { name: '五葉松「翁」' })).toBeNull()
  })

  it('写真なし+coverImageUrlなし → 「AIに診てもらう」がdisabled', async () => {
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).toBeDisabled()
  })

  it('写真あり → 「AIに診てもらう」がdisabledでない', async () => {
    mockGetMedia.mockResolvedValue(mediaFixture('b1'))
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).not.toBeDisabled()
  })

  it('coverImageUrlのみあり(mediaList空) → 「AIに診てもらう」がdisabledでない', async () => {
    mockGetBonsai.mockResolvedValue({
      ...bonsaiFixture('b1'),
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
    })
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).not.toBeDisabled()
  })

  it('サムネクリックでS7ビューアに遷移しmediaListとindexをstateで渡す', async () => {
    const media = mediaFixture('b1')
    mockGetMedia.mockResolvedValue(media)

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    // 最初のタイムラインカード（clickableなrole=button）をクリック
    const cards = screen.getAllByRole('button', { name: /\d+年/ })
    fireEvent.click(cards[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      `/s7/${media[0].id}`,
      expect.objectContaining({
        state: expect.objectContaining({ mediaList: media, initialIndex: 0 }),
      }),
    )
  })
})
