import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resizeImage } from '../../lib/resizeImage'
vi.mock('../../lib/resizeImage', () => ({ resizeImage: vi.fn() }))
import CheckNew from './CheckNew'
import CheckDetail from './CheckDetail'
import ChecksList from './ChecksList'
import S2Form from '../S2Form'
import { createBonsai } from '../../api/bonsaiApi'
import * as api from '../../api/purchaseCheckApi'
import { sampleCheck } from './checks.fixture'
vi.mock('../../api/purchaseCheckApi', () => ({
  createPurchaseCheck: vi.fn(),
  uploadPurchasePhoto: vi.fn(),
  getPurchaseCheck: vi.fn(),
  deletePurchaseCheck: vi.fn(),
  getPurchaseChecks: vi.fn(),
  updatePurchaseCheck: vi.fn(),
}))
vi.mock('../../api/bonsaiApi', () => ({
  createBonsai: vi.fn(),
  getBonsai: vi.fn(),
  updateBonsai: vi.fn(),
  getCoverPresignUrl: vi.fn(),
}))
function renderChecks(path = '/checks/new') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/checks/new" element={<CheckNew />} />
        <Route path="/checks/:id" element={<CheckDetail />} />
        <Route path="/checks" element={<ChecksList />} />
        <Route path="/bonsai/new" element={<S2Form />} />
      </Routes>
    </MemoryRouter>
  )
}
async function photo(label = '全体（必須）') {
  fireEvent.change(screen.getByLabelText(label), {
    target: { files: [new File(['image'], `${label}.jpg`, { type: 'image/jpeg' })] },
  })
  await waitFor(() =>
    expect(screen.getByRole('img', { name: `${label}のプレビュー` })).toBeInTheDocument()
  )
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(resizeImage).mockImplementation(async (file) => file)
  URL.createObjectURL = vi.fn(() => 'blob:photo')
  URL.revokeObjectURL = vi.fn()
  vi.mocked(api.createPurchaseCheck).mockResolvedValue(sampleCheck)
  vi.mocked(api.uploadPurchasePhoto).mockResolvedValue('users/me/purchase-checks/whole.jpg')
  vi.mocked(api.getPurchaseCheck).mockResolvedValue(sampleCheck)
  vi.mocked(api.getPurchaseChecks).mockResolvedValue([sampleCheck])
  vi.mocked(api.deletePurchaseCheck).mockResolvedValue({ id: 'c1' })
})
describe('購入前チェック', () => {
  it('全体がないと送信せず、初期経験は初心者', async () => {
    renderChecks()
    expect(screen.getByLabelText('育成経験')).toHaveValue('BEGINNER')
    await photo('葉（任意）')
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    expect(screen.getByRole('alert')).toHaveTextContent('全体の写真')
    expect(api.createPurchaseCheck).not.toHaveBeenCalled()
  })
  it.each([
    ['樹高（cm・任意）', '-1'],
    ['価格（円・任意）', '1.5'],
  ])('不正な数値を送信しない: %s', async (label, value) => {
    renderChecks()
    await photo()
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    expect(screen.getByRole('alert')).toHaveTextContent('整数')
    expect(api.uploadPurchasePhoto).not.toHaveBeenCalled()
  })
  it('全体と葉をアップロードし正しいロールと記録価格をAPIへ渡す', async () => {
    renderChecks()
    await photo()
    await photo('葉（任意）')
    fireEvent.change(screen.getByLabelText('価格（円・任意）'), { target: { value: '12000' } })
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    expect(screen.getByRole('status')).toHaveTextContent('数十秒')
    expect(screen.getByRole('button', { name: 'チェック中…' })).toBeDisabled()
    await waitFor(() =>
      expect(api.createPurchaseCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          photoRoles: ['OVERALL', 'FOLIAGE'],
          price: 12000,
          experience: 'BEGINNER',
        })
      )
    )
    expect(await screen.findByRole('heading', { name: '購入前チェックの結果' })).toBeInTheDocument()
  })
  it('失敗後はエラーを表示し、再試行ではアップロード済み写真を再利用する', async () => {
    vi.mocked(api.createPurchaseCheck).mockRejectedValueOnce(new Error('AIが混雑しています'))
    renderChecks()
    await photo()
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AIが混雑しています')
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    await screen.findByRole('heading', { name: '購入前チェックの結果' })
    expect(api.uploadPurchasePhoto).toHaveBeenCalledTimes(1)
  })
  it('元画像の形式・サイズで拒否せず、変換したJPEGを送信する', async () => {
    const original = new File([new Uint8Array(4000000)], 'tree.heic', { type: 'image/heic' })
    const converted = new File(['jpeg'], 'tree.jpg', { type: 'image/jpeg' })
    vi.mocked(resizeImage).mockResolvedValue(converted)
    renderChecks()
    fireEvent.change(screen.getByLabelText('全体（必須）'), { target: { files: [original] } })
    expect(screen.getByRole('button', { name: 'AIで購入前チェック' })).toBeDisabled()
    await screen.findByRole('img', { name: '全体（必須）のプレビュー' })
    expect(resizeImage).toHaveBeenCalledWith(original)
    fireEvent.click(screen.getByRole('button', { name: 'AIで購入前チェック' }))
    await waitFor(() => expect(api.uploadPurchasePhoto).toHaveBeenCalledWith(converted))
    await screen.findByRole('heading', { name: '購入前チェックの結果' })
  })
  it('変換失敗を表示し送信しない', async () => {
    vi.mocked(resizeImage).mockRejectedValue(new Error('写真を読み込めませんでした'))
    renderChecks()
    fireEvent.change(screen.getByLabelText('全体（必須）'), {
      target: { files: [new File(['bad'], 'bad.jpg')] },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('写真を読み込めませんでした')
    expect(api.uploadPurchasePhoto).not.toHaveBeenCalled()
  })
  it('結果を指定の順に表示し、登録画面へ初期値を引き継ぐ', async () => {
    renderChecks('/checks/c1')
    await screen.findByText('根元を確認して検討してください')
    expect(screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)).toEqual([
      '五葉松',
      '6項目の評価',
      '注意点',
      '自分に合うか',
      '将来性',
      '店頭で確かめること',
      '免責',
      'チェック時の記録',
    ])
    expect(screen.getByText('葉裏を確認してください')).toBeInTheDocument()
    expect(screen.getByText(/12,000円/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'この盆栽を購入した → 登録する' }))
    expect(screen.getByLabelText('樹種')).toHaveValue('五葉松')
    expect(screen.getByLabelText('メモ')).toHaveValue('根元を確認して検討してください')
    expect(screen.getByRole('button', { name: '購入' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('表紙写真を追加')).toBeInTheDocument()
  })
  it('JSTの押下日と名前、チェックIDを登録へ引き継ぎ、コピー失敗を通知する', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-26T15:01:00Z'))
    vi.mocked(createBonsai).mockResolvedValue({ id: 'b1', photoCopyFailed: true } as Awaited<
      ReturnType<typeof createBonsai>
    >)
    renderChecks('/checks/c1')
    fireEvent.click(await screen.findByRole('button', { name: 'この盆栽を購入した → 登録する' }))
    expect(screen.getByLabelText('名前・愛称')).toHaveValue('五葉松')
    expect(screen.getByLabelText('入手日')).toHaveValue('2026-09-27')
    now.mockRestore()
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() =>
      expect(createBonsai).toHaveBeenCalledWith(
        expect.objectContaining({
          purchaseCheckId: 'c1',
          name: '五葉松',
          acquiredAt: '2026-09-27',
          species: '五葉松',
          origin: '購入',
        })
      )
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('写真の引き継ぎに失敗しました')
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
    expect(screen.getByRole('link', { name: '登録した盆栽を見る' })).toHaveAttribute(
      'href',
      '/bonsai/b1'
    )
  })
  it.each([
    ['店の樹種', '推定樹種', '店の樹種'],
    ['', '推定樹種', '推定樹種'],
    ['', '', ''],
  ])('名前の初期値は入力樹種、AI推定、空欄の順: %s', async (species, inferred, expected) => {
    vi.mocked(api.getPurchaseCheck).mockResolvedValue({
      ...sampleCheck,
      species,
      result: { ...sampleCheck.result, species: { name: inferred, confidence: 0.5 } },
    })
    renderChecks('/checks/c1')
    fireEvent.click(await screen.findByRole('button', { name: 'この盆栽を購入した → 登録する' }))
    expect(screen.getByLabelText('名前・愛称')).toHaveValue(expected)
  })
  it('検討中から見送りへ変更し、検討中に戻せる', async () => {
    vi.mocked(api.updatePurchaseCheck)
      .mockResolvedValueOnce({ ...sampleCheck, status: 'PASSED' })
      .mockResolvedValueOnce(sampleCheck)
    renderChecks('/checks/c1')
    fireEvent.click(await screen.findByRole('button', { name: '見送る（記録として残す）' }))
    expect(await screen.findByText('見送り')).toBeInTheDocument()
    expect(api.updatePurchaseCheck).toHaveBeenCalledWith('c1', 'PASSED')
    expect(
      screen.queryByRole('button', { name: 'この盆栽を購入した → 登録する' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'チェックを削除' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '検討中に戻す' }))
    expect(
      await screen.findByRole('button', { name: 'この盆栽を購入した → 登録する' })
    ).toBeInTheDocument()
    expect(api.updatePurchaseCheck).toHaveBeenLastCalledWith('c1', 'CONSIDERING')
  })
  it('購入済みには盆栽へのリンクを表示して登録ボタンを出さない', async () => {
    vi.mocked(api.getPurchaseCheck).mockResolvedValue({
      ...sampleCheck,
      status: 'PURCHASED',
      bonsaiId: 'b1',
    })
    renderChecks('/checks/c1')
    expect(await screen.findByText('購入済み')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '登録した盆栽を見る' })).toHaveAttribute(
      'href',
      '/bonsai/b1'
    )
    expect(
      screen.queryByRole('button', { name: 'この盆栽を購入した → 登録する' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '検討中に戻す' })).not.toBeInTheDocument()
  })
  it('一覧で各状態のバッジを表示する', async () => {
    vi.mocked(api.getPurchaseChecks).mockResolvedValue([
      sampleCheck,
      { ...sampleCheck, id: 'c2', status: 'PASSED' },
      { ...sampleCheck, id: 'c3', status: 'PURCHASED', bonsaiId: 'b1' },
    ])
    renderChecks('/checks')
    expect(await screen.findByText('検討中')).toBeInTheDocument()
    expect(screen.getByText('見送り')).toBeInTheDocument()
    expect(screen.getByText('購入済み')).toBeInTheDocument()
  })
  it('一覧にサムネイルとおすすめ度、新規への導線がある', async () => {
    renderChecks('/checks')
    expect(await screen.findByRole('img', { name: '五葉松' })).toHaveAttribute(
      'src',
      sampleCheck.photoUrls[0]
    )
    expect(screen.getByText('検討')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '新規チェック' })).toHaveAttribute(
      'href',
      '/checks/new'
    )
  })
  it('確認後に削除し一覧へ戻る', async () => {
    renderChecks('/checks/c1')
    fireEvent.click(await screen.findByRole('button', { name: 'チェックを削除' }))
    expect(api.deletePurchaseCheck).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '削除する' }))
    await waitFor(() => expect(api.deletePurchaseCheck).toHaveBeenCalledWith('c1'))
    expect(await screen.findByRole('link', { name: '新規チェック' })).toBeInTheDocument()
  })
})
