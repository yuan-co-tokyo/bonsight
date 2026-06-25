import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S8Settings from './S8Settings'
import { STUB_USER } from '../stubs/stubUser'

const mockSignOut = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock('aws-amplify/auth', () => ({
  signOut: mockSignOut,
}))

function renderS8Settings() {
  return render(
    <MemoryRouter>
      <S8Settings />
    </MemoryRouter>
  )
}

describe('S8Settings', () => {
  beforeEach(() => mockSignOut.mockReset())

  it('STUB_USERの displayName が表示される', () => {
    renderS8Settings()
    const matches = screen.getAllByText(STUB_USER.displayName)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('「地域・気候帯」行が表示される', () => {
    renderS8Settings()
    expect(screen.getByText('地域・気候帯')).toBeInTheDocument()
  })

  it('ログアウトボタンが存在しクリックでsignOut呼び出し', async () => {
    const user = userEvent.setup()
    renderS8Settings()
    const logoutBtn = screen.getByRole('button', { name: 'ログアウト' })
    expect(logoutBtn).toBeInTheDocument()
    await user.click(logoutBtn)
    expect(mockSignOut).toHaveBeenCalled()
  })
})
