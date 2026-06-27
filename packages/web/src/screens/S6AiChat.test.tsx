import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S6AiChat from './S6AiChat'
import * as adviceApi from '../api/adviceApi'

vi.mock('../api/adviceApi', () => ({
  createAdvice: vi.fn(),
  getAdvices: vi.fn(),
  sendChat: vi.fn(),
  sendChatGeneral: vi.fn(),
}))

const mockSendChat = vi.mocked(adviceApi.sendChat)
const mockSendChatGeneral = vi.mocked(adviceApi.sendChatGeneral)

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS6(state?: object) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/s6', state: state ?? { bonsaiId: 'b1', bonsaiName: '翁', species: 'ゴヨウマツ' } }]}
    >
      <S6AiChat />
    </MemoryRouter>
  )
}

describe('S6AiChat', () => {
  beforeEach(() => {
    mockSendChat.mockReset()
    mockSendChatGeneral.mockReset()
    mockNavigate.mockReset()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('トップバーに「AI相談」タイトルが表示される', () => {
    renderS6()
    const items = screen.getAllByText('AI相談')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('文脈チップ行に bonsaiName が表示される', () => {
    renderS6()
    expect(screen.getByText('翁')).toBeInTheDocument()
  })

  it('文脈チップ行に species が表示される', () => {
    renderS6()
    expect(screen.getByText(/ゴヨウマツ/)).toBeInTheDocument()
  })

  it('初期メッセージは空 (スタブ除去)', () => {
    renderS6()
    expect(screen.queryByText(/こんにちは！/)).not.toBeInTheDocument()
  })

  it('入力フィールドが存在する', () => {
    renderS6()
    expect(screen.getByPlaceholderText('メッセージを入力…')).toBeInTheDocument()
  })

  it('免責テキストが表示される', () => {
    renderS6()
    expect(screen.getByText(/AIの回答は参考情報です。専門家・樹医の診断の代替ではありません。/)).toBeInTheDocument()
  })

  it('メッセージ送信 → sendChat が呼ばれ AI 吹き出しが追加される', async () => {
    mockSendChat.mockResolvedValue({ message: 'ご質問ありがとうございます。' })
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'テスト質問' } })
    fireEvent.click(screen.getByRole('button', { name: '送信' }))
    expect(screen.getByText('テスト質問')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockSendChat).toHaveBeenCalledWith('b1', 'テスト質問')
      expect(screen.getByText('ご質問ありがとうございます。')).toBeInTheDocument()
    })
  })

  it('sendChat エラー → エラーメッセージが表示される', async () => {
    mockSendChat.mockRejectedValue(new Error('chat API error: 500'))
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'エラー質問' } })
    fireEvent.click(screen.getByRole('button', { name: '送信' }))
    await waitFor(() => {
      expect(screen.getByText('ただいま混み合っています。後ほど再試行してください。')).toBeInTheDocument()
    })
  })

  it('bonsaiId なし → sendChatGeneral が呼ばれ sendChat は呼ばれない', async () => {
    mockSendChatGeneral.mockResolvedValue({ message: '汎用AI応答' })
    renderS6({})
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'テスト質問' } })
    fireEvent.click(screen.getByRole('button', { name: '送信' }))
    await waitFor(() => {
      expect(mockSendChatGeneral).toHaveBeenCalledWith('テスト質問')
      expect(mockSendChat).not.toHaveBeenCalled()
      expect(screen.getByText('汎用AI応答')).toBeInTheDocument()
    })
  })

  it('bonsaiId あり → sendChat(bonsaiId, ...) が呼ばれ sendChatGeneral は呼ばれない', async () => {
    mockSendChat.mockResolvedValue({ message: '盆栽AI応答' })
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'テスト質問' } })
    fireEvent.click(screen.getByRole('button', { name: '送信' }))
    await waitFor(() => {
      expect(mockSendChat).toHaveBeenCalledWith('b1', 'テスト質問')
      expect(mockSendChatGeneral).not.toHaveBeenCalled()
    })
  })

  it('Enter isComposing=true → sendMessage が発火しない (IMEガード)', async () => {
    mockSendChat.mockResolvedValue({ message: 'response' })
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'みず' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(mockSendChat).not.toHaveBeenCalled()
    expect(mockSendChatGeneral).not.toHaveBeenCalled()
  })

  it('Enter isComposing=false → sendMessage が発火する', async () => {
    mockSendChat.mockResolvedValue({ message: 'AI応答' })
    renderS6()
    const input = screen.getByPlaceholderText('メッセージを入力…')
    fireEvent.change(input, { target: { value: 'テスト' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    await waitFor(() => {
      expect(mockSendChat).toHaveBeenCalledWith('b1', 'テスト')
    })
  })
})
