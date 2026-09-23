import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S2Form from './S2Form'

const { mockNavigate, mockCreateBonsai, mockGetBonsai, mockUpdateBonsai, mockGetCoverPresignUrl } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockCreateBonsai: vi.fn(),
  mockGetBonsai: vi.fn(),
  mockUpdateBonsai: vi.fn(),
  mockGetCoverPresignUrl: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/bonsaiApi', () => ({
  createBonsai: mockCreateBonsai,
  getBonsai: mockGetBonsai,
  updateBonsai: mockUpdateBonsai,
  getCoverPresignUrl: mockGetCoverPresignUrl,
}))

function renderS2Form(initialPath = '/bonsai/new') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/bonsai/new" element={<S2Form />} />
        <Route path="/bonsai/:id/edit" element={<S2Form />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('S2Form', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockCreateBonsai.mockReset()
    mockGetBonsai.mockReset()
    mockUpdateBonsai.mockReset()
    mockGetCoverPresignUrl.mockReset()
    mockCreateBonsai.mockResolvedValue({ id: 'created-1' })
  })

  it('nullの樹齢は空欄、ISO日付は日付入力欄に表示する', async () => {
    mockGetBonsai.mockResolvedValue({ name: '松', estimatedAge: null, acquiredAt: '2026-06-01T00:00:00.000Z' })
    renderS2Form('/bonsai/b1/edit')
    await screen.findByDisplayValue('松')
    expect(screen.getByLabelText('樹齢')).toHaveValue(null)
    expect(screen.getByLabelText('入手日')).toHaveValue('2026-06-01')
    expect(screen.queryByDisplayValue('null')).not.toBeInTheDocument()
  })

  it('編集で空欄にした任意項目をnullで送る', async () => {
    mockGetBonsai.mockResolvedValue({ name: '松', species: '黒松', estimatedAge: 25, acquiredAt: '2026-06-01T00:00:00.000Z', style: '直幹', currentState: '元気', origin: '購入' })
    const user = userEvent.setup()
    renderS2Form('/bonsai/b1/edit')
    await screen.findByDisplayValue('松')
    for (const label of ['樹種', '樹齢', '入手日', 'メモ']) fireEvent.change(screen.getByLabelText(label), { target: { value: '' } })
    await user.selectOptions(screen.getByLabelText('樹形'), '')
    await user.click(screen.getByRole('button', { name: '購入' }))
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockUpdateBonsai).toHaveBeenCalledWith('b1', expect.objectContaining({ species: null, estimatedAge: null, acquiredAt: null, style: null, currentState: null, origin: null }))
  })

  it.each(['-1', '1.5', '2147483648'])('不正な樹齢%sは送信しない', async (value) => {
    renderS2Form()
    fireEvent.change(screen.getByLabelText('名前・愛称'), { target: { value: '松' } })
    fireEvent.change(screen.getByLabelText('樹齢'), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByRole('alert')).toHaveTextContent('整数')
    expect(mockCreateBonsai).not.toHaveBeenCalled()
  })

  it('ブラウザが数値に変換できない入力も送信しない', () => {
    renderS2Form()
    fireEvent.change(screen.getByLabelText('名前・愛称'), { target: { value: '松' } })
    const age = screen.getByLabelText('樹齢')
    Object.defineProperty(age, 'validity', { configurable: true, value: { badInput: true } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByRole('alert')).toHaveTextContent('整数')
    expect(mockCreateBonsai).not.toHaveBeenCalled()
  })

  it('樹齢0を数値として送信する', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), '実生')
    await user.type(screen.getByLabelText('樹齢'), '0')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockCreateBonsai).toHaveBeenCalledWith(expect.objectContaining({ estimatedAge: 0 }))
  })

  it('保存APIのエラー内容を画面に表示する', async () => {
    mockCreateBonsai.mockRejectedValue(new Error('API error: 400 入手日が不正です'))
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), '松')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('入手日が不正です')
  })

  it('フォームフィールドが全件表示される', () => {
    renderS2Form()
    expect(screen.getByLabelText('名前・愛称')).toBeInTheDocument()
    expect(screen.getByLabelText('樹種')).toBeInTheDocument()
    expect(screen.getByLabelText('樹齢')).toBeInTheDocument()
    expect(screen.getByLabelText('樹形')).toBeInTheDocument()
    expect(screen.getByLabelText('入手日')).toBeInTheDocument()
    expect(screen.getByLabelText('メモ')).toBeInTheDocument()
  })

  it('name空欄で保存するとエラー状態になる(バリデーション)', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockNavigate).not.toHaveBeenCalled()
    const nameInput = screen.getByLabelText('名前・愛称')
    expect(nameInput).toHaveStyle({ color: 'var(--status-danger-text)' })
  })

  it('name入力後にcreateBonsaiで保存して詳細へ遷移', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), '五葉松「翁」')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockCreateBonsai).toHaveBeenCalledWith(expect.objectContaining({ name: '五葉松「翁」' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/created-1', { replace: true })
  })

  it('編集モードでgetBonsaiの値を初期表示しupdateBonsaiで保存する', async () => {
    mockGetBonsai.mockResolvedValue({
      id: 'b10',
      owner: 'owner-1',
      visibility: 'PRIVATE',
      name: '黒松',
      species: 'クロマツ',
      estimatedAge: 12,
      origin: '購入',
      style: '模様木',
      acquiredAt: '2026-06-01',
      currentState: '元気',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })
    const user = userEvent.setup()
    renderS2Form('/bonsai/b10/edit')

    expect(await screen.findByDisplayValue('黒松')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(mockUpdateBonsai).toHaveBeenCalledWith('b10', expect.objectContaining({ name: '黒松' }))
    expect(mockNavigate).toHaveBeenCalledWith('/bonsai/b10', { replace: true })
  })

  it('「表紙写真を追加」タイルが存在する(S2-H1)', () => {
    renderS2Form()
    expect(screen.getByText('表紙写真を追加')).toBeInTheDocument()
  })

  it('入力フィールドがboxedスタイルである(S2-H2)', () => {
    renderS2Form()
    const nameInput = screen.getByLabelText('名前・愛称')
    expect(nameInput).toHaveStyle({ borderRadius: '10px' })
  })

  it('「実生」「挿し木」「購入」セグメントが存在する(S2-M1)', () => {
    renderS2Form()
    expect(screen.getByRole('button', { name: '実生' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '挿し木' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '購入' })).toBeInTheDocument()
  })

  it('「名前・愛称」ラベルが表示される(S2-L1)', () => {
    renderS2Form()
    expect(screen.getByText(/名前・愛称/)).toBeInTheDocument()
  })

  it('表紙選択→保存でcoverImageKeyがcreateに渡る', async () => {
    const user = userEvent.setup()
    mockGetCoverPresignUrl.mockResolvedValue({ presignedUrl: 'https://s3.example.com/put', s3Key: 'cover/test.jpg' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), 'テスト盆栽')

    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(mockGetCoverPresignUrl).toHaveBeenCalledWith('cover.jpg', 'image/jpeg')
    expect(mockCreateBonsai).toHaveBeenCalledWith(expect.objectContaining({ coverImageKey: 'cover/test.jpg' }))

    vi.unstubAllGlobals()
  })

  it('表紙未選択で保存するとcoverImageKeyなしでcreateされる', async () => {
    const user = userEvent.setup()
    renderS2Form()
    await user.type(screen.getByLabelText('名前・愛称'), 'テスト盆栽')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(mockGetCoverPresignUrl).not.toHaveBeenCalled()
    expect(mockCreateBonsai).toHaveBeenCalledWith(expect.not.objectContaining({ coverImageKey: expect.anything() }))
  })
})
