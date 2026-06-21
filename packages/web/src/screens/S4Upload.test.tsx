import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import S4Upload from './S4Upload'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderS4Upload() {
  return render(
    <MemoryRouter>
      <S4Upload />
    </MemoryRouter>
  )
}

describe('S4Upload', () => {
  it('「写真をアップロード」ボタンが存在する', () => {
    renderS4Upload()
    expect(screen.getByRole('button', { name: '写真をアップロード' })).toBeInTheDocument()
  })

  it('ファイル未選択時はボタンがdisabled', () => {
    renderS4Upload()
    expect(screen.getByRole('button', { name: '写真をアップロード' })).toBeDisabled()
  })

  it('撮影日フィールドが存在する', () => {
    renderS4Upload()
    expect(screen.getByLabelText('撮影日')).toBeInTheDocument()
  })

  it('autoDiagnoseトグルが存在しデフォルトchecked', () => {
    renderS4Upload()
    const toggle = screen.getByRole('checkbox')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toBeChecked()
  })
})
