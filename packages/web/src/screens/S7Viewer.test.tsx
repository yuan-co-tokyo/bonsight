import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S7Viewer from './S7Viewer'
import { STUB_TIMELINE } from '../stubs/stubTimeline'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS7(mediaId?: string) {
  const path = mediaId ? `/s7/${mediaId}` : '/s7'
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/s7/:mediaId" element={<S7Viewer />} />
        <Route path="/s7" element={<S7Viewer />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S7Viewer', () => {
  beforeEach(() => mockNavigate.mockReset())

  it('STUB_TIMELINEのnoteが表示される(最初のエントリ)', () => {
    renderS7()
    expect(screen.getAllByText(STUB_TIMELINE[0].note).length).toBeGreaterThan(0)
  })

  it('「この写真をAIに診てもらう」CTAボタンが存在する', () => {
    renderS7()
    expect(screen.getByRole('button', { name: /この写真をAIに診てもらう/ })).toBeInTheDocument()
  })

  it('次ボタンクリックでcurrentIndexが増加する(複数エントリある場合)', () => {
    renderS7()
    expect(screen.getAllByText(STUB_TIMELINE[0].note).length).toBeGreaterThan(0)
    const nextBtn = screen.getByRole('button', { name: '次の写真' })
    fireEvent.click(nextBtn)
    expect(screen.getAllByText(STUB_TIMELINE[1].note).length).toBeGreaterThan(0)
  })
})
