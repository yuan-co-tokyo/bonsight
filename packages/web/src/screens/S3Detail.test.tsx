import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import S3Detail from './S3Detail'

const { mockNavigate, mockGetBonsai, mockGetMedia, mockGetCareLogs, mockCreateCareLog, mockDeleteCareLog, mockUpdateCareLog, mockGetAdvices } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetBonsai: vi.fn(),
  mockGetMedia: vi.fn(),
  mockGetCareLogs: vi.fn(),
  mockCreateCareLog: vi.fn(),
  mockDeleteCareLog: vi.fn(),
  mockUpdateCareLog: vi.fn(),
  mockGetAdvices: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/bonsaiApi', () => ({
  getBonsai: mockGetBonsai,
}))
vi.mock('../api/mediaApi', () => ({
  getMedia: mockGetMedia,
}))
vi.mock('../api/careLogApi', () => ({
  getCareLogsApi: mockGetCareLogs,
  createCareLogApi: mockCreateCareLog,
  updateCareLogApi: mockUpdateCareLog,
  deleteCareLogApi: mockDeleteCareLog,
}))
vi.mock('../api/adviceApi', () => ({
  getAdvices: mockGetAdvices,
}))

function bonsaiFixture(id: string) {
  return {
    id,
    owner: 'owner-1',
    visibility: 'PRIVATE',
    name: id === 'b1' ? '五葉松「翁」' : '欅「武蔵」',
    species: id === 'b1' ? 'ゴヨウマツ・五葉松' : 'ケヤキ・欅',
    estimatedAge: id === 'b1' ? 25 : 8,
    origin: '購入',
    style: id === 'b1' ? '根締木' : '直幹',
    acquiredAt: id === 'b1' ? '2025.5' : '2022.11',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
  }
}

function mediaFixture(bonsaiId: string) {
  return [
    {
      id: 'm1',
      bonsaiId,
      type: 'PHOTO' as const,
      s3Key: `users/sub/bonsai/${bonsaiId}/early.jpg`,
      cloudfrontUrl: `https://cdn.example.com/users/sub/bonsai/${bonsaiId}/early.jpg`,
      takenAt: '2026-01-15T00:00:00.000Z',
      caption: '冬の様子',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'm2',
      bonsaiId,
      type: 'PHOTO' as const,
      s3Key: `users/sub/bonsai/${bonsaiId}/later.jpg`,
      cloudfrontUrl: `https://cdn.example.com/users/sub/bonsai/${bonsaiId}/later.jpg`,
      takenAt: '2026-06-10T00:00:00.000Z',
      caption: '芽摘み後',
      createdAt: '2026-06-10T00:00:00.000Z',
    },
  ]
}

function careLogFixture(bonsaiId: string) {
  return [
    {
      id: 'cl1',
      bonsaiId,
      type: 'WATERING' as const,
      date: '2026-03-10T00:00:00.000Z',
      memo: '朝水やり',
      createdAt: '2026-03-10T00:00:00.000Z',
    },
  ]
}

