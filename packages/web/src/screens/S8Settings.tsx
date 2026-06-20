import BonsightShell from '../components/BonsightShell'

export default function S8Settings() {
  return (
    <BonsightShell screen="S8" showTabBar activeTab="settings">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S8 設定（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
