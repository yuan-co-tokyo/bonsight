import { StrictMode } from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S5AiResult from './S5AiResult'
import { UserContext } from '../contexts/UserContext'
import type { UserDto } from 'shared'
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

function renderS5(state?: object, user: UserDto | null = null) {
  return render(
    <UserContext.Provider value={{ user, refreshUser: vi.fn() }}>
    <MemoryRouter initialEntries={[{ pathname: '/bonsai/b1/ai', state: state ?? {} }]}>
      <Routes>
        <Route path="/bonsai/:id/ai" element={<S5AiResult />} />
      </Routes>
    </MemoryRouter>
    </UserContext.Provider>
  )
}

function renderS5Strict(state?: object) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[{ pathname: '/bonsai/b1/ai', state: state ?? {} }]}>
        <Routes>
          <Route path="/bonsai/:id/ai" element={<S5AiResult />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>
  )
}

describe('S5AiResult', () => {
  beforeEach(() => {
    mockCreateAdvice.mockReset()
    mockNavigate.mockReset()
  })

  it('前回比較の状態・要約・詳細を表示する', async () => {
    const advice = { ...mockResult, diagnosis: { ...mockResult.diagnosis, comparison: { status: 'improved', summary: '葉色が改善しています', details: [{ aspect: '葉色', change: '緑が増えた', note: '写真で見える範囲' }] } } }
    renderS5({ advice })
    expect(await screen.findByRole('region', { name: '前回の診断との比較' })).toHaveTextContent('改善')
    expect(screen.getByText('葉色が改善しています')).toBeInTheDocument()
    expect(screen.getByText('写真で見える範囲')).toBeInTheDocument()
  })

  it('比較がない旧データは比較欄なしで表示する', async () => {
    renderS5({ advice: mockResult })
    await screen.findByRole('button', { name: 'この診断をカルテに保存' })
    expect(screen.queryByRole('region', { name: '前回の診断との比較' })).not.toBeInTheDocument()
  })

  it('not_comparable は比較が難しいと表示し、detailsなしでも表示できる', async () => {
    renderS5({ advice: { ...mockResult, diagnosis: { ...mockResult.diagnosis, comparison: { status: 'not_comparable', summary: '撮影角度が異なります' } } } })
    expect(await screen.findByText('比較が難しい')).toBeInTheDocument()
  })

  it.each([undefined, '東京都'])('地域が未設定の場合だけ設定への導線を出す: %s', async (region) => {
    renderS5({ advice: mockResult }, { id: 'u1', cognitoSub: 'sub1', displayName: '盆栽太郎', region })
    await screen.findByRole('button', { name: 'この診断をカルテに保存' })
    const link = screen.queryByRole('link', { name: '設定で地域を登録すると季節アドバイスの精度が上がります' })
    if (region) expect(link).not.toBeInTheDocument()
    else expect(link).toHaveAttribute('href', '/s8')
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

  it('「カルテに保存」ボタン押下で navigate が replace:true 付きでS3(/bonsai/b1)に呼ばれる', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'この診断をカルテに保存' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'この診断をカルテに保存' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/b1', { replace: true })
    expect(mockNavigate).not.toHaveBeenCalledWith(-1)
  })

  it('パンくずに盆栽詳細へのリンクがある', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5()
    expect(screen.getByRole('link', { name: '盆栽' })).toHaveAttribute('href', '/bonsai/b1')
    await screen.findByRole('button', { name: 'この診断をカルテに保存' })
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

describe('idempotencyガード (useRef)', () => {
  beforeEach(() => {
    mockCreateAdvice.mockReset()
    mockNavigate.mockReset()
  })

  it('StrictMode二重mountでも createAdvice は1回のみ呼ばれる', async () => {
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5Strict({ mediaId: 'm1' })
    await waitFor(() => {
      expect(screen.getByText('この盆栽はゴヨウマツですね。')).toBeInTheDocument()
    })
    expect(mockCreateAdvice).toHaveBeenCalledTimes(1)
  })

  it('retryKey更新で createAdvice が再び1回のみ呼ばれる', async () => {
    mockCreateAdvice.mockRejectedValueOnce(new Error('一時エラー'))
    mockCreateAdvice.mockResolvedValue(mockResult)
    renderS5Strict({ mediaId: 'm1' })
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(mockCreateAdvice).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '再試行' }))
    await waitFor(() => {
      expect(screen.getByText('この盆栽はゴヨウマツですね。')).toBeInTheDocument()
    })
    expect(mockCreateAdvice).toHaveBeenCalledTimes(2)
  })

  it('initialAdvice がある場合は createAdvice が呼ばれない', async () => {
    renderS5Strict({ advice: mockResult, mediaId: 'm1' })
    await waitFor(() => {
      expect(screen.getByText('この盆栽はゴヨウマツですね。')).toBeInTheDocument()
    })
    expect(mockCreateAdvice).not.toHaveBeenCalled()
  })
})
