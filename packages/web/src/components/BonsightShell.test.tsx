import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { UserContext } from '../contexts/UserContext'
import BonsightShell from './BonsightShell'

const renderShell = (userValue: { displayName?: string } | null = null) => {
  const contextValue = {
    user: userValue as Parameters<typeof UserContext.Provider>[0]['value']['user'],
    refreshUser: vi.fn(),
  }
  return render(
    <UserContext.Provider value={contextValue}>
      <MemoryRouter>
        <BonsightShell screen="S1" showTabBar showAvatar activeTab="home">
          <div>テストコンテンツ</div>
        </BonsightShell>
      </MemoryRouter>
    </UserContext.Provider>
  )
}

describe('BonsightShell', () => {
  it('renders children', () => {
    renderShell()
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })

  it('アバターが displayName の頭文字 (大文字) を表示する', () => {
    renderShell({ displayName: 'Takahiro' })
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('日本語 displayName の頭文字を表示する', () => {
    renderShell({ displayName: '田中太郎' })
    expect(screen.getByText('田')).toBeInTheDocument()
  })

  it('displayName 未設定時は ? を表示する', () => {
    renderShell({ displayName: undefined })
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('user が null の場合は ? を表示する', () => {
    renderShell(null)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
