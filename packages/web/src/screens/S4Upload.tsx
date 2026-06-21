import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AIBadge from '../components/AIBadge'
import BonsightShell from '../components/BonsightShell'
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
    <BonsightShell
      screen="S4"
      showTabBar={false}
      title="写真を追加"
      onBack={() => navigate(-1)}
    >
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                bottom: 10,
                right: 10,
                background: 'rgba(0,0,0,.5)',
                color: '#fff',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              変更
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
              写真のアップロード後に自動でAI診断する
            </p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0, marginLeft: 12 }}>
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
                borderRadius: 13,
                background: autoDiagnose ? '#5C7A52' : '#D6D3CB',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: autoDiagnose ? 23 : 3,
                width: 20,
                height: 20,
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

        {/* アップロードボタン */}
        <Button
          variant="primary"
          disabled={!selectedFile || uploading}
          onClick={handleUpload}
          style={{ width: '100%' }}
        >
          {uploading ? `アップロード中... ${progress}%` : '写真をアップロード'}
        </Button>
      </div>
    </BonsightShell>
  )
}
