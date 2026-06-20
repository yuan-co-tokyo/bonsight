import BonsightShell from '../components/BonsightShell'

export default function S6AiChat() {
  return (
    <BonsightShell screen="S6" showTabBar activeTab="ai">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S6 AI相談（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
