import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S6AiChat from './S6AiChat'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS6() {
  return render(
    <MemoryRouter initialEntries={['/s6']}>
      <S6AiChat />
    </MemoryRouter>
  )
}

describe('S6AiChat', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('トップバーに「AI相談」タイトルが表示される', () => {
    renderS6()
    const items = screen.getAllByText('AI相談')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('文脈チップ行に「五葉松「翁」」が表示される', () => {
    renderS6()
    expect(screen.getByText('五葉松「翁」')).toBeInTheDocument()
  })

  it('初期AIメッセージ(STUB_CHAT_MESSAGES[0])が表示される', () => {
    renderS6()
    expect(screen.getByText(/こんにちは！五葉松「翁」についてご相談ですね/)).toBeInTheDocument()
  })

  it('入力フィールドが存在する', () => {
    renderS6()
    expect(screen.getByPlaceholderText('メッセージを入力…')).toBeInTheDocument()
  })

  it('メッセージ送信でUserBubbleが追加される', () => {
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'テスト質問' } })
    const sendBtn = screen.getByRole('button', { name: '送信' })
    fireEvent.click(sendBtn)
    expect(screen.getByText('テスト質問')).toBeInTheDocument()
  })
})
