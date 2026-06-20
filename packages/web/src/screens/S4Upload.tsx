import BonsightShell from '../components/BonsightShell'

export default function S4Upload() {
  return (
    <BonsightShell screen="S4" showTabBar={false} title="写真を追加">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S4 アップロード（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
