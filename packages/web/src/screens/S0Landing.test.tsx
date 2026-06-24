import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S0Landing from './S0Landing'

const mockSignInWithRedirect = vi.hoisted(() => vi.fn())
vi.mock('aws-amplify/auth', () => ({
  signInWithRedirect: mockSignInWithRedirect,
}))

function renderS0Landing() {
  return render(
    <MemoryRouter>
      <S0Landing />
    </MemoryRouter>
  )
}

describe('S0Landing', () => {
  beforeEach(() => mockSignInWithRedirect.mockReset())

  it('「bonsight」テキストが表示される', () => {
    renderS0Landing()
    expect(screen.getByText('bonsight')).toBeInTheDocument()
  })

  it('タグライン「AIが見守る、あなたの盆栽」が表示される(S0-H1)', () => {
    renderS0Landing()
    expect(screen.getByText('AIが見守る、あなたの盆栽')).toBeInTheDocument()
  })

  it('特徴3点の見出しが存在する(S0-H2)', () => {
    renderS0Landing()
    expect(screen.getByText('写真で残す')).toBeInTheDocument()
    expect(screen.getByText('AIが診る')).toBeInTheDocument()
    expect(screen.getByText('成長タイムライン')).toBeInTheDocument()
  })

  it('「ログイン」ボタン(Primary)が存在しクリックでsignInWithRedirect呼び出し(S0-H3)', async () => {
    const user = userEvent.setup()
    renderS0Landing()
    const btn = screen.getByRole('button', { name: 'ログイン' })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(mockSignInWithRedirect).toHaveBeenCalled()
  })

  it('「新規登録」ボタン(Secondary)が存在しクリックでsignInWithRedirect呼び出し(S0-H3)', async () => {
    const user = userEvent.setup()
    renderS0Landing()
    const btn = screen.getByRole('button', { name: '新規登録' })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(mockSignInWithRedirect).toHaveBeenCalled()
  })

  it('認証注記テキストが存在する(S0-M1)', () => {
    renderS0Landing()
    expect(screen.getByText('ログイン・新規登録は安全な認証画面へ移動します')).toBeInTheDocument()
  })
})
