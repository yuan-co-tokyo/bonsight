import BonsightShell from '../components/BonsightShell'

export default function S0Landing() {
  return (
    <BonsightShell screen="S0" showTabBar={false}>
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S0 ランディング（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
