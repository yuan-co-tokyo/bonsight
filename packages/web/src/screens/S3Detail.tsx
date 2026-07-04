import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { BonsaiDto, CareLogDto, CareType } from 'shared'
import { getBonsai } from '../api/bonsaiApi'
import { getMedia, type MediaDtoEx } from '../api/mediaApi'
import { getCareLogsApi, createCareLogApi, updateCareLogApi, deleteCareLogApi } from '../api/careLogApi'
import { getAdvices, type AdviceResult } from '../api/adviceApi'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import PhotoPlaceholder from '../components/PhotoPlaceholder'

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TreeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L19 14H14V21H10V14H5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12l-1.5 12H7.5L6 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 7V6a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7l1.5-3h5L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

function Chip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </div>
  )
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  const date = d.toLocaleDateString('ja-JP')
  const time = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

function monthSpan(entries: MediaDtoEx[]): string {
  if (entries.length === 0) return '0'
  if (entries.length === 1) return '1'
  const times = entries
    .map(e => e.takenAt ? new Date(e.takenAt).getTime() : new Date(e.createdAt).getTime())
  const min = new Date(Math.min(...times))
  const max = new Date(Math.max(...times))
  const months = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth())
  return String(Math.max(months, 1))
}

function displayName(bonsai: BonsaiDto): string {
  return bonsai.nickname ? `${bonsai.name}「${bonsai.nickname}」` : bonsai.name
}

function displayAge(bonsai: BonsaiDto): string {
  return bonsai.estimatedAge !== undefined ? `約${bonsai.estimatedAge}年` : '樹齢未設定'
}

function LoadingState() {
  return (
    <div style={{ padding: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
      読み込み中...
    </div>
  )
}

function NotFoundState() {
  return (
    <div style={{ padding: 24, fontSize: 14, color: 'var(--status-danger-text)' }}>
      盆栽が見つかりません
    </div>
  )
}

function TimelineCard({
  media,
  onClick,
}: {
  media: MediaDtoEx
  onClick: () => void
}) {
  const dateLabel = media.takenAt ? formatDate(media.takenAt) : formatDate(media.createdAt)
  const displayDate = formatDateTime(media.createdAt ?? media.takenAt ?? '')
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={media.cloudfrontUrl}
          alt={dateLabel}
          style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }}
        />
        <span
          className="s3-date-pill"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 999,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 500,
            backdropFilter: 'blur(4px)',
          }}
        >
          {displayDate}
        </span>
      </div>
      {media.caption && (
        <div style={{ padding: 12, fontSize: 13, lineHeight: 1.55, color: 'var(--color-ink)' }}>
          {media.caption}
        </div>
      )}
    </div>
  )
}

const CARE_TYPE_LABEL: Record<CareType, string> = {
  WATERING: '水やり',
  FERTILIZING: '施肥',
  PRUNING: '剪定',
  WIRING: '針金',
  REPOTTING: '植替え',
  PEST_CONTROL: '防除',
}

const CARE_TYPE_ICON: Record<CareType, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  PRUNING: '✂️',
  WIRING: '🔧',
  REPOTTING: '🪴',
  PEST_CONTROL: '🛡️',
}

const CARE_TYPE_OPTIONS: CareType[] = [
  'WATERING',
  'FERTILIZING',
  'PRUNING',
  'WIRING',
  'REPOTTING',
  'PEST_CONTROL',
]

