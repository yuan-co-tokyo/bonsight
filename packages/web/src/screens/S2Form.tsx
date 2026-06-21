import { useState } from 'react'
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

const baseInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  fontSize: 15,
  color: 'var(--color-ink)',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-family)',
  boxSizing: 'border-box',
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

  function handleSave() {
    if (!form.name.trim()) {
      setNameError(true)
      return
    }
    // TODO: AWS結線後にAPIを呼び、成功時にS1へ遷移
    navigate('/home')
  }

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field === 'name') setNameError(false)
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  const nameStyle: React.CSSProperties = {
    ...baseInputStyle,
    borderBottomColor: nameError ? 'var(--status-danger-text)' : undefined,
    color: nameError ? 'var(--status-danger-text)' : 'var(--color-ink)',
  }

  return (
    <BonsightShell
      screen="S2"
      showTabBar={false}
      title="盆栽を登録"
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
        <div>
          <label style={labelStyle}>樹木の名前</label>
          <input
            type="text"
            placeholder="例: 五葉松「翁」"
            value={form.name}
            onChange={handleChange('name')}
            aria-label="樹木の名前"
            style={nameStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>樹種</label>
          <input
            type="text"
            placeholder="例: ゴヨウマツ・五葉松"
            value={form.speciesJa}
            onChange={handleChange('speciesJa')}
            aria-label="樹種"
            style={baseInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>樹齢</label>
          <input
            type="text"
            placeholder="例: 約25年"
            value={form.treeAge}
            onChange={handleChange('treeAge')}
            aria-label="樹齢"
            style={baseInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>樹形</label>
          <input
            type="text"
            placeholder="例: 根締木"
            value={form.style}
            onChange={handleChange('style')}
            aria-label="樹形"
            style={baseInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>入手日</label>
          <input
            type="text"
            placeholder="例: 2025.5"
            value={form.acquiredAt}
            onChange={handleChange('acquiredAt')}
            aria-label="入手日"
            style={baseInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>メモ</label>
          <textarea
            rows={4}
            placeholder="自由メモ…"
            value={form.note}
            onChange={handleChange('note')}
            aria-label="メモ"
            style={{ ...baseInputStyle, resize: 'none' }}
          />
        </div>
      </div>
    </BonsightShell>
  )
}
