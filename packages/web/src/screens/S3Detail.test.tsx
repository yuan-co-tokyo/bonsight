import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S3Detail from './S3Detail'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

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
  beforeEach(() => mockNavigate.mockReset())

  it('bonsaiId b1 で名前「五葉松「翁」」が表示される', () => {
    renderS3Detail('b1')
    expect(screen.getByRole('heading', { name: '五葉松「翁」', level: 1 })).toBeInTheDocument()
  })

  it('樹齢・樹形・入手チップが表示される(S3-F4)', () => {
    renderS3Detail('b1')
    expect(screen.getByText('約25年')).toBeInTheDocument()
    expect(screen.getByText('根締木')).toBeInTheDocument()
    expect(screen.getByText('2025.5')).toBeInTheDocument()
  })

  it('「写真を追加」がprimary、「AIに診てもらう」がsecondary(S3-F5)', () => {
    renderS3Detail('b1')
    const addPhotoBtn = screen.getByRole('button', { name: /写真を追加/ })
    expect(addPhotoBtn).toHaveAttribute('data-variant', 'primary')
    const aiBtn = screen.getByRole('button', { name: /AIに診てもらう/ })
    expect(aiBtn).toHaveAttribute('data-variant', 'secondary')
  })

  it('「成長タイムライン」見出しが表示される(S3-F7)', () => {
    renderS3Detail('b1')
    expect(screen.getByRole('heading', { name: '成長タイムライン', level: 2 })).toBeInTheDocument()
  })

  it('タイムライン0件時に空状態が表示される', () => {
    // b3はSTUB_TIMELINEにエントリなし
    renderS3Detail('b3')
    expect(screen.getByText('まだ記録がありません')).toBeInTheDocument()
  })
})