function CareLogCard({
  careLog,
  onEdit,
  onDelete,
}: {
  careLog: CareLogDto
  onEdit: (careLog: CareLogDto) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="timeline-carelog-card"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        marginBottom: 16,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="carelog-icon" style={{ fontSize: 20 }}>{CARE_TYPE_ICON[careLog.type]}</span>
        <span className="carelog-label" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
          {CARE_TYPE_LABEL[careLog.type]}
        </span>
        <span className="carelog-date" style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          {formatDateTime(careLog.createdAt)}
        </span>
      </div>
      {careLog.memo && (
        <p className="carelog-memo" style={{ fontSize: 13, color: 'var(--color-ink)', margin: 0, lineHeight: 1.5 }}>
          {careLog.memo}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onEdit(careLog)}
          style={{ fontSize: 12, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          編集
        </button>
        <button
          onClick={() => onDelete(careLog.id)}
          style={{ fontSize: 12, color: 'var(--status-danger-text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          削除
        </button>
      </div>
    </div>
  )
}

function EmptyTimeline({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: 12 }}>
      <CameraIcon />
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>まだ記録がありません</p>
      <button
        onClick={onAdd}
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        写真を追加する
      </button>
    </div>
  )
}

function DiagnosisCard({
  advice,
  onClick,
}: {
  advice: AdviceResult
  onClick: () => void
}) {
  return (
    <div
      className="timeline-diagnosis-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        marginBottom: 16,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="diagnosis-icon" style={{ fontSize: 20 }}>🔍</span>
        <span className="diagnosis-label" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>AI診断</span>
        <span className="diagnosis-date" style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          {formatDateTime(advice.createdAt)}
        </span>
      </div>
      {advice.diagnosis.species && (
        <span className="diagnosis-species" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {advice.diagnosis.species}
        </span>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {advice.diagnosis.health.slice(0, 2).map((flag) => (
          <span key={flag.key} className="diagnosis-flag" style={{ fontSize: 11, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 999, padding: '2px 8px' }}>
            {flag.label}
          </span>
        ))}
      </div>
      {advice.diagnosis.confidence !== undefined && (
        <span className="diagnosis-confidence" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          信頼度: {Math.round(advice.diagnosis.confidence * 100)}%
        </span>
      )}
      <p className="diagnosis-note" style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>※参考情報</p>
    </div>
  )
}

type TimelineItem =
  | { kind: 'media'; item: MediaDtoEx }
  | { kind: 'carelog'; item: CareLogDto }
  | { kind: 'diagnosis'; item: AdviceResult }

export default function S3Detail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [bonsai, setBonsai] = useState<BonsaiDto | null>(null)
  const [mediaList, setMediaList] = useState<MediaDtoEx[]>([])
  const [careLogList, setCareLogList] = useState<CareLogDto[]>([])
  const [adviceList, setAdviceList] = useState<AdviceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [showCareForm, setShowCareForm] = useState(false)
  const [careFormData, setCareFormData] = useState<{ type: CareType; date: string; memo: string }>({
    type: 'WATERING',
    date: new Date().toISOString().slice(0, 10),
    memo: '',
  })
  const [editingCareLog, setEditingCareLog] = useState<CareLogDto | null>(null)

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    const bonsaiId = id

    let ignore = false
    async function loadAll() {
      setLoading(true)
      setError(false)
      try {
        const [data, media, careLogs, advices] = await Promise.all([
          getBonsai(bonsaiId),
          getMedia(bonsaiId),
          getCareLogsApi(bonsaiId),
          getAdvices(bonsaiId),
        ])
        if (!ignore) {
          setBonsai(data)
          const sorted = [...media].sort((a, b) => {
            const ta = a.takenAt ? new Date(a.takenAt).getTime() : new Date(a.createdAt).getTime()
            const tb = b.takenAt ? new Date(b.takenAt).getTime() : new Date(b.createdAt).getTime()
            return ta - tb
          })
          setMediaList(sorted)
          setCareLogList(careLogs)
          setAdviceList(advices)
        }
      } catch {
        if (!ignore) setError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadAll()
    return () => {
      ignore = true
    }
  }, [id])

  const fetchCareLogs = async (bonsaiId: string) => {
    const careLogs = await getCareLogsApi(bonsaiId)
    setCareLogList(careLogs)
  }

  const handleSaveCareLog = async () => {
    if (!id) return
    if (editingCareLog) {
      await updateCareLogApi(id, editingCareLog.id, careFormData)
    } else {
      await createCareLogApi(id, careFormData)
    }
    setShowCareForm(false)
    setEditingCareLog(null)
    await fetchCareLogs(id)
  }

  const handleEditCareLog = (careLog: CareLogDto) => {
    setEditingCareLog(careLog)
    setCareFormData({ type: careLog.type, date: careLog.date.slice(0, 10), memo: careLog.memo ?? '' })
    setShowCareForm(true)
  }

  const handleDeleteCareLog = async (logId: string) => {
    if (!id) return
    await deleteCareLogApi(id, logId)
    await fetchCareLogs(id)
  }

  if (loading) {
    return (
      <BonsightShell screen="S3" showTabBar={false} title="読み込み中" onBack={() => navigate(-1)}>
        <LoadingState />
      </BonsightShell>
    )
  }

  if (error || bonsai === null) {
    return (
      <BonsightShell screen="S3" showTabBar={false} title="詳細" onBack={() => navigate(-1)}>
        <NotFoundState />
      </BonsightShell>
    )
  }

  function handleThumbnailClick(index: number) {
    navigate(`/s7/${mediaList[index].id}`, {
      state: { mediaList, initialIndex: index },
    })
  }

  function handleOpenDiagnosis(advice: AdviceResult) {
    navigate(`/bonsai/${id}/ai`, { state: { advice } })
  }

  const hasPhoto = mediaList.length > 0 || !!bonsai.coverImageUrl

  const timeline: TimelineItem[] = [
    ...mediaList.map((item) => ({ kind: 'media' as const, item })),
    ...careLogList.map((item) => ({ kind: 'carelog' as const, item })),
    ...adviceList.map((item) => ({ kind: 'diagnosis' as const, item })),
  ].sort((a, b) => {
    const getDate = (entry: TimelineItem): string => {
      if (entry.kind === 'media') return entry.item.createdAt
      if (entry.kind === 'carelog') return entry.item.date
      return entry.item.createdAt
    }
    return new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime()
  })

  const isEmpty = timeline.length === 0

  return (
    <BonsightShell
      screen="S3"
      showTabBar={false}
      title={displayName(bonsai)}
      onBack={() => navigate(-1)}
      contextAction={{ label: '編集', onClick: () => navigate(`/bonsai/${bonsai.id}/edit`) }}
    >
      <article className="s3-detail">
        {/* hero */}
        {bonsai.coverImageUrl ? (
          <img
            className="s3-hero"
            src={bonsai.coverImageUrl}
            alt={displayName(bonsai)}
            style={{ width: '100%', aspectRatio: '5/4', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="s3-hero" style={{ width: '100%', aspectRatio: '5/4' }}>
            <PhotoPlaceholder label={bonsai.species ?? '樹種未設定'} aspectRatio="5/4" />
          </div>
        )}

        {/* 名前+樹種ブロック */}
        <div className="s3-bonsai-name-block" style={{ padding: '16px 16px 8px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            {displayName(bonsai)}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
            {bonsai.species ?? '樹種未設定'}
          </p>
        </div>

        {/* チップ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px' }}>
          <Chip icon={<CalendarIcon />} label={displayAge(bonsai)} />
          <Chip icon={<TreeIcon />} label={bonsai.style ?? '樹形未設定'} />
          <Chip icon={<ShoppingBagIcon />} label={bonsai.acquiredAt ?? '入手日未設定'} />
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
          <Button variant="primary" onClick={() => navigate(`/bonsai/${bonsai.id}/photo`)}>
            <CameraIcon /> 写真を追加
          </Button>
          <Button
            variant="secondary"
            onClick={() => { setEditingCareLog(null); setCareFormData({ type: 'WATERING', date: new Date().toISOString().slice(0, 10), memo: '' }); setShowCareForm(true) }}
          >
            世話を記録
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/bonsai/${bonsai.id}/ai`)}
            disabled={!hasPhoto}
            title={!hasPhoto ? 'まず写真を追加してください' : undefined}
          >
            <SparkleIcon /> AIに診てもらう
          </Button>
        </div>

        {/* 世話を記録フォーム */}
        {showCareForm && (
          <div
            style={{
              margin: '0 16px 16px',
              padding: 16,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
              {editingCareLog ? '世話を編集' : '世話を記録'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>種別</label>
              <select
                value={careFormData.type}
                onChange={(e) => setCareFormData(prev => ({ ...prev, type: e.target.value as CareType }))}
                style={{ fontSize: 14, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              >
                {CARE_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{CARE_TYPE_ICON[t]} {CARE_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>日付</label>
              <input
                type="date"
                value={careFormData.date}
                onChange={(e) => setCareFormData(prev => ({ ...prev, date: e.target.value }))}
                style={{ fontSize: 14, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>メモ（任意）</label>
              <textarea
                value={careFormData.memo}
                onChange={(e) => setCareFormData(prev => ({ ...prev, memo: e.target.value }))}
                rows={3}
                placeholder="作業メモを入力..."
                style={{ fontSize: 14, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => void handleSaveCareLog()}
                style={{ flex: 1, padding: '8px 0', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                保存
              </button>
              <button
                onClick={() => { setShowCareForm(false); setEditingCareLog(null) }}
                style={{ flex: 1, padding: '8px 0', background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        <section style={{ padding: '0 16px 24px' }}>
          {/* 見出し「成長タイムライン」+ 枚数/期間 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>成長タイムライン</h2>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {mediaList.length}枚 · {monthSpan(mediaList)}ヶ月
            </span>
          </div>
          {isEmpty ? (
            <EmptyTimeline onAdd={() => navigate(`/bonsai/${bonsai.id}/photo`)} />
          ) : (
            timeline.map((entry) =>
              entry.kind === 'media' ? (
                <TimelineCard
                  key={entry.item.id}
                  media={entry.item}
                  onClick={() => handleThumbnailClick(mediaList.indexOf(entry.item))}
                />
              ) : entry.kind === 'carelog' ? (
                <CareLogCard
                  key={entry.item.id}
                  careLog={entry.item}
                  onEdit={handleEditCareLog}
                  onDelete={(logId) => void handleDeleteCareLog(logId)}
                />
              ) : (
                <DiagnosisCard
                  key={entry.item.id}
                  advice={entry.item}
                  onClick={() => handleOpenDiagnosis(entry.item)}
                />
              )
            )
          )}
        </section>
      </article>
    </BonsightShell>
  )
}
