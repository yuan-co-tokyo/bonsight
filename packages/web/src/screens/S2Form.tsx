import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'

interface FormState {
  name: string
  speciesJa: string
  treeAge: string
  style: string
  acquiredAt: string
  note: string
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 46,
  padding: '0 14px',
  border: '1px solid #E5E3DD',
  borderRadius: 10,
  background: '#fff',
  fontSize: 15,
  color: 'var(--color-ink)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-family)',
}

const textareaStyle: React.CSSProperties = {
  ...fieldStyle,
  height: 'auto',
  padding: '12px 14px',
  resize: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
  display: 'block',
}

export default function S2Form() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    name: '',
    speciesJa: '',
    treeAge: '',
    style: '',
    acquiredAt: '',
    note: '',
  })
  const [nameError, setNameError] = useState(false)
  const [origin, setOrigin] = useState('')
  const [, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    if (!form.name.trim()) {
      setNameError(true)
      return
    }
    // TODO: AWS結線後にAPIを呼び、成功時にS1へ遷移
    navigate('/home')
  }

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (field === 'name') setNameError(false)
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  const nameFieldStyle: React.CSSProperties = {
    ...fieldStyle,
    borderColor: nameError ? 'var(--status-danger-text)' : '#E5E3DD',
    color: nameError ? 'var(--status-danger-text)' : 'var(--color-ink)',
  }

  return (
    <BonsightShell
      screen="S2"
      showTabBar={false}
      title="盆栽を登録"
      leftAction="cancel"
      onBack={() => navigate(-1)}
      contextAction={{ label: '保存', onClick: handleSave }}
    >
      <div
        style={{
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* 表紙写真 (S2-H1) */}
        <div>
          <div
            onClick={() => coverInputRef.current?.click()}
            style={{
              width: '100%',
              aspectRatio: '5/3',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1.5px dashed var(--color-border-strong)',
              background: '#FAF9F6',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {coverPreviewUrl ? (
              <img
                src={coverPreviewUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="表紙写真プレビュー"
              />
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#5C7A52' }}>表紙写真を追加</span>
              </>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setCoverFile(f)
                setCoverPreviewUrl(URL.createObjectURL(f))
              }
            }}
          />
        </div>

        {/* 名前・愛称 (S2-L1) */}
        <div>
          <label style={labelStyle}>
            名前・愛称 <span style={{ color: 'var(--status-danger-text)' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="例: 五葉松「翁」"
            value={form.name}
            onChange={handleChange('name')}
            aria-label="名前・愛称"
            style={nameFieldStyle}
          />
        </div>

        {/* 樹種 */}
        <div>
          <label style={labelStyle}>樹種</label>
          <input
            type="text"
            placeholder="例: ゴヨウマツ・五葉松"
            value={form.speciesJa}
            onChange={handleChange('speciesJa')}
            aria-label="樹種"
            style={fieldStyle}
          />
        </div>

        {/* 由来 (S2-M1) */}
        <div>
          <label style={labelStyle}>由来</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {(['実生', '挿し木', '購入'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setOrigin(opt)}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 10,
                  border: `1px solid ${origin === opt ? '#5C7A52' : '#E5E3DD'}`,
                  background: origin === opt ? '#EEF2EC' : '#fff',
                  color: origin === opt ? '#5C7A52' : 'var(--color-ink)',
                  fontSize: 14,
                  fontWeight: origin === opt ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 樹齢 */}
        <div>
          <label style={labelStyle}>樹齢</label>
          <input
            type="text"
            placeholder="例: 約25年"
            value={form.treeAge}
            onChange={handleChange('treeAge')}
            aria-label="樹齢"
            style={fieldStyle}
          />
        </div>

        {/* 樹形 → select (S2-M2) */}
        <div>
          <label style={labelStyle}>樹形</label>
          <select
            value={form.style}
            onChange={handleChange('style')}
            aria-label="樹形"
            style={fieldStyle}
          >
            <option value="">選択してください</option>
            {['直幹', '斜幹', '模様木', '文人木', '懸崖', '半懸崖', 'その他'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* 入手日 → date (S2-M2) */}
        <div>
          <label style={labelStyle}>入手日</label>
          <input
            type="date"
            value={form.acquiredAt}
            onChange={handleChange('acquiredAt')}
            aria-label="入手日"
            style={fieldStyle}
          />
        </div>

        {/* メモ */}
        <div>
          <label style={labelStyle}>メモ</label>
          <textarea
            rows={4}
            placeholder="自由メモ…"
            value={form.note}
            onChange={handleChange('note')}
            aria-label="メモ"
            style={textareaStyle}
          />
        </div>
      </div>
    </BonsightShell>
  )
}
