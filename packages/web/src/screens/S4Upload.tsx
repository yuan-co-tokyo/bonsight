import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AIBadge from '../components/AIBadge'
import Button from '../components/Button'
import PhotoPlaceholder from '../components/PhotoPlaceholder'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-input)',
  padding: '0 12px',
  fontSize: 14,
  fontFamily: 'var(--font-family)',
  color: 'var(--color-ink)',
  background: '#fff',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-input)',
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'var(--font-family)',
  color: 'var(--color-ink)',
  background: '#fff',
  boxSizing: 'border-box',
  resize: 'none',
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export default function S4Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [takenAt, setTakenAt] = useState(todayString())
  const [caption, setCaption] = useState('')
  const [autoDiagnose, setAutoDiagnose] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setSelectedFile(f)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setProgress(0)
    // TODO: AWS S3 presigned URL取得→直接アップロード→DB登録 未結線
    let current = 0
    const timer = setInterval(() => {
      current += 20
      setProgress(current)
      if (current >= 100) {
        clearInterval(timer)
        setUploading(false)
        if (autoDiagnose) {
          navigate('/bonsai/b1/ai-result') // TODO: 実際は登録したmediaIdをURLパラメータに含める
        } else {
          navigate(-1)
        }
      }
    }, 500)
  }

  return (
    <div
      data-screen="S4"
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
      {/* カスタムヘッダー: キャンセル + 写真を追加 + spacer */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '56px 16px 12px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            fontSize: 13.5,
            color: '#777067',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            minWidth: 60,
            textAlign: 'left',
          }}
        >
          キャンセル
        </button>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>
          写真を追加
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* スクロールコンテンツ */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
        <div
          style={{
            padding: '20px 16px',
            paddingBottom: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* 写真選択エリア */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 14,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1.5px dashed var(--color-border-strong)',
              position: 'relative',
            }}
          >
            {previewUrl ? (
              <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="選択済み写真" />
            ) : (
              <PhotoPlaceholder label="タップして写真を選択" aspectRatio="4/3" />
            )}
            {previewUrl && (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: '#fff',
                  color: '#5C7A52',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(92,122,82,.25)',
                }}
              >
                写真を変更
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* 撮影日 */}
          <div>
            <label htmlFor="taken-at" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              撮影日
            </label>
            <input
              id="taken-at"
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              style={fieldStyle}
            />
          </div>

          {/* キャプション */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              キャプション（任意）
            </label>
            <textarea
              rows={3}
              placeholder="今日の様子を一言…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={textareaStyle}
            />
          </div>

          {/* AI診断トグル */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <AIBadge>AI自動診断</AIBadge>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                アップロード後すぐAI診断にかける
              </p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 22, flexShrink: 0, marginLeft: 12 }}>
              <input
                type="checkbox"
                checked={autoDiagnose}
                onChange={(e) => setAutoDiagnose(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 11,
                  background: autoDiagnose ? '#5C7A52' : '#D6D3CB',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: autoDiagnose ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }}
              />
            </label>
          </div>

          {/* 進捗バー */}
          {uploading && (
            <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--color-accent)',
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 固定下部バー */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button
          variant="primary"
          disabled={!selectedFile || uploading}
          onClick={handleUpload}
          style={{ width: '100%', height: 50, borderRadius: 14 }}
        >
          {uploading ? `アップロード中... ${progress}%` : 'アップロード'}
        </Button>
      </div>
    </div>
  )
}
