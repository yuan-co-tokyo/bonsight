import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S2Form from './S2Form'

const { mockNavigate, mockCreateBonsai, mockGetBonsai, mockUpdateBonsai } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockCreateBonsai: vi.fn(),
  mockGetBonsai: vi.fn(),
  mockUpdateBonsai: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/bonsaiApi', () => ({
  createBonsai: mockCreateBonsai,
  getBonsai: mockGetBonsai,
  updateBonsai: mockUpdateBonsai,
}))

function renderS2Form(initialPath = '/bonsai/new') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/bonsai/new" element={<S2Form />} />
        <Route path="/bonsai/:id/edit" element={<S2Form />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S2Form', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockCreateBonsai.mockReset()
    mockGetBonsai.mockReset()
    mockUpdateBonsai.mockReset()
    mockCreateBonsai.mockResolvedValue({ id: 'created-1' })
  })

  it('フォームフィールドが全件表示される', () => {
    renderS2Form()
    expect(screen.getByLabelText('名前・愛称')).toBeInTheDocument()
    expect(screen.getByLabelText('樹種')).toBeInTheDocument()
    expect(screen.getByLabelText('樹齢')).toBeInTheDocument()
    expect(screen.getByLabelText('樹形')).toBeInTheDocument()
    expect(screen.getByLabelText('入手日')).toBeInTheDocument()
    expect(screen.getByLabelText('メモ')).toBeInTheDocument()
  })

  it('name空欄で保存するとエラー状態になる(バリデーション)', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockNavigate).not.toHaveBeenCalled()
    const nameInput = screen.getByLabelText('名前・愛称')
    expect(nameInput).toHaveStyle({ color: 'var(--status-danger-text)' })
  })

  it('name入力後にcreateBonsaiで保存して詳細へ遷移', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), '五葉松「翁」')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockCreateBonsai).toHaveBeenCalledWith(expect.objectContaining({ name: '五葉松「翁」' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/created-1')
  })

  it('編集モードでgetBonsaiの値を初期表示しupdateBonsaiで保存する', async () => {
    mockGetBonsai.mockResolvedValue({
      id: 'b10',
      owner: 'owner-1',
      visibility: 'PRIVATE',
      name: '黒松',
      species: 'クロマツ',
      estimatedAge: 12,
      origin: '購入',
      style: '模様木',
      acquiredAt: '2026-06-01',
      currentState: '元気',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })
    const user = userEvent.setup()
    renderS2Form('/bonsai/b10/edit')

    expect(await screen.findByDisplayValue('黒松')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(mockUpdateBonsai).toHaveBeenCalledWith('b10', expect.objectContaining({ name: '黒松' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/b10')
  })

  it('「表紙写真を追加」タイルが存在する(S2-H1)', () => {
    renderS2Form()
    expect(screen.getByText('表紙写真を追加')).toBeInTheDocument()
  })

  it('入力フィールドがboxedスタイルである(S2-H2)', () => {
    renderS2Form()
    const nameInput = screen.getByLabelText('名前・愛称')
    expect(nameInput).toHaveStyle({ borderRadius: '10px' })
  })

  it('「実生」「挿し木」「購入」セグメントが存在する(S2-M1)', () => {
    renderS2Form()
    expect(screen.getByRole('button', { name: '実生' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '挿し木' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '購入' })).toBeInTheDocument()
  })

  it('「名前・愛称」ラベルが表示される(S2-L1)', () => {
    renderS2Form()
    expect(screen.getByText(/名前・愛称/)).toBeInTheDocument()
  })
})
