import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S3Detail from './S3Detail'

const { mockNavigate, mockGetBonsai } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetBonsai: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/bonsaiApi', () => ({
  getBonsai: mockGetBonsai,
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
    mockGetBonsai.mockImplementation((id: string) => Promise.resolve(bonsaiFixture(id)))
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
    const addPhotoBtn = await screen.findByRole('button', { name: /写真を追加/ })
    expect(addPhotoBtn).toHaveAttribute('data-variant', 'primary')
    const aiBtn = screen.getByRole('button', { name: /AIに診てもらう/ })
    expect(aiBtn).toHaveAttribute('data-variant', 'secondary')
  })

  it('「成長タイムライン」見出しが表示される(S3-F7)', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('heading', { name: '成長タイムライン', level: 2 })).toBeInTheDocument()
  })

  it('タイムライン0件時に空状態が表示される', async () => {
    // b3はSTUB_TIMELINEにエントリなし
    renderS3Detail('b3')
    expect(await screen.findByText('まだ記録がありません')).toBeInTheDocument()
  })
})
