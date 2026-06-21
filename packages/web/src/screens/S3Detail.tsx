import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import Button from '../components/Button'
import { STUB_BONSAI_LIST } from '../stubs/stubBonsai'
import { STUB_TIMELINE, type TimelineEntryStub } from '../stubs/stubTimeline'

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7 8 7 16 12 21C17 16 17 8 12 3Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 11h12l-1.5 7H7.5L6 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 11h16M9 11V7a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21C12 21 5 13.5 5 9a7 7 0 0114 0c0 4.5-7 12-7 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
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

function TimelineCard({ entry }: { entry: TimelineEntryStub }) {
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <PhotoPlaceholder aspectRatio="16/9" />
      <div style={{ padding: '10px 16px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
          {formatDate(entry.takenAt)}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--color-ink)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {entry.note}
        </div>
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
        <PhotoPlaceholder className="s3-hero" label={bonsai.species} aspectRatio="4/3" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
          <Chip icon={<LeafIcon />} label={bonsai.species} />
          <Chip icon={<PotIcon />} label={bonsai.potSize} />
          <Chip icon={<MapPinIcon />} label={bonsai.originArea} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
          <Button variant="secondary" onClick={() => navigate(`/bonsai/${bonsai.id}/photo`)}>
            <CameraIcon /> 写真を追加
          </Button>
          <Button variant="primary" onClick={() => navigate(`/bonsai/${bonsai.id}/ai`)}>
            <SparkleIcon /> AIに診てもらう
          </Button>
        </div>

        <section style={{ paddingBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', padding: '0 16px', marginBottom: 8 }}>
            成長の記録
          </h2>
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
