import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import { createAdvice } from '../api/adviceApi'
import type { AdviceResult, HealthFlag } from '../api/adviceApi'

type ScreenState = 'loading' | 'result' | 'error'
type Tone = 'success' | 'warning' | 'danger'

function levelToTone(level: HealthFlag['level']): Tone {
  if (level === 'good') return 'success'
  if (level === 'warning') return 'warning'
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
  const { id: bonsaiId } = useParams<{ id: string }>()
  const location = useLocation()
  const { mediaId, mediaUrl } = (location.state ?? {}) as {
    mediaId?: string
    mediaUrl?: string
  }

  const [screenState, setScreenState] = useState<ScreenState>('loading')
  const [result, setResult] = useState<AdviceResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!bonsaiId) {
      setErrorMsg('盆栽IDが見つかりません')
      setScreenState('error')
      return
    }
    setScreenState('loading')
    createAdvice(bonsaiId, mediaId)
      .then((data) => {
        setResult(data)
        setScreenState('result')
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : 'AI診断に失敗しました')
        setScreenState('error')
      })
  }, [bonsaiId, mediaId, retryKey])

  return (
    <BonsightShell
      screen="S5"
      showTabBar={false}
      title="AI診断"
      onBack={() => navigate(-1)}
      contextAction={{ label: '✦', onClick: () => {} }}
    >
      {screenState === 'loading' && (
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
      )}

      {screenState === 'error' && (
        <div style={{ padding: '24px 16px' }}>
          <p
            role="alert"
            style={{ color: 'var(--status-danger-text, #B91C1C)', fontSize: 14, marginBottom: 16 }}
          >
            {errorMsg || 'AI診断に失敗しました。'}
          </p>
          <Button variant="secondary" onClick={() => setRetryKey((k) => k + 1)}>
            再試行
          </Button>
        </div>
      )}

      {screenState === 'result' && result && (
        <>
          {/* 対象写真サムネ */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
            <div style={{ width: 120, height: 90, borderRadius: '12px 12px 4px 12px', overflow: 'hidden' }}>
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="診断対象"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#EDEBE6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: '#9A938A',
                  }}
                >
                  診断対象
                </div>
              )}
            </div>
          </div>

          {/* 会話型AI吹き出し群 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
            <AiBubble>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>
                この盆栽は{result.diagnosis.species}ですね。
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
                信頼度 {confidenceLabel(result.diagnosis.confidence)}
              </span>
            </AiBubble>

            <AiBubble>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>健康状態を確認しました。</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.diagnosis.health.map((f) => (
                  <StatusBadge key={f.key} tone={levelToTone(f.level)}>
                    {f.label}
                  </StatusBadge>
                ))}
              </div>
            </AiBubble>

            <AiBubble>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                仕立て・管理
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.6 }}>{result.diagnosis.styling}</p>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                季節の世話
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{result.diagnosis.seasonal}</p>
            </AiBubble>
          </div>

          {/* 低信頼度注記 */}
          {result.diagnosis.confidence < 0.5 && (
            <div
              data-testid="low-confidence-note"
              style={{
                background: '#FEF9EE',
                border: '1px dashed #D9A94E',
                borderRadius: 12,
                padding: '10px 14px',
                margin: '0 16px 8px',
              }}
            >
              <p style={{ fontSize: 11, color: '#B0863F', margin: 0 }}>
                信頼度: 低 — 参考程度にとどめてください
              </p>
            </div>
          )}

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
              {result.diagnosis.disclaimer}
            </p>
          </div>

          {/* クイック返信チップ */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', flexWrap: 'wrap' }}>
            {[
              { label: '植替えの手順は？', suggestMessage: '植替えの手順は？' },
              { label: '芽摘みのコツ', suggestMessage: '芽摘みのコツを教えてください' },
            ].map(({ label, suggestMessage }) => (
              <button
                key={label}
                onClick={() => navigate('/s6', {
                  state: {
                    bonsaiId,
                    species: result.diagnosis.species,
                    suggestMessage,
                  }
                })}
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
            onClick={() => navigate(-1)}
            style={{ width: 'calc(100% - 32px)', margin: '8px 16px 24px' }}
          >
            この診断をカルテに保存
          </Button>
        </>
      )}
    </BonsightShell>
  )
}
