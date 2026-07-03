import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S5AiResult from './S5AiResult'
import * as adviceApi from '../api/adviceApi'

vi.mock('../api/adviceApi', () => ({
  createAdvice: vi.fn(),
  getAdvices: vi.fn(),
  sendChat: vi.fn(),
}))

const mockCreateAdvice = vi.mocked(adviceApi.createAdvice)

const mockResult: adviceApi.AdviceResult = {
  id: 'adv1',
  bonsaiId: 'b1',
  mediaId: 'm1',
  diagnosis: {
    species: 'ゴヨウマツ',
    health: [
      { key: 'water', label: '水分', level: 'good' },
      { key: 'root', label: '根詰まり', level: 'warning' },
    ],
    styling: '芽摘みで枝先を整えましょう。',
    seasonal: '来春の植替えを検討してください。',
    confidence: 0.92,
    disclaimer: '※ AIの回答は参考情報です。専門家の診断の代替ではありません。',
  },
  confidence: 0.92,
  createdAt: '2026-06-27T00:00:00Z',
}

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS5(state?: object) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/bonsai/b1/ai', state: state ?? {} }]}>
      <Routes>
        <Route path="/bonsai/:id/ai" element={<S5AiResult />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S5AiResult', () => {
  beforeEach(() => {
    mockCreateAdvice.mockReset()
    mockNavigate.mockReset()
  })

  it('loading 状態: SparkleIcon + AI診断中 が表示される', () => {
    mockCreateAdvice.mockReturnValue(new Promise(() => {}))
    renderS5()
    expect(screen.getByText('AI診断中...')).toBeInTheDocument()
  })

  it('result 状態: createAdvice 解決後に species が表示される', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5({ mediaId: 'm1' })
    await waitFor(() => {
      expect(screen.getByText('この盆栽はゴヨウマツですね。')).toBeInTheDocument()
    })
  })

  it('result 状態: health フラグが表示される', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByText('水分')).toBeInTheDocument()
      expect(screen.getByText('根詰まり')).toBeInTheDocument()
    })
  })

  it('result 状態: styling が表示される', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByText('芽摘みで枝先を整えましょう。')).toBeInTheDocument()
    })
  })

  it('免責(disclaimer)が API 返却値で表示される', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByText(/AIの回答は参考情報です。専門家の診断の代替ではありません。/)).toBeInTheDocument()
    })
  })

  it('error 状態: createAdvice reject 後にエラーメッセージが表示される', async () => {
    mockCreateAdvice.mockRejectedValue(new Error('advice API error: 500'))
    renderS5()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/advice API error: 500/)).toBeInTheDocument()
    })
  })

  it('error 状態: 「再試行」ボタンが存在する', async () => {
    mockCreateAdvice.mockRejectedValue(new Error('エラー'))
    renderS5()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument()
    })
  })

  it('「カルテに保存」ボタン押下で navigate(-1) が呼ばれる', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'この診断をカルテに保存' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'この診断をカルテに保存' }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('low_confidence: confidence < 0.5 のとき低信頼度注記が表示される', async () => {
    const lowResult: adviceApi.AdviceResult = {
      ...mockResult,
      diagnosis: { ...mockResult.diagnosis, confidence: 0.3 },
      confidence: 0.3,
    }
    mockCreateAdvice.mockResolvedValue(lowResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByTestId('low-confidence-note')).toBeInTheDocument()
    })
  })
})
