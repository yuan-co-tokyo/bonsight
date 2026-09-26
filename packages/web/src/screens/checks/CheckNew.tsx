import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { PurchaseExperience, PurchasePhotoRole } from 'shared'
import BonsightShell from '../../components/BonsightShell'
import Button from '../../components/Button'
import { createPurchaseCheck, uploadPurchasePhoto } from '../../api/purchaseCheckApi'
import './checks.css'
const SLOTS: { role: PurchasePhotoRole; label: string }[] = [
  { role: 'OVERALL', label: '全体（必須）' },
  { role: 'BASE', label: '根元（任意）' },
  { role: 'FOLIAGE', label: '葉（任意）' },
]
function PhotoInput({
  label,
  onChange,
  disabled,
}: {
  label: string
  onChange: (file: File | null) => void
  disabled: boolean
}) {
  const [preview, setPreview] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview]
  )
  return (
    <div className="checks-photo">
      <label>
        {label}
        <input
          ref={input}
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null
            setPreview(file ? URL.createObjectURL(file) : '')
            onChange(file)
          }}
        />
      </label>
      {preview && (
        <>
          <img src={preview} alt={`${label}のプレビュー`} />
          <button
            type="button"
            className="text-action"
            disabled={disabled}
            onClick={() => {
              setPreview('')
              onChange(null)
              if (input.current) input.current.value = ''
            }}
          >
            写真を外す
          </button>
        </>
      )}
    </div>
  )
}
export default function CheckNew() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<Partial<Record<PurchasePhotoRole, File>>>({})
  const [species, setSpecies] = useState('')
  const [height, setHeight] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [experience, setExperience] = useState<PurchaseExperience>('BEGINNER')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const heightInput = useRef<HTMLInputElement>(null)
  const priceInput = useRef<HTMLInputElement>(null)
  const submitted = useRef(false)
  // Retain successful uploads for retries after an AI/network failure.
  const uploaded = useRef(new Map<File, string>())
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (submitted.current) return
    setError('')
    if (!files.OVERALL) {
      setError('全体の写真を選択してください')
      return
    }
    for (const [value, minimum, input, label] of [
      [height, 1, heightInput, '樹高'],
      [price, 0, priceInput, '価格'],
    ] as const) {
      if (
        input.current?.validity.badInput ||
        (value !== '' &&
          (!Number.isInteger(Number(value)) ||
            Number(value) < minimum ||
            Number(value) > 2147483647))
      ) {
        setError(`${label}は${minimum}以上の整数で入力してください`)
        return
      }
    }
    const photos = SLOTS.filter((slot) => files[slot.role]).map((slot) => ({
      ...slot,
      file: files[slot.role]!,
    }))
    if (
      photos.some(
        ({ file }) =>
          !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
          file.size === 0 ||
          file.size > 3750000
      )
    ) {
      setError('写真は1枚3.75MB以下のJPEG・PNG・WebP・GIFを選択してください')
      return
    }
    submitted.current = true
    setBusy(true)
    try {
      const keys: string[] = []
      for (const { file } of photos) {
        let key = uploaded.current.get(file)
        if (!key) {
          key = await uploadPurchasePhoto(file)
          uploaded.current.set(file, key)
        }
        keys.push(key)
      }
      const check = await createPurchaseCheck({
        photoKeys: keys,
        photoRoles: photos.map((photo) => photo.role),
        species: species.trim() || undefined,
        heightCm: height === '' ? undefined : Number(height),
        price: price === '' ? undefined : Number(price),
        sellerNote: note.trim() || undefined,
        experience,
      })
      navigate(`/checks/${check.id}`, { replace: true })
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'チェックに失敗しました。もう一度お試しください'
      )
    } finally {
      submitted.current = false
      setBusy(false)
    }
  }
  return (
    <BonsightShell
      screen="checks"
      title="新しい購入前チェック"
      breadcrumbs={[{ label: '購入前チェック', to: '/checks' }, { label: '新規' }]}
    >
      <div className="checks-content">
        <form className="checks-form" onSubmit={submit} noValidate aria-busy={busy}>
          <fieldset disabled={busy}>
            <div className="checks-photos">
              {SLOTS.map((slot) => (
                <PhotoInput
                  key={slot.role}
                  label={slot.label}
                  disabled={busy}
                  onChange={(file) =>
                    setFiles((previous) => ({ ...previous, [slot.role]: file ?? undefined }))
                  }
                />
              ))}
            </div>
            <p className="checks-note">
              全体の写真は必須です。各写真は3.75MB以下のJPEG・PNG・WebP・GIFに対応しています。
            </p>
            <label>
              樹種（店の表記・任意）
              <input
                maxLength={200}
                value={species}
                onChange={(event) => setSpecies(event.target.value)}
              />
            </label>
            <label>
              樹高（cm・任意）
              <input
                ref={heightInput}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </label>
            <label>
              価格（円・任意）
              <input
                ref={priceInput}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </label>
            <p className="checks-note">
              価格は記録用です。AIには送信せず、割高・割安の判定は行いません。
            </p>
            <label>
              店の説明メモ（任意）
              <textarea
                rows={4}
                maxLength={4000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <label>
              育成経験
              <select
                value={experience}
                onChange={(event) => setExperience(event.target.value as PurchaseExperience)}
              >
                <option value="BEGINNER">初心者</option>
                <option value="INTERMEDIATE">中級</option>
                <option value="ADVANCED">上級</option>
              </select>
            </label>
          </fieldset>
          {error && (
            <p role="alert" className="checks-error">
              {error}
            </p>
          )}
          {busy && (
            <p role="status">写真を確認しています。AIの処理には数十秒かかることがあります。</p>
          )}
          <Button type="submit" fullWidth disabled={busy}>
            {busy ? 'チェック中…' : 'AIで購入前チェック'}
          </Button>
          {!busy && <Link to="/checks">キャンセル</Link>}
        </form>
      </div>
    </BonsightShell>
  )
}
