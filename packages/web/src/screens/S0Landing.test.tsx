import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S0Landing from './S0Landing'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS0Landing() {
  return render(
    <MemoryRouter>
      <S0Landing />
    </MemoryRouter>
  )
}

describe('S0Landing', () => {
  beforeEach(() => mockNavigate.mockReset())

  it('「bonsight」テキストが表示される', () => {
    renderS0Landing()
    expect(screen.getByText('bonsight')).toBeInTheDocument()
  })

  it('「はじめる」ボタンが存在しクリックでナビゲーション', async () => {
    const user = userEvent.setup()
    renderS0Landing()
    const btn = screen.getByRole('button', { name: 'はじめる' })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('特徴3点のテキストが存在する', () => {
    renderS0Landing()
    expect(screen.getByText('カルテで盆栽を一元管理')).toBeInTheDocument()
    expect(screen.getByText('写真で成長タイムラインを記録')).toBeInTheDocument()
    expect(screen.getByText('AIが樹木の状態を診断・アドバイス')).toBeInTheDocument()
  })
})
