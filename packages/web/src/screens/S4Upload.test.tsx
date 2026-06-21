import { render, screen, fireEvent } from '@testing-library/react'
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
  it('「キャンセル」テキストボタンが存在する(G1)', () => {
    renderS4Upload()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('写真を変更ピルが写真選択後に右上に存在する(G2)', () => {
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    renderS4Upload()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, {
      target: { files: [new File([''], 'test.jpg', { type: 'image/jpeg' })] },
    })
    expect(screen.getByText('写真を変更')).toBeInTheDocument()
  })

  it('「アップロード」ボタン(固定バー内)が存在する(G3)', () => {
    renderS4Upload()
    expect(screen.getByRole('button', { name: 'アップロード' })).toBeInTheDocument()
  })

  it('ファイル未選択時はアップロードボタンがdisabled', () => {
    renderS4Upload()
    expect(screen.getByRole('button', { name: 'アップロード' })).toBeDisabled()
  })

  it('トグル文言「アップロード後すぐAI診断にかける」が存在する(G4)', () => {
    renderS4Upload()
    expect(screen.getByText('アップロード後すぐAI診断にかける')).toBeInTheDocument()
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
