import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import { STUB_BONSAI_LIST, type BonsaiStub } from '../stubs/stubBonsai'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5V19M5 12H19" stroke="var(--color-accent-contrast)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// S1-F2: 相対日付ユーティリティ
function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今日更新'
  if (diffDays < 30) return `${diffDays}日前に更新`
  return `${date.getMonth() + 1}月${date.getDate()}日に更新`
}

function BonsaiCard({ bonsai, onClick }: { bonsai: BonsaiStub; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 14,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      aria-label={bonsai.name}
    >
      <PhotoPlaceholder label={bonsai.speciesJa} aspectRatio="1/1" />
      {/* S1-F2: 健康バッジ除去、相対日付表示 */}
      <div className="s3-card-body" style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px' }}>
          {bonsai.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
          {bonsai.speciesJa}
        </p>
        <p style={{ fontSize: 10.5, color: 'var(--color-text-tertiary)', margin: 0 }}>
          {formatRelative(bonsai.updatedAt)}
        </p>
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
      className="s1-add-card"
      style={{
        background: 'var(--color-surface-alt)',
        border: '1.5px dashed var(--color-border-strong)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        minHeight: 140,
      }}
      aria-label="盆栽を登録"
    >
      {/* S1-F3: 38px苔色丸ボタン */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        background: 'var(--color-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PlusIcon />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>盆栽を登録</span>
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
        {/* S1-F1: タイトルと件数の横並び */}
        <div className="s1-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 12px' }}>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            マイ盆栽
          </h1>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {bonsaiList.length}本
          </span>
        </div>
        {bonsaiList.length === 0 ? (
          <EmptyState onAdd={() => navigate('/bonsai/new')} />
        ) : (
          // S1-F4: gap 12→15
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, padding: '0 16px 16px' }}>
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
