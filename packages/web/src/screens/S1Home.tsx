import BonsightShell from '../components/BonsightShell'

export default function S1Home() {
  return (
    <BonsightShell screen="S1" showTabBar activeTab="home">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S1 ホーム（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
