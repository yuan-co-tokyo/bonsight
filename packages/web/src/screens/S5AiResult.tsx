import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import StatusBadge from '../components/StatusBadge'
import { STUB_AI_RESULT } from '../stubs/stubAiResult'
import type { HealthFlag } from '../stubs/stubAiResult'

type Tone = 'success' | 'warning' | 'danger'

function levelToTone(level: HealthFlag['level']): Tone {
  if (level === 'ok') return 'success'
  if (level === 'caution') return 'warning'
  return 'danger'
}

function confidenceLabel(c: number): string {
  if (c >= 0.85) return '高'
  if (c >= 0.6) return '中'
  return '低'
}

function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#B0863F"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="ai-bubble"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '4px 16px',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#EDEBE6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <SparkleIcon size={14} />
      </div>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '14px 14px 14px 4px',
          padding: '12px 14px',
          maxWidth: '82%',
          fontSize: 13,
          lineHeight: 1.65,
          color: 'var(--color-ink)',
        }}
      >
        {children}
      </div>
    </div>
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
      title="AI診断"
      onBack={() => navigate(-1)}
      contextAction={{ label: '✦', onClick: () => {} }}
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
          <SparkleIcon size={32} />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 12, marginBottom: 0 }}>
            AI診断中...
          </p>
        </div>
      ) : (
        <>
          {/* 対象写真サムネ */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
            <div style={{ width: 120, height: 90, borderRadius: '12px 12px 4px 12px', overflow: 'hidden' }}>
              <PhotoPlaceholder label="診断対象" />
            </div>
          </div>

          {/* 会話型AI吹き出し群 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
            {/* 吹き出し①: 樹種確認 */}
            <AiBubble>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>
                この盆栽は{result.species}ですね。
              </p>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--status-success-bg)',
                  color: 'var(--status-success-text)',
                }}
              >
                信頼度 {confidenceLabel(result.confidence)}
              </span>
            </AiBubble>

            {/* 吹き出し②: 健康フラグ (flex-wrap横並び) */}
            <AiBubble>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>健康状態を確認しました。</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.health.map((f) => (
                  <StatusBadge key={f.key} tone={levelToTone(f.level)}>
                    {f.label}
                  </StatusBadge>
                ))}
              </div>
            </AiBubble>

            {/* 吹き出し③: 仕立て + 季節の世話 */}
            <AiBubble>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                仕立て・管理
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.6 }}>{result.styling}</p>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                季節の世話
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{result.seasonal}</p>
            </AiBubble>
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
                onClick={() => navigate(path)}
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
