import BonsightShell from '../components/BonsightShell'

export default function S5AiResult() {
  return (
    <BonsightShell screen="S5" showTabBar={false} title="AI診断">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S5 AI診断結果（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
