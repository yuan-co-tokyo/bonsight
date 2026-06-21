import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import StatusBadge from '../components/StatusBadge'
import { STUB_BONSAI_LIST, type BonsaiStub } from '../stubs/stubBonsai'

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function statusTone(status: BonsaiStub['status']): 'success' | 'warning' | 'neutral' {
  if (status === 'healthy') return 'success'
  if (status === 'warning') return 'warning'
  return 'neutral'
}

function statusLabel(status: BonsaiStub['status']): string {
  if (status === 'healthy') return '健康'
  if (status === 'warning') return '要注意'
  return '未記録'
}

function isCaringDueSoon(nextCaringDue: string | null): boolean {
  if (!nextCaringDue) return false
  const due = new Date(nextCaringDue)
  const now = new Date()
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 3
}

function BonsaiCard({ bonsai, onClick }: { bonsai: BonsaiStub; onClick: () => void }) {
  const soon = isCaringDueSoon(bonsai.nextCaringDue)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      aria-label={bonsai.name}
    >
      <PhotoPlaceholder label={bonsai.species} aspectRatio="1/1" />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>
          {bonsai.name}
        </div>
        <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          {bonsai.species}
        </div>
        <StatusBadge tone={statusTone(bonsai.status)}>
          {statusLabel(bonsai.status)}
        </StatusBadge>
        {soon && bonsai.nextCaringDue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            <CalendarIcon />
            {bonsai.nextCaringDue}
          </div>
        )}
      </div>
    </div>
  )
}

function AddBonsaiCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: 'transparent',
        border: '1.5px dashed var(--color-border-strong)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        minHeight: 140,
      }}
      aria-label="盆栽を登録"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5V19M5 12H19" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-accent)' }}>盆栽を登録</span>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 16 }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3C7 8 7 16 12 21C17 16 17 8 12 3Z" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" fill="var(--color-accent)" />
      </svg>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>まだ盆栽がありません</p>
      <button
        onClick={onAdd}
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        最初の盆栽を登録する
      </button>
    </div>
  )
}

export default function S1Home({ bonsaiList = STUB_BONSAI_LIST }: { bonsaiList?: BonsaiStub[] }) {
  const navigate = useNavigate()

  return (
    <BonsightShell screen="S1" showTabBar activeTab="home">
      <section className="s1-home">
        <header style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 8px' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{bonsaiList.length}本</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: '2px 0 0' }}>マイ盆栽</h1>
        </header>
        {bonsaiList.length === 0 ? (
          <EmptyState onAdd={() => navigate('/bonsai/new')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
            {bonsaiList.map(b => (
              <BonsaiCard key={b.id} bonsai={b} onClick={() => navigate(`/bonsai/${b.id}`)} />
            ))}
            <AddBonsaiCard onClick={() => navigate('/bonsai/new')} />
          </div>
        )}
      </section>
    </BonsightShell>
  )
}
