import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S4Upload from './S4Upload'

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const { mockGetPresignUrl, mockCreateMedia } = vi.hoisted(() => ({
  mockGetPresignUrl: vi.fn(),
  mockCreateMedia: vi.fn(),
}))
vi.mock('../api/mediaApi', () => ({
  getPresignUrl: mockGetPresignUrl,
  createMedia: mockCreateMedia,
}))

function renderS4Upload(bonsaiId = 'b1') {
  return render(
    <MemoryRouter initialEntries={[`/bonsai/${bonsaiId}/photo`]}>
      <Routes>
        <Route path="/bonsai/:id/photo" element={<S4Upload />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S4Upload', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockGetPresignUrl.mockReset()
    mockCreateMedia.mockReset()
  })

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

  it('ファイル選択→presign取得→S3 PUT→media登録フローが正常に動作する', async () => {
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response)
    mockGetPresignUrl.mockResolvedValue({
      presignedUrl: 'https://s3.example.com/presigned',
      s3Key: 'users/sub/bonsai/b1/ts-photo.jpg',
    })
    mockCreateMedia.mockResolvedValue({
      id: 'media-1',
      bonsaiId: 'b1',
      type: 'PHOTO',
      s3Key: 'users/sub/bonsai/b1/ts-photo.jpg',
      cloudfrontUrl: 'https://cdn.example.com/users/sub/bonsai/b1/ts-photo.jpg',
      createdAt: '2026-06-27T00:00:00.000Z',
    })

    renderS4Upload('b1')

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: 'アップロード' }))

    await waitFor(() => {
      expect(mockGetPresignUrl).toHaveBeenCalledWith('b1', 'photo.jpg', 'image/jpeg')
    })
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://s3.example.com/presigned',
        expect.objectContaining({ method: 'PUT' }),
      )
    })
    await waitFor(() => {
      expect(mockCreateMedia).toHaveBeenCalledWith(
        'b1',
        expect.objectContaining({ s3Key: 'users/sub/bonsai/b1/ts-photo.jpg' }),
      )
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/bonsai/b1/ai',
        expect.objectContaining({
          state: expect.objectContaining({
            mediaId: 'media-1',
            mediaUrl: 'https://cdn.example.com/users/sub/bonsai/b1/ts-photo.jpg',
          }),
        }),
      )
    })
  })

  it('autoDiagnose ONのとき navigate に replace:true が含まれる', async () => {
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response)
    mockGetPresignUrl.mockResolvedValue({
      presignedUrl: 'https://s3.example.com/presigned',
      s3Key: 'users/sub/bonsai/b1/ts-photo.jpg',
    })
    mockCreateMedia.mockResolvedValue({
      id: 'media-1',
      bonsaiId: 'b1',
      type: 'PHOTO',
      s3Key: 'users/sub/bonsai/b1/ts-photo.jpg',
      cloudfrontUrl: 'https://cdn.example.com/photo.jpg',
      createdAt: '2026-06-27T00:00:00.000Z',
    })

    renderS4Upload('b1')

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['img'], 'photo.jpg', { type: 'image/jpeg' })] } })
    fireEvent.click(screen.getByRole('button', { name: 'アップロード' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/bonsai/b1/ai',
        expect.objectContaining({ replace: true }),
      )
    })
  })

  it('S3 PUTが失敗するとエラーメッセージが表示される', async () => {
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 } as Response)
    mockGetPresignUrl.mockResolvedValue({
      presignedUrl: 'https://s3.example.com/presigned',
      s3Key: 'key',
    })

    renderS4Upload('b1')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, {
      target: { files: [new File(['img'], 'photo.jpg', { type: 'image/jpeg' })] },
    })

    fireEvent.click(screen.getByRole('button', { name: 'アップロード' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
