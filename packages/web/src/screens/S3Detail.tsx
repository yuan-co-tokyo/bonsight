import BonsightShell from '../components/BonsightShell'

export default function S3Detail() {
  return (
    <BonsightShell screen="S3" showTabBar={false} title="カルテ">
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>S3 詳細（スケルトン）</p>
      </div>
    </BonsightShell>
  )
}
