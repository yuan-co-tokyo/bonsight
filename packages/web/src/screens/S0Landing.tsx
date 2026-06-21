import { useNavigate } from 'react-router-dom'
import BonsightLogo from '../components/BonsightLogo'
import Button from '../components/Button'

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#B0863F" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#5C7A52" strokeWidth="1.8" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="#5C7A52" strokeWidth="1.5" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="#5C7A52" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="#5C7A52" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <CameraIcon />,
    heading: '写真で残す',
    description: '盆栽の今を写真で記録しよう',
  },
  {
    icon: <SparkleIcon />,
    heading: 'AIが診る',
    description: '画像からAIが状態を分析してアドバイス',
  },
  {
    icon: <CalendarIcon />,
    heading: '成長タイムライン',
    description: '時系列で成長の変化を追える',
  },
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
      {/* ロゴ + ワードマーク (S0-L1) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 72,
        }}
      >
        <BonsightLogo size={54} />
        <span
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--color-ink)',
            marginTop: 12,
          }}
        >
          bonsight
        </span>
      </div>

      {/* タグライン (S0-H1) */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: '#777067',
          textAlign: 'center',
          maxWidth: 260,
          margin: '12px auto 48px',
          lineHeight: 1.6,
        }}
      >
        AIが見守る、あなたの盆栽
      </p>

      {/* 特徴3点 (S0-H2) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          margin: '0 auto',
          maxWidth: 320,
          width: '100%',
        }}
      >
        {FEATURES.map(({ icon, heading, description }) => (
          <div
            key={heading}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              width: '100%',
              maxWidth: 320,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#EEF2EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)' }}>
                {heading}
              </p>
              <p style={{ margin: 0, fontSize: 11.5, color: '#777067', lineHeight: 1.5 }}>
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ボタン2本 (S0-H3) */}
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
          ログイン
        </Button>
        {/* TODO: Cognito新規登録フロー */}
        <Button variant="secondary" fullWidth onClick={() => navigate('/home')}>
          新規登録
        </Button>
      </div>

      {/* 認証注記 (S0-M1) */}
      <p
        style={{
          fontSize: 10.5,
          color: '#9A938A',
          textAlign: 'center',
          margin: '16px auto 0',
          maxWidth: 280,
        }}
      >
        ログイン・新規登録は安全な認証画面へ移動します
      </p>
    </div>
  )
}
