import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { BonsaiDto } from 'shared'
import { getBonsai } from '../api/bonsaiApi'
import { getMedia, type MediaDtoEx } from '../api/mediaApi'
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
          {dateLabel}
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

function EmptyTimeline({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: 12 }}>
      <CameraIcon />
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>まだ写真がありません</p>
      <button
        onClick={onAdd}
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        写真を追加する
      </button>
    </div>
  )
}

export default function S3Detail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [bonsai, setBonsai] = useState<BonsaiDto | null>(null)
  const [mediaList, setMediaList] = useState<MediaDtoEx[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
        const [data, media] = await Promise.all([
          getBonsai(bonsaiId),
          getMedia(bonsaiId),
        ])
        if (!ignore) {
          setBonsai(data)
          // 撮影日昇順
          const sorted = [...media].sort((a, b) => {
            const ta = a.takenAt ? new Date(a.takenAt).getTime() : new Date(a.createdAt).getTime()
            const tb = b.takenAt ? new Date(b.takenAt).getTime() : new Date(b.createdAt).getTime()
            return ta - tb
          })
          setMediaList(sorted)
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

  const hasPhoto = mediaList.length > 0 || !!bonsai.coverImageUrl

  return (
    <BonsightShell
      screen="S3"
      showTabBar={false}
      title={displayName(bonsai)}
      onBack={() => navigate(-1)}
      contextAction={{ label: '編集', onClick: () => navigate(`/bonsai/${bonsai.id}/edit`) }}
    >
      <article className="s3-detail">
        {/* S3-F8: hero (表紙写真またはプレースホルダ) */}
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

        {/* S3-F3: 名前+樹種ブロック */}
        <div className="s3-bonsai-name-block" style={{ padding: '16px 16px 8px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            {displayName(bonsai)}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
            {bonsai.species ?? '樹種未設定'}
          </p>
        </div>

        {/* S3-F4: チップ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px' }}>
          <Chip icon={<CalendarIcon />} label={displayAge(bonsai)} />
          <Chip icon={<TreeIcon />} label={bonsai.style ?? '樹形未設定'} />
          <Chip icon={<ShoppingBagIcon />} label={bonsai.acquiredAt ?? '入手日未設定'} />
        </div>

        {/* S3-F5: アクションボタン */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
          <Button variant="primary" onClick={() => navigate(`/bonsai/${bonsai.id}/photo`)}>
            <CameraIcon /> 写真を追加
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

        <section style={{ padding: '0 16px 24px' }}>
          {/* S3-F7: 見出し「成長タイムライン」+ 枚数/期間 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>成長タイムライン</h2>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {mediaList.length}枚 · {monthSpan(mediaList)}ヶ月
            </span>
          </div>
          {mediaList.length === 0 ? (
            <EmptyTimeline onAdd={() => navigate(`/bonsai/${bonsai.id}/photo`)} />
          ) : (
            mediaList.map((m, i) => (
              <TimelineCard key={m.id} media={m} onClick={() => handleThumbnailClick(i)} />
            ))
          )}
        </section>
      </article>
    </BonsightShell>
  )
}
