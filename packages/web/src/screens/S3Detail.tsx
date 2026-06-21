import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import Button from '../components/Button'
import AIBadge from '../components/AIBadge'
import { STUB_BONSAI_LIST } from '../stubs/stubBonsai'
import { STUB_TIMELINE, type TimelineEntryStub } from '../stubs/stubTimeline'

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

function monthSpan(entries: TimelineEntryStub[]): string {
  if (entries.length === 0) return '0'
  if (entries.length === 1) return '1'
  const times = entries.map(e => new Date(e.takenAt).getTime())
  const min = new Date(Math.min(...times))
  const max = new Date(Math.max(...times))
  const months = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth())
  return String(Math.max(months, 1))
}

function TimelineCard({ entry }: { entry: TimelineEntryStub }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <div style={{ position: 'relative' }}>
        <PhotoPlaceholder aspectRatio="16/10" label={formatDate(entry.takenAt)} />
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
          {formatDate(entry.takenAt)}
        </span>
      </div>
      <div style={{ padding: 12, fontSize: 13, lineHeight: 1.55, color: 'var(--color-ink)' }}>
        {entry.note}
      </div>
      {entry.aiDiagnosis !== null && (
        <div style={{ padding: '0 12px 12px' }}>
          <AIBadge>{entry.aiDiagnosis}</AIBadge>
        </div>
      )}
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

export default function S3Detail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const bonsai = STUB_BONSAI_LIST.find(b => b.id === id) ?? STUB_BONSAI_LIST[0]
  const timelineEntries = STUB_TIMELINE
    .filter(e => e.bonsaiId === bonsai.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())

  return (
    <BonsightShell
      screen="S3"
      showTabBar={false}
      title={bonsai.name}
      onBack={() => navigate(-1)}
      contextAction={{ label: '編集', onClick: () => navigate(`/bonsai/${bonsai.id}/edit`) }}
    >
      <article className="s3-detail">
        {/* S3-F8: hero aspect-ratio 5/4 */}
        <PhotoPlaceholder className="s3-hero" label={bonsai.speciesJa} aspectRatio="5/4" />

        {/* S3-F3: 名前+樹種ブロック */}
        <div className="s3-bonsai-name-block" style={{ padding: '16px 16px 8px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            {bonsai.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
            {bonsai.speciesJa}
          </p>
        </div>

        {/* S3-F4: チップを樹齢/樹形/入手に変更 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px' }}>
          <Chip icon={<CalendarIcon />} label={bonsai.treeAge} />
          <Chip icon={<TreeIcon />} label={bonsai.style} />
          <Chip icon={<ShoppingBagIcon />} label={bonsai.acquiredAt} />
        </div>

        {/* S3-F5: 写真を追加=primary, AIに診てもらう=secondary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
          <Button variant="primary" onClick={() => navigate(`/bonsai/${bonsai.id}/photo`)}>
            <CameraIcon /> 写真を追加
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/bonsai/${bonsai.id}/ai`)}>
            <SparkleIcon /> AIに診てもらう
          </Button>
        </div>

        <section style={{ paddingBottom: 24, padding: '0 16px 24px' }}>
          {/* S3-F7: 見出し「成長タイムライン」+ 枚数/期間 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>成長タイムライン</h2>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {timelineEntries.length}枚 · {monthSpan(timelineEntries)}ヶ月
            </span>
          </div>
          {timelineEntries.length === 0 ? (
            <EmptyTimeline onAdd={() => navigate(`/bonsai/${bonsai.id}/photo`)} />
          ) : (
            timelineEntries.map(e => <TimelineCard key={e.id} entry={e} />)
          )}
        </section>
      </article>
    </BonsightShell>
  )
}
