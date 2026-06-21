import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AIBadge from '../components/AIBadge'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import { STUB_AI_RESULT } from '../stubs/stubAiResult'
import type { HealthFlag } from '../stubs/stubAiResult'

type Tone = 'success' | 'warning' | 'danger'

function levelToTone(level: HealthFlag['level']): Tone {
  if (level === 'ok') return 'success'
  if (level === 'caution') return 'warning'
  return 'danger'
}

function SparkleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="#B0863F"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

export default function S5AiResult() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const result = STUB_AI_RESULT

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  function handleSave() {
    // TODO: AIAdviceをDB保存 未結線
    navigate(-1)
  }

  return (
    <BonsightShell
      screen="S5"
      showTabBar={false}
      title="AI診断結果"
      onBack={() => navigate(-1)}
      contextAction={{ label: '共有', onClick: () => {} }}
    >
      {loading ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SparkleIcon />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 12, marginBottom: 0 }}>
            AI診断中...
          </p>
        </div>
      ) : (
        <>
          {/* AI吹き出し */}
          <div
            style={{
              background: '#fff',
              borderRadius: '14px 14px 14px 4px',
              padding: 16,
              margin: 16,
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            }}
          >
            {/* ① 樹種信頼度 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <AIBadge>AI診断</AIBadge>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                樹種: {result.species}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'var(--status-success-bg)',
                  color: 'var(--status-success-text)',
                  borderRadius: 999,
                  padding: '2px 8px',
                }}
              >
                確度 {Math.round(result.confidence * 100)}%
              </span>
            </div>

            {/* ② 健康フラグ一覧 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                margin: '12px 0',
              }}
            >
              {result.health.map((flag) => (
                <div
                  key={flag.key}
                  style={{
                    background: `var(--status-${levelToTone(flag.level)}-bg)`,
                    border: `1px solid var(--status-${levelToTone(flag.level)}-border)`,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <StatusBadge tone={levelToTone(flag.level)}>{flag.label}</StatusBadge>
                  </div>
                  <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    {flag.note}
                  </p>
                </div>
              ))}
            </div>

            {/* ③ 仕立てアドバイス */}
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: '12px 0 4px' }}>
              仕立て・管理
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-ink)', margin: 0 }}>
              {result.styling}
            </p>

            {/* ④ 季節の世話 */}
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: '12px 0 4px' }}>
              季節の世話
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-ink)', margin: 0 }}>
              {result.seasonal}
            </p>
          </div>

          {/* 免責ノート */}
          <div
            style={{
              background: '#FAF9F6',
              border: '1px dashed #D6D3CB',
              borderRadius: 12,
              padding: '12px 14px',
              margin: '0 16px 12px',
            }}
          >
            <p style={{ fontSize: 10.5, color: '#9A938A', margin: 0, lineHeight: 1.6 }}>
              ※ AIによる参考情報です。最終判断はご自身でお願いします。
            </p>
          </div>

          {/* クイック返信チップ */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', flexWrap: 'wrap' }}>
            {[
              { label: '植替えの手順は？', path: '/ai-chat?context=repot' },
              { label: '芽摘みのコツ',     path: '/ai-chat?context=bud' },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)} // TODO: 文脈付き遷移
                style={{
                  border: '1px solid #5C7A52',
                  color: '#5C7A52',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 保存ボタン */}
          <Button
            variant="primary"
            onClick={handleSave}
            style={{ width: 'calc(100% - 32px)', margin: '8px 16px 24px' }}
          >
            この診断をカルテに保存
          </Button>
        </>
      )}
    </BonsightShell>
  )
}
