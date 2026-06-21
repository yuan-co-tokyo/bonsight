import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import S5AiResult from './S5AiResult'
import { STUB_AI_RESULT } from '../stubs/stubAiResult'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS5AiResult() {
  return render(
    <MemoryRouter>
      <S5AiResult />
    </MemoryRouter>
  )
}

describe('S5AiResult', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockNavigate.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it('loading=false 状態でAIBadge(AI診断)が表示される', async () => {
    renderS5AiResult()
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByText('AI診断')).toBeInTheDocument()
  })

  it('STUB_AI_RESULTの樹種が表示される', async () => {
    renderS5AiResult()
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByText(`樹種: ${STUB_AI_RESULT.species}`)).toBeInTheDocument()
  })

  it('免責ノートのテキストが表示される(必須)', async () => {
    renderS5AiResult()
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByText(/AIによる参考情報です。最終判断はご自身でお願いします。/)).toBeInTheDocument()
  })

  it('「カルテに保存」ボタンが存在する', async () => {
    renderS5AiResult()
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByRole('button', { name: 'この診断をカルテに保存' })).toBeInTheDocument()
  })
})
