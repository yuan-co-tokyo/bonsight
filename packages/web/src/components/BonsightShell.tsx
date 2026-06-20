import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import BonsightLogo from './BonsightLogo'

export type ScreenKey = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8'

interface BonsightShellProps {
  screen: ScreenKey
  children: ReactNode
  title?: string
  onBack?: () => void
  contextAction?: { label: string; onClick: () => void }
  showTabBar?: boolean
  activeTab?: 'home' | 'ai' | 'settings'
}

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? '#5C7A52' : '#9A938A'
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke={color}
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AIIcon({ active }: { active: boolean }) {
  const color = active ? '#5C7A52' : '#9A938A'
  const sparkFill = active ? '#5C7A52' : '#9A938A'
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4H14C15.1 4 16 4.9 16 6V13C16 14.1 15.1 15 14 15H8L4 19V6C4 4.9 4.9 4 4 4Z"
        stroke={color}
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path d="M19 2 L19.8 5 L23 5.8 L19.8 6.6 L19 10 L18.2 6.6 L15 5.8 L18.2 5 Z" fill={sparkFill} />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  const color = active ? '#5C7A52' : '#9A938A'
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="3" y1="8" x2="21" y2="8" stroke={color} strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
      <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18L9 12L15 6" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BonsightShell({
  screen,
  children,
  title,
  onBack,
  contextAction,
  showTabBar = false,
  activeTab = 'home',
}: BonsightShellProps) {
  const navigate = useNavigate()

  const handleBack = onBack ?? (() => navigate(-1))

  const tabs = [
    { key: 'home' as const, label: 'ホーム', path: '/s1', Icon: HomeIcon },
    { key: 'ai' as const, label: 'AI相談', path: '/s6', Icon: AIIcon },
    { key: 'settings' as const, label: '設定', path: '/s8', Icon: SettingsIcon },
  ]

  return (
    <div
      data-screen={screen}
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 430,
        margin: '0 auto',
        width: '100%',
        background: 'var(--color-bg)',
      }}
    >
      {/* トップバー */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: showTabBar ? 58 : 56,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {showTabBar ? (
          /* ルート画面: ロゴ + wordmark */
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BonsightLogo size={24} />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>
              bonsight
            </span>
          </div>
        ) : (
          /* push画面: 戻る + タイトル */
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: 'var(--color-ink)',
            }}
            aria-label="戻る"
          >
            <ChevronLeft />
            {title && (
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                {title}
              </span>
            )}
          </button>
        )}

        {/* 右側 */}
        {showTabBar ? (
          /* アバター */
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--color-accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-accent)',
            }}
          >
            U
          </div>
        ) : contextAction ? (
          <button
            onClick={contextAction.onClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--color-accent)',
              padding: 0,
              fontFamily: 'var(--font-family)',
            }}
          >
            {contextAction.label}
          </button>
        ) : null}
      </div>

      {/* コンテンツ */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--color-bg)',
        }}
      >
        {children}
      </div>

      {/* タブバー */}
      {showTabBar && (
        <nav
          style={{
            background: '#fff',
            borderTop: '1px solid var(--color-border)',
            padding: '9px 0 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-around',
            flexShrink: 0,
          }}
          aria-label="メインナビゲーション"
        >
          {tabs.map(({ key, label, path, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  color: isActive ? '#5C7A52' : '#9A938A',
                  fontFamily: 'var(--font-family)',
                }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon active={isActive} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
