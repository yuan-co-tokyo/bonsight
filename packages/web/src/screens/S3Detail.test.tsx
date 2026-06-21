import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S3Detail from './S3Detail'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS3Detail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/bonsai/${id}`]}>
      <Routes>
        <Route path="/bonsai/:id" element={<S3Detail />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S3Detail', () => {
  beforeEach(() => mockNavigate.mockReset())

  it('bonsaiId b1 で名前「五葉松」が表示される', () => {
    renderS3Detail('b1')
    expect(screen.getByText('五葉松')).toBeInTheDocument()
  })

  it('基本情報チップ(species/potSize/originArea)が表示される', () => {
    renderS3Detail('b1')
    // species は PhotoPlaceholder ラベルと Chip の両方に出るため getAllByText を使う
    expect(screen.getAllByText('Pinus parviflora').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('中鉢 6号')).toBeInTheDocument()
    expect(screen.getByText('関東')).toBeInTheDocument()
  })

  it('「写真を追加」「AIに診てもらう」ボタンがある', () => {
    renderS3Detail('b1')
    expect(screen.getByRole('button', { name: /写真を追加/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /AIに診てもらう/ })).toBeInTheDocument()
  })

  it('タイムライン0件時に空状態が表示される', () => {
    // b3はSTUB_TIMELINEにエントリなし
    renderS3Detail('b3')
    expect(screen.getByText('まだ記録がありません')).toBeInTheDocument()
  })
})
