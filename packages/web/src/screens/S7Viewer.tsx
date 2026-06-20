import BonsightShell from '../components/BonsightShell'

export default function S7Viewer() {
  return (
    <BonsightShell screen="S7" showTabBar={false} title="写真">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S7 ビューア（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
