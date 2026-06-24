import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BonsaiDto } from 'shared'
import { getBonsais } from '../api/bonsaiApi'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import type { BonsaiStub } from '../stubs/stubBonsai'

type BonsaiCardModel = {
  id: string
  name: string
  speciesLabel: string
  ageLabel: string
  styleLabel: string
  acquiredLabel: string
  updatedAt: string
}

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

function toCardModel(bonsai: BonsaiDto | BonsaiStub): BonsaiCardModel {
  if ('speciesJa' in bonsai) {
    return {
      id: bonsai.id,
      name: bonsai.name,
      speciesLabel: bonsai.speciesJa,
      ageLabel: bonsai.treeAge,
      styleLabel: bonsai.style,
      acquiredLabel: bonsai.acquiredAt,
      updatedAt: bonsai.updatedAt,
    }
  }

  return {
    id: bonsai.id,
    name: bonsai.nickname ? `${bonsai.name}「${bonsai.nickname}」` : bonsai.name,
    speciesLabel: bonsai.species ?? '樹種未設定',
    ageLabel: bonsai.estimatedAge !== undefined ? `約${bonsai.estimatedAge}年` : '樹齢未設定',
    styleLabel: bonsai.style ?? '樹形未設定',
    acquiredLabel: bonsai.acquiredAt ?? '入手日未設定',
    updatedAt: bonsai.updatedAt,
  }
}

function BonsaiCard({ bonsai, onClick }: { bonsai: BonsaiCardModel; onClick: () => void }) {
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
      <PhotoPlaceholder label={bonsai.speciesLabel} aspectRatio="1/1" />
      {/* S1-F2: 健康バッジ除去、相対日付表示 */}
      <div className="s3-card-body" style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px' }}>
          {bonsai.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
          {bonsai.speciesLabel}
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
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>盆栽がまだ登録されていません</p>
      <button
        onClick={onAdd}
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        最初の盆栽を登録する
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)' }}>
      読み込み中...
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 14 }}>
      <p style={{ fontSize: 14, color: 'var(--status-danger-text)', margin: 0 }}>データの読み込みに失敗しました</p>
      <button
        onClick={onRetry}
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        再試行
      </button>
    </div>
  )
}

export default function S1Home({ bonsaiList }: { bonsaiList?: BonsaiStub[] }) {
  const navigate = useNavigate()
  const [bonsais, setBonsais] = useState<BonsaiDto[]>([])
  const [loading, setLoading] = useState(bonsaiList === undefined)
  const [error, setError] = useState(false)

  async function loadBonsais() {
    setLoading(true)
    setError(false)
    try {
      setBonsais(await getBonsais())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bonsaiList === undefined) {
      void loadBonsais()
    }
  }, [bonsaiList])

  const displayBonsais = (bonsaiList ?? bonsais).map(toCardModel)

  return (
    <BonsightShell screen="S1" showTabBar activeTab="home">
      <section className="s1-home">
        {/* S1-F1: タイトルと件数の横並び */}
        <div className="s1-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 12px' }}>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            マイ盆栽
          </h1>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {displayBonsais.length}本
          </span>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={loadBonsais} />
        ) : displayBonsais.length === 0 ? (
          <EmptyState onAdd={() => navigate('/bonsai/new')} />
        ) : (
          // S1-F4: gap 12→15
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, padding: '0 16px 16px' }}>
            {displayBonsais.map(b => (
              <BonsaiCard key={b.id} bonsai={b} onClick={() => navigate(`/bonsai/${b.id}`)} />
            ))}
            <AddBonsaiCard onClick={() => navigate('/bonsai/new')} />
          </div>
        )}
      </section>
    </BonsightShell>
  )
}
