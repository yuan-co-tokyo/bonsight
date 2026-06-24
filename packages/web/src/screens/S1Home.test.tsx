import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import S1Home from './S1Home'
import { STUB_BONSAI_LIST } from '../stubs/stubBonsai'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS1Home(props?: Parameters<typeof S1Home>[0]) {
  return render(
    <MemoryRouter>
      <S1Home {...props} />
    </MemoryRouter>
  )
}

describe('S1Home', () => {
  beforeEach(() => mockNavigate.mockReset())
  afterEach(() => vi.useRealTimers())

  it('スタブデータで盆栽カード一覧が表示される', () => {
    renderS1Home({ bonsaiList: STUB_BONSAI_LIST })
    expect(screen.getByText('五葉松「翁」')).toBeInTheDocument()
    expect(screen.getByText('真柏「蒼龍」')).toBeInTheDocument()
    expect(screen.getByText('欅「武蔵」')).toBeInTheDocument()
    expect(screen.getByText(`${STUB_BONSAI_LIST.length}本`)).toBeInTheDocument()
  })

  it('0件時に空状態メッセージが表示される', () => {
    renderS1Home({ bonsaiList: [] })
    expect(screen.getByText('盆栽がまだ登録されていません')).toBeInTheDocument()
    expect(screen.getByText('最初の盆栽を登録する')).toBeInTheDocument()
  })

  it('「盆栽を登録」カードがある', () => {
    renderS1Home({ bonsaiList: STUB_BONSAI_LIST })
    expect(screen.getByRole('button', { name: '盆栽を登録' })).toBeInTheDocument()
  })

  it('カードクリックでS3詳細へナビゲーション', async () => {
    const user = userEvent.setup()
    renderS1Home({ bonsaiList: STUB_BONSAI_LIST })
    await user.click(screen.getByRole('button', { name: '五葉松「翁」' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/b1')
  })

  it('ヘッダーにタイトルと件数が横並びで表示される(S1-F1)', () => {
    renderS1Home({ bonsaiList: STUB_BONSAI_LIST })
    const title = screen.getByRole('heading', { name: 'マイ盆栽', level: 1 })
    expect(title).toBeInTheDocument()
    const header = title.closest('.s1-header')
    expect(header).not.toBeNull()
    expect(header).toHaveTextContent(`${STUB_BONSAI_LIST.length}本`)
  })

  it('カードに相対日付が表示される(S1-F2)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-21'))
    renderS1Home({ bonsaiList: STUB_BONSAI_LIST })
    // b1: updatedAt '2026-06-18' → 3日前に更新
    expect(screen.getByText('3日前に更新')).toBeInTheDocument()
  })
})
