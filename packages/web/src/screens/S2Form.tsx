import BonsightShell from '../components/BonsightShell'

export default function S2Form() {
  return (
    <BonsightShell screen="S2" showTabBar={false} title="盆栽を登録">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S2 登録フォーム（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
