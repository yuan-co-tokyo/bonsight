import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getMedia, type MediaDtoEx } from '../../api/mediaApi'
import { getBonsai } from '../../api/bonsaiApi'
import BonsightShell from '../../components/BonsightShell'
import Button from '../../components/Button'
import { photoDate, photoDateLabel, dateGap } from './photoDates'
import './compare.css'

function Comparison({ before, after }: { before: MediaDtoEx; after: MediaDtoEx }) {
  const [mode, setMode] = useState<'slider' | 'side'>('slider')
  const [position, setPosition] = useState(50)
  const [dimensions, setDimensions] = useState<Record<string, number>>({})
  const ratio = dimensions[after.id] ?? 4 / 3
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width)
      setPosition(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100)))
  }
  return (
    <>
      <div className="compare-actions" role="group" aria-label="比較の表示方法">
        <Button
          variant={mode === 'slider' ? 'primary' : 'secondary'}
          aria-pressed={mode === 'slider'}
          onClick={() => setMode('slider')}
        >
          スライダー表示
        </Button>
        <Button
          variant={mode === 'side' ? 'primary' : 'secondary'}
          aria-pressed={mode === 'side'}
          onClick={() => setMode('side')}
        >
          並べて表示
        </Button>
      </div>
      {mode === 'slider' ? (
        <>
          <div
            className="compare-frame"
            data-testid="compare-frame"
            style={{ aspectRatio: ratio }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              move(event)
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event)
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId)
            }}
          >
            <img
              src={after.cloudfrontUrl}
              alt="後の写真"
              draggable={false}
              onLoad={(event) => {
                const img = event.currentTarget
                if (img.naturalWidth && img.naturalHeight)
                  setDimensions((prev) => ({
                    ...prev,
                    [after.id]: img.naturalWidth / img.naturalHeight,
                  }))
              }}
            />
            <img
              src={before.cloudfrontUrl}
              alt="前の写真"
              draggable={false}
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            />
            <span className="compare-date before">前 {photoDateLabel(before)}</span>
            <span className="compare-date after">後 {photoDateLabel(after)}</span>
            <span className="compare-divider" style={{ left: `${position}%` }} aria-hidden="true">
              ↔
            </span>
          </div>
          <label className="compare-range">
            比較の境目
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
            />
          </label>
        </>
      ) : (
        <div className="compare-side" data-testid="compare-side">
          {(
            [
              ['前', before],
              ['後', after],
            ] as const
          ).map(([label, photo]) => {
            const item = photo
            return (
              <figure key={label}>
                <figcaption>
                  {label} {photoDateLabel(item)}
                </figcaption>
                <img
                  src={item.cloudfrontUrl}
                  alt={`${label}の写真`}
                  style={{ aspectRatio: ratio }}
                  onLoad={(event) => {
                    const img = event.currentTarget
                    if (item.id === after.id && img.naturalHeight)
                      setDimensions((prev) => ({
                        ...prev,
                        [after.id]: img.naturalWidth / img.naturalHeight,
                      }))
                  }}
                />
              </figure>
            )
          })}
        </div>
      )}
    </>
  )
}
export default function GrowthCompare() {
  const { id } = useParams<{ id: string }>()
  return <Content key={id} id={id ?? ''} />
}
function Content({ id }: { id: string }) {
  const [query, setQuery] = useSearchParams()
  const [photos, setPhotos] = useState<MediaDtoEx[] | null>(null)
  const [name, setName] = useState('盆栽')
  const [error, setError] = useState('')
  useEffect(() => {
    let ignore = false
    Promise.all([getBonsai(id), getMedia(id)])
      .then(([bonsai, media]) => {
        if (ignore) return
        setName(bonsai.name)
        setPhotos(
          media
            .filter((photo) => photo.type === 'PHOTO')
            .sort(
              (a, b) =>
                new Date(photoDate(a)).getTime() - new Date(photoDate(b)).getTime() ||
                a.id.localeCompare(b.id)
            )
        )
      })
      .catch((error: unknown) => {
        if (!ignore) setError(error instanceof Error ? error.message : '読み込みに失敗しました')
      })
    return () => {
      ignore = true
    }
  }, [id])
  const before = photos?.find((photo) => photo.id === query.get('before')) ?? photos?.[0]
  const after =
    photos?.find((photo) => photo.id === query.get('after')) ?? photos?.[photos.length - 1]
  useEffect(() => {
    if (!before || !after || (query.get('before') === before.id && query.get('after') === after.id))
      return
    const next = new URLSearchParams(query)
    next.set('before', before.id)
    next.set('after', after.id)
    setQuery(next, { replace: true })
  }, [before, after, query, setQuery])
  const select = (first: string, second: string) => {
    const next = new URLSearchParams(query)
    next.set('before', first)
    next.set('after', second)
    setQuery(next)
  }
  return (
    <BonsightShell
      screen="S3"
      title="成長を比べる"
      breadcrumbs={[{ label: name, to: `/bonsai/${id}` }, { label: '成長を比べる' }]}
    >
      <div className="growth-compare">
        {error ? (
          <p role="alert">{error}</p>
        ) : !photos ? (
          <p role="status">読み込み中…</p>
        ) : photos.length < 2 ? (
          <p>
            比較には写真が2枚以上必要です。<Link to={`/bonsai/${id}/photo`}>写真を追加</Link>
          </p>
        ) : (
          before &&
          after && (
            <>
              <p>撮影日の差：{dateGap(photoDate(before), photoDate(after))}</p>
              <Comparison before={before} after={after} />
              <Button variant="secondary" onClick={() => select(after.id, before.id)}>
                前後を入れ替える
              </Button>
              {(['前', '後'] as const).map((label) => (
                <fieldset className="compare-picker" key={label}>
                  <legend>{label}の写真を選択</legend>
                  <div>
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={`${label}：${photoDateLabel(photo)} ${photo.caption ?? photo.id}`}
                        aria-pressed={photo.id === (label === '前' ? before.id : after.id)}
                        onClick={() =>
                          select(
                            label === '前' ? photo.id : before.id,
                            label === '後' ? photo.id : after.id
                          )
                        }
                      >
                        <img src={photo.cloudfrontUrl} alt="" loading="lazy" />
                        <span>{photoDateLabel(photo)}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </>
          )
        )}
      </div>
    </BonsightShell>
  )
}