function adviceFixture(bonsaiId: string) {
  return [
    {
      id: 'adv1',
      bonsaiId,
      mediaId: 'm1',
      diagnosis: {
        species: 'ゴヨウマツ',
        health: [
          { key: 'root_health', label: '根張り良好', level: 'good' as const },
          { key: 'pest_risk', label: '害虫注意', level: 'warning' as const },
        ],
        styling: '模範的な根締木スタイル',
        seasonal: '秋の管理を重視してください',
        confidence: 0.85,
        disclaimer: 'この診断は参考情報です',
      },
      confidence: 0.85,
      createdAt: '2026-06-20T00:00:00.000Z',
    },
  ]
}

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
  beforeEach(() => {
    mockNavigate.mockReset()
    mockGetBonsai.mockReset()
    mockGetMedia.mockReset()
    mockGetCareLogs.mockReset()
    mockCreateCareLog.mockReset()
    mockUpdateCareLog.mockReset()
    mockDeleteCareLog.mockReset()
    mockGetAdvices.mockReset()
    mockGetBonsai.mockImplementation((id: string) => Promise.resolve(bonsaiFixture(id)))
    mockGetMedia.mockResolvedValue([])
    mockGetCareLogs.mockResolvedValue([])
    mockGetAdvices.mockResolvedValue([])
  })

  it('bonsaiId b1 で名前「五葉松「翁」」が表示される', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })).toBeInTheDocument()
    expect(mockGetBonsai).toHaveBeenCalledWith('b1')
  })

  it('樹齢・樹形・入手チップが表示される(S3-F4)', async () => {
    renderS3Detail('b1')
    expect(await screen.findByText('約25年')).toBeInTheDocument()
    expect(screen.getByText('根締木')).toBeInTheDocument()
    expect(screen.getByText('2025.5')).toBeInTheDocument()
  })

  it('「写真を追加」がprimary、「AIに診てもらう」がsecondary(S3-F5)', async () => {
    renderS3Detail('b1')
    const addPhotoBtn = await screen.findByRole('button', { name: '写真を追加' })
    expect(addPhotoBtn).toHaveAttribute('data-variant', 'primary')
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).toHaveAttribute('data-variant', 'secondary')
  })

  it('「成長タイムライン」見出しが表示される(S3-F7)', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('heading', { name: '成長タイムライン', level: 2 })).toBeInTheDocument()
  })

  it('タイムラインが降順(最新が上)でレンダリングされる', async () => {
    const media = mediaFixture('b1')
    mockGetMedia.mockResolvedValue([media[0], media[1]])

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const images = screen.getAllByRole('img')
    // 最初の画像が takenAt 新しい方 (m2: 2026-06)
    expect(images[0]).toHaveAttribute('src', media[1].cloudfrontUrl)
    // 2番目が m1 (2026-01)
    expect(images[1]).toHaveAttribute('src', media[0].cloudfrontUrl)
  })

  it('media・careLog 両方空の時、空状態が表示される', async () => {
    mockGetMedia.mockResolvedValue([])
    mockGetCareLogs.mockResolvedValue([])
    renderS3Detail('b1')
    expect(await screen.findByText('まだ記録がありません')).toBeInTheDocument()
  })

  it('coverImageUrlありのとき hero <img> が表示される', async () => {
    mockGetBonsai.mockResolvedValue({
      ...bonsaiFixture('b1'),
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
    })
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const heroImg = screen.getByRole('img', { name: '五葉松「翁」' })
    expect(heroImg).toHaveAttribute('src', 'https://cdn.example.com/cover.jpg')
  })

  it('coverImageUrlなしのとき PhotoPlaceholder が表示され hero img はない', async () => {
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    // bonsaiFixture に coverImageUrl なし → PhotoPlaceholder (img ではない)
    expect(screen.queryByRole('img', { name: '五葉松「翁」' })).toBeNull()
  })

  it('写真なし+coverImageUrlなし → 「AIに診てもらう」がdisabled', async () => {
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).toBeDisabled()
  })

  it('写真あり → 「AIに診てもらう」がdisabledでない', async () => {
    mockGetMedia.mockResolvedValue(mediaFixture('b1'))
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).not.toBeDisabled()
  })

  it('coverImageUrlのみあり(mediaList空) → 「AIに診てもらう」がdisabledでない', async () => {
    mockGetBonsai.mockResolvedValue({
      ...bonsaiFixture('b1'),
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
    })
    mockGetMedia.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    const aiBtn = screen.getByRole('button', { name: 'AIに診てもらう' })
    expect(aiBtn).not.toBeDisabled()
  })

  it('サムネクリックでS7ビューアに遷移しmediaListとindexをstateで渡す', async () => {
    const media = mediaFixture('b1')
    mockGetMedia.mockResolvedValue(media)

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    // 降順タイムラインで最初に表示されるカードは最新 (m2: 2026-06)
    const cards = screen.getAllByRole('button', { name: /\d+年/ })
    fireEvent.click(cards[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      `/s7/${media[1].id}`,
      expect.objectContaining({
        state: expect.objectContaining({ mediaList: media, initialIndex: 1 }),
      }),
    )
  })

  // CareLog テスト

  it('「世話を記録」ボタンが表示される', async () => {
    renderS3Detail('b1')
    expect(await screen.findByRole('button', { name: '世話を記録' })).toBeInTheDocument()
  })

  it('careLogList が空の時、世話ログカードは表示されない', async () => {
    mockGetCareLogs.mockResolvedValue([])
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    expect(screen.queryByText('水やり')).toBeNull()
  })

  it('careLogList に1件あるとき CARE_TYPE_LABEL (水やり) が表示される', async () => {
    mockGetCareLogs.mockResolvedValue(careLogFixture('b1'))
    renderS3Detail('b1')
    expect(await screen.findByText('水やり')).toBeInTheDocument()
  })

  it('careLogカードのメモが表示される', async () => {
    mockGetCareLogs.mockResolvedValue(careLogFixture('b1'))
    renderS3Detail('b1')
    expect(await screen.findByText('朝水やり')).toBeInTheDocument()
  })

  it('「世話を記録」ボタンクリックでフォームが表示される', async () => {
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    fireEvent.click(screen.getByRole('button', { name: '世話を記録' }))
    expect(await screen.findByRole('heading', { name: '世話を記録', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('フォームの「キャンセル」でフォームが閉じる', async () => {
    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })
    fireEvent.click(screen.getByRole('button', { name: '世話を記録' }))
    expect(await screen.findByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: '保存' })).toBeNull())
  })

  // AI診断タイムライン統合テスト

  it('adviceListに1件あるとき「AI診断」カードが表示される', async () => {
    mockGetAdvices.mockResolvedValue(adviceFixture('b1'))
    renderS3Detail('b1')
    expect(await screen.findByText('AI診断')).toBeInTheDocument()
    expect(screen.getByText('※参考情報')).toBeInTheDocument()
  })

  it('media/carelog/diagnosisが降順(最新が上)で混在表示される', async () => {
    mockGetMedia.mockResolvedValue(mediaFixture('b1'))         // Jan 15, Jun 10
    mockGetCareLogs.mockResolvedValue(careLogFixture('b1'))    // Mar 10
    mockGetAdvices.mockResolvedValue(adviceFixture('b1'))      // Jun 20 (最新)

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const diagnosisCard = await screen.findByText('AI診断')
    const careLogLabel = screen.getByText('水やり')

    // 降順: diagnosis(Jun 20)がcareLog(Mar 10)より前にある
    expect(diagnosisCard.compareDocumentPosition(careLogLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('各エントリに時刻(コロン区切り)が表示される', async () => {
    mockGetMedia.mockResolvedValue(mediaFixture('b1'))
    mockGetCareLogs.mockResolvedValue(careLogFixture('b1'))
    mockGetAdvices.mockResolvedValue(adviceFixture('b1'))

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    // 各カード種別のdate要素が ':' を含む (時:分 形式)
    const datePills = document.querySelectorAll('.s3-date-pill')
    datePills.forEach(el => expect(el.textContent).toMatch(/:/))

    const carelogDates = document.querySelectorAll('.carelog-date')
    carelogDates.forEach(el => expect(el.textContent).toMatch(/:/))

    const diagnosisDates = document.querySelectorAll('.diagnosis-date')
    diagnosisDates.forEach(el => expect(el.textContent).toMatch(/:/))
  })

  it('降順タイムラインで最新のcarelog(Jun 20)が最古のmedia(Jan 15)より前に表示される', async () => {
    const newerCareLog = {
      id: 'cl-new',
      bonsaiId: 'b1',
      type: 'PRUNING' as const,
      date: '2026-06-20T00:00:00.000Z',
      memo: '最新の世話',
      createdAt: '2026-06-20T12:00:00.000Z',
    }
    mockGetMedia.mockResolvedValue([mediaFixture('b1')[0]])  // Jan 15 only
    mockGetCareLogs.mockResolvedValue([newerCareLog])         // Jun 20 (newer)
    mockGetAdvices.mockResolvedValue([])

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const careLogLabel = await screen.findByText('剪定')
    const images = screen.getAllByRole('img')
    // 降順: careLog(Jun 20)がmedia(Jan 15)より前 → careLogのラベルはimgの前にある
    expect(careLogLabel.compareDocumentPosition(images[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('mediaのソートはtakenAtではなくcreatedAt基準で行われる', async () => {
    // takenAt(撮影日)が古くてもcreatedAt(登録日)が新しければタイムライン上位に来る
    const mediaOldTakenNewCreated = {
      id: 'm_test',
      bonsaiId: 'b1',
      type: 'PHOTO' as const,
      s3Key: 'users/sub/bonsai/b1/old_photo.jpg',
      cloudfrontUrl: 'https://cdn.example.com/old_photo.jpg',
      takenAt: '2026-01-01T00:00:00.000Z',   // 撮影日は古い
      caption: '古い撮影日の写真',
      createdAt: '2026-07-01T00:00:00.000Z', // 登録日は新しい
    }
    const careLog = {
      id: 'cl-mid',
      bonsaiId: 'b1',
      type: 'WATERING' as const,
      date: '2026-03-10T00:00:00.000Z',
      memo: 'テスト水やり',
      createdAt: '2026-03-10T00:00:00.000Z',
    }
    mockGetMedia.mockResolvedValue([mediaOldTakenNewCreated])
    mockGetCareLogs.mockResolvedValue([careLog])
    mockGetAdvices.mockResolvedValue([])

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const careLogLabel = await screen.findByText('水やり')
    const images = screen.getAllByRole('img')
    // createdAt基準: media(2026-07-01) > careLog(2026-03-10) → mediaが先頭
    expect(images[0].compareDocumentPosition(careLogLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('careLogは実施日(date)ではなく登録日(createdAt)でソートされる', async () => {
    // careLog: 実施日(date)=Jun01(古い), 登録日(createdAt)=Jul02(最新)
    // advice:  createdAt=Jul01
    // media:   createdAt=Jun10
    // createdAt降順なら careLog→advice→media の順になるはず
    // date基準なら media→careLog→advice になってしまう (バグ)
    const careLogOldDateNewCreated = {
      id: 'cl-date-mismatch',
      bonsaiId: 'b1',
      type: 'PRUNING' as const,
      date: '2026-06-01T00:00:00.000Z',   // 実施日は古い
      memo: '実施日が古い剪定',
      createdAt: '2026-07-02T00:00:00.000Z', // 登録日は最新
    }
    const adviceMid = {
      ...adviceFixture('b1')[0],
      createdAt: '2026-07-01T00:00:00.000Z', // Jul01
    }
    mockGetMedia.mockResolvedValue([mediaFixture('b1')[1]]) // Jun10
    mockGetCareLogs.mockResolvedValue([careLogOldDateNewCreated])
    mockGetAdvices.mockResolvedValue([adviceMid])

    renderS3Detail('b1')
    await screen.findByRole('heading', { name: '五葉松「翁」', level: 1 })

    const careLogLabel = await screen.findByText('剪定')
    const diagnosisLabel = screen.getByText('AI診断')
    const images = screen.getAllByRole('img')

    // careLog(createdAt Jul02) > advice(Jul01) > media(Jun10)
    // careLogが最初に来ること
    expect(careLogLabel.compareDocumentPosition(diagnosisLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(diagnosisLabel.compareDocumentPosition(images[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('診断カードをクリックするとnavigateが呼ばれる', async () => {
    const advices = adviceFixture('b1')
    mockGetAdvices.mockResolvedValue(advices)
    renderS3Detail('b1')

    const diagnosisCard = await screen.findByRole('button', { name: /AI診断/ })
    fireEvent.click(diagnosisCard)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/bonsai/b1/ai',
      expect.objectContaining({ state: expect.objectContaining({ advice: advices[0] }) }),
    )
  })
})
