import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S2Form from './S2Form'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS2Form() {
  return render(
    <MemoryRouter>
      <S2Form />
    </MemoryRouter>
  )
}

describe('S2Form', () => {
  beforeEach(() => mockNavigate.mockReset())

  it('フォームフィールドが全件表示される', () => {
    renderS2Form()
    expect(screen.getByLabelText('樹木の名前')).toBeInTheDocument()
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
    const nameInput = screen.getByLabelText('樹木の名前')
    expect(nameInput).toHaveStyle({ color: 'var(--status-danger-text)' })
  })

  it('name入力後に保存でナビゲーション呼び出し', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('樹木の名前'), '五葉松「翁」')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })
})
