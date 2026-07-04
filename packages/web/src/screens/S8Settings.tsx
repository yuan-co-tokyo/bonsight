import { useEffect, useState } from 'react'
import { signOut } from 'aws-amplify/auth'
import type { UserDto } from 'shared'
import BonsightShell from '../components/BonsightShell'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import { getMe, updateMe } from '../api/meApi'

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

const inputStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 13,
  color: 'var(--color-ink)',
  border: '1px solid #D5D0C8',
  borderRadius: 6,
  padding: '6px 8px',
  background: '#FAFAF8',
  outline: 'none',
  minWidth: 0,
}

const CLIMATEZONE_OPTIONS = ['温帯', '寒帯', '亜熱帯', '熱帯', '乾燥帯']

export default function S8Settings() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editRegion, setEditRegion] = useState('')
  const [editClimatezone, setEditClimatezone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setError('ユーザー情報の取得に失敗しました')
        setLoading(false)
      })
  }, [])

  async function handleLogout() {
    await signOut()
  }

  function startEdit() {
    if (!user) return
    setEditDisplayName(user.displayName)
    setEditRegion(user.region ?? '')
    setEditClimatezone(user.climatezone ?? '')
    setSaveError(null)
    setSaveSuccess(false)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setSaveError(null)
  }

  async function handleSave() {
    if (editDisplayName.trim() === '') return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await updateMe({
        displayName: editDisplayName.trim(),
        region: editRegion || undefined,
        climatezone: editClimatezone || undefined,
      })
      setUser(updated)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  const initials = user ? user.displayName.charAt(0) : '?'

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

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            読み込み中...
          </div>
        )}

        {error && (
          <div style={{ color: '#C0392B', fontSize: 13, padding: '12px 0' }}>{error}</div>
        )}

        {!loading && !error && user && (
          <>
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
              </div>
              <ChevronRight />
            </div>

            {saveSuccess && (
              <div
                style={{
                  background: '#EEF5EC',
                  border: '1px solid #A8D5A2',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#2E7D32',
                  marginBottom: 12,
                }}
              >
                プロフィールを保存しました
              </div>
            )}

            {/* グループ: プロフィール */}
            <div style={groupStyle}>
              <div style={{ ...groupHeadingStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>プロフィール</span>
                {!isEditing && (
                  <button
                    onClick={startEdit}
                    style={{
                      fontSize: 11.5,
                      color: 'var(--color-accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0 0 0 8px',
                      fontWeight: 600,
                    }}
                  >
                    編集
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ padding: '8px 16px 16px' }}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                      表示名
                    </label>
                    <input
                      style={inputStyle}
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="表示名を入力"
                    />
                    {editDisplayName.trim() === '' && (
                      <div style={{ fontSize: 11, color: '#C0392B', marginTop: 3 }}>表示名は必須です</div>
                    )}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                      地域
                    </label>
                    <input
                      style={inputStyle}
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      placeholder="例: 東京、関東"
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                      気候帯
                    </label>
                    <select
                      style={{ ...inputStyle, width: '100%' }}
                      value={editClimatezone}
                      onChange={(e) => setEditClimatezone(e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {CLIMATEZONE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  {saveError && (
                    <div style={{ fontSize: 12, color: '#C0392B', marginBottom: 10 }}>{saveError}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleSave}
                      disabled={saving || editDisplayName.trim() === ''}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: saving || editDisplayName.trim() === '' ? '#C8D5C0' : 'var(--color-accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: saving || editDisplayName.trim() === '' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {saving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: '#F0EDE8',
                        color: 'var(--color-ink)',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: saving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                      {user.region ?? '—'} · {user.climatezone ?? '—'}
                    </span>
                    <ChevronRight />
                  </div>
                </>
              )}

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
          </>
        )}
      </div>
    </BonsightShell>
  )
}
