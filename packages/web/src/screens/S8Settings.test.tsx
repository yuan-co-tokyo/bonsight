import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S8Settings from './S8Settings'

const mockSignOut = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock('aws-amplify/auth', () => ({
  signOut: mockSignOut,
}))

const mockGetMe = vi.hoisted(() => vi.fn())
const mockUpdateMe = vi.hoisted(() => vi.fn())
vi.mock('../api/meApi', () => ({
  getMe: mockGetMe,
  updateMe: mockUpdateMe,
}))

const USER_FIXTURE = {
  id: 'user-001',
  cognitoSub: 'sub-001',
  displayName: '田中 翔',
  email: 'takashi@example.com',
  region: '東京',
  climatezone: '温帯',
}

function renderS8Settings() {
  return render(
    <MemoryRouter>
      <S8Settings />
    </MemoryRouter>
  )
}

describe('S8Settings', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockGetMe.mockReset()
    mockUpdateMe.mockReset()
    mockGetMe.mockResolvedValue(USER_FIXTURE)
  })

  it('getMe が呼ばれ、取得データが表示される', async () => {
    renderS8Settings()
    expect(mockGetMe).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      const matches = screen.getAllByText(USER_FIXTURE.displayName)
      expect(matches.length).toBeGreaterThan(0)
    })
    expect(screen.getByText('東京 · 温帯')).toBeInTheDocument()
  })

  it('ローディング中は「読み込み中...」が表示される', () => {
    mockGetMe.mockReturnValue(new Promise(() => {}))
    renderS8Settings()
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('編集フォームで updateMe が呼ばれ保存される', async () => {
    const user = userEvent.setup()
    mockUpdateMe.mockResolvedValue({ ...USER_FIXTURE, region: '関東', climatezone: '温帯' })
    renderS8Settings()
    await waitFor(() => screen.getByText('編集'))

    await user.click(screen.getByText('編集'))

    const regionInput = screen.getByPlaceholderText('例: 東京、関東')
    await user.clear(regionInput)
    await user.type(regionInput, '関東')

    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(mockUpdateMe).toHaveBeenCalledWith(
        expect.objectContaining({ region: '関東' })
      )
    })
  })

  it('displayName が空の場合は保存されない', async () => {
    const user = userEvent.setup()
    renderS8Settings()
    await waitFor(() => screen.getByText('編集'))

    await user.click(screen.getByText('編集'))

    const nameInput = screen.getByPlaceholderText('表示名を入力')
    await user.clear(nameInput)

    const saveBtn = screen.getByRole('button', { name: '保存' })
    expect(saveBtn).toBeDisabled()
    await user.click(saveBtn)
    expect(mockUpdateMe).not.toHaveBeenCalled()
  })

  it('「地域・気候帯」行が表示される', async () => {
    renderS8Settings()
    await waitFor(() => expect(screen.getByText('地域・気候帯')).toBeInTheDocument())
  })

  it('ログアウトボタンが存在しクリックでsignOut呼び出し', async () => {
    const user = userEvent.setup()
    renderS8Settings()
    await waitFor(() => screen.getByRole('button', { name: 'ログアウト' }))
    const logoutBtn = screen.getByRole('button', { name: 'ログアウト' })
    expect(logoutBtn).toBeInTheDocument()
    await user.click(logoutBtn)
    expect(mockSignOut).toHaveBeenCalled()
  })
})
