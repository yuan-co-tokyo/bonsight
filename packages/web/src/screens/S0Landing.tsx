import { useNavigate } from 'react-router-dom'
import BonsightLogo from '../components/BonsightLogo'
import Button from '../components/Button'

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3C7 8 7 16 12 21C17 16 17 8 12 3Z"
        fill="none"
        stroke="#5C7A52"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="#5C7A52" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="#5C7A52" strokeWidth="1.8" />
      <circle cx="12" cy="14" r="3.5" stroke="#5C7A52" strokeWidth="1.8" />
      <path
        d="M8 7L9.5 4H14.5L16 7"
        stroke="#5C7A52"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#B0863F" />
    </svg>
  )
}

const FEATURES = [
  { icon: <LeafIcon />, text: 'カルテで盆栽を一元管理' },
  { icon: <CameraIcon />, text: '写真で成長タイムラインを記録' },
  { icon: <SparkleIcon />, text: 'AIが樹木の状態を診断・アドバイス' },
]

export default function S0Landing() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
        maxWidth: 430,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ロゴ + ワードマーク */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 72,
        }}
      >
        <BonsightLogo size={48} />
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-ink)',
            marginTop: 12,
          }}
        >
          bonsight
        </span>
      </div>

      {/* キャッチコピー */}
      <p
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          maxWidth: 260,
          margin: '16px auto 48px',
          lineHeight: 1.6,
        }}
      >
        盆栽の成長を、写真と記録で残す。
      </p>

      {/* 特徴3点 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          margin: '0 auto',
          maxWidth: 280,
          width: '100%',
        }}
      >
        {FEATURES.map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {icon}
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-ink)' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* ボタン2本 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 320,
          width: '100%',
          margin: '48px auto 0',
        }}
      >
        {/* TODO: Cognito認証後に差替え */}
        <Button variant="primary" fullWidth onClick={() => navigate('/home')}>
          はじめる
        </Button>
        {/* TODO: Cognito認証 */}
        <Button variant="secondary" fullWidth onClick={() => navigate('/home')}>
          ログイン
        </Button>
      </div>

      {/* バージョン */}
      <p
        style={{
          fontSize: 10.5,
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
          margin: '32px auto 24px',
        }}
      >
        bonsight v0.1.0 (Phase1)
      </p>
    </div>
  )
}
