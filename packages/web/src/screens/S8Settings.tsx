import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import { STUB_USER } from '../stubs/stubUser'

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18L15 12L9 6"
        stroke="var(--color-text-tertiary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkleSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#B0863F" />
    </svg>
  )
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #EDEBE6',
  padding: '14px 16px',
}

const groupStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #EDEBE6',
  borderRadius: 14,
  marginBottom: 12,
  overflow: 'hidden',
}

const groupHeadingStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--color-text-tertiary)',
  letterSpacing: 0.5,
  padding: '14px 16px 8px',
}

export default function S8Settings() {
  const navigate = useNavigate()
  const user = STUB_USER
  const initials = user.displayName.charAt(0)

  function handleLogout() {
    // TODO: Cognito signOut未結線
    navigate('/')
  }

  return (
    <BonsightShell screen="S8" showTabBar activeTab="settings">
      <div style={{ padding: '0 16px' }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-ink)',
            padding: '24px 0 16px',
            margin: 0,
          }}
        >
          設定
        </h1>

        {/* プロフィールカード */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #EDEBE6',
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#EEF2EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-accent)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>
              {user.displayName}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>
              {user.email}
            </div>
          </div>
          <ChevronRight />
        </div>

        {/* グループ: プロフィール */}
        <div style={groupStyle}>
          <div style={groupHeadingStyle}>プロフィール</div>

          <div style={rowStyle}>
            <span style={{ fontSize: 14, color: 'var(--color-ink)', flex: 1 }}>表示名</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginRight: 6 }}>
              {user.displayName}
            </span>
            <ChevronRight />
          </div>

          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={{ fontSize: 14, color: 'var(--color-ink)', flex: 1 }}>地域・気候帯</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginRight: 6 }}>
              {user.region} · {user.climatZone}
            </span>
            <ChevronRight />
          </div>

          {/* AIアドバイス注記 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              padding: '10px 16px 14px',
            }}
          >
            <SparkleSmall />
            <span style={{ fontSize: 11, color: '#8A6B22', lineHeight: 1.55 }}>
              地域・気候帯は <strong style={{ fontWeight: 600 }}>AIアドバイスの精度</strong>{' '}
              に使われます。
            </span>
          </div>
        </div>

        {/* グループ: アカウント */}
        <div style={groupStyle}>
          <div style={groupHeadingStyle}>アカウント</div>

          <div style={rowStyle}>
            <span style={{ fontSize: 14, color: 'var(--color-ink)', flex: 1 }}>
              アカウント管理
            </span>
            <span style={{ marginRight: 6 }}>
              <StatusBadge tone="neutral">近日公開</StatusBadge>
            </span>
            <ChevronRight />
          </div>

          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={{ fontSize: 14, color: 'var(--color-ink)', flex: 1 }}>
              通知（水やり・季節）
            </span>
            <span style={{ marginRight: 6 }}>
              <StatusBadge tone="neutral">Phase2</StatusBadge>
            </span>
            <ChevronRight />
          </div>
        </div>

        {/* ログアウトボタン */}
        <div style={{ margin: '24px 0 8px' }}>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            ログアウト
          </Button>
        </div>

        {/* バージョン */}
        <p
          style={{
            fontSize: 10.5,
            color: 'var(--color-text-tertiary)',
            textAlign: 'center',
            padding: '8px 0 32px',
            margin: 0,
          }}
        >
          bonsight v0.1.0 (Phase1)
        </p>
      </div>
    </BonsightShell>
  )
}
