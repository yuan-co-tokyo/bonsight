import { useEffect, useRef, useState } from 'react'
import Button from '../Button'
import { captureFrame } from './captureFrame'
import './capture.css'
interface Props {
  photoUrl: string
  onClose: () => void
  onCapture: (file: File) => void
  onError: (message: string) => void
}
export default function CaptureGuide({ photoUrl, onClose, onCapture, onError }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const active = useRef(false)
  const [ratio, setRatio] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [opacity, setOpacity] = useState(40)
  const [overlay, setOverlay] = useState(true)
  const [capturing, setCapturing] = useState(false)
  useEffect(() => {
    active.current = true
    let cancelled = false
    let stream: MediaStream | undefined
    const modal = dialog.current
    const player = video.current
    modal?.showModal()
    const fail = () => {
      if (!cancelled)
        onError('カメラを起動できませんでした。カメラの許可を確認するか、写真を選択してください。')
    }
    void navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 3840 }, height: { ideal: 2160 } },
        audio: false,
      })
      .then(async (result) => {
        if (cancelled) {
          result.getTracks().forEach((track) => track.stop())
          return
        }
        stream = result
        if (player) {
          player.srcObject = result
          await player.play()
        }
      })
      .catch(fail)
    return () => {
      cancelled = true
      active.current = false
      stream?.getTracks().forEach((track) => track.stop())
      if (player) player.srcObject = null
      modal?.close()
    }
  }, [onError])
  async function shoot() {
    if (!video.current || !ratio || !ready || capturing) return
    setCapturing(true)
    try {
      const file = await captureFrame(video.current, ratio)
      if (active.current) onCapture(file)
    } catch {
      if (active.current)
        onError('撮影できませんでした。もう一度撮影するか、写真を選択してください。')
    } finally {
      if (active.current) setCapturing(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="capture-guide"
      aria-label="ガイド付きで撮影"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <header>
        <h2>前回の写真に構図を合わせる</h2>
        <Button variant="secondary" onClick={onClose}>
          閉じる
        </Button>
      </header>
      <div
        className="capture-frame"
        style={
          { aspectRatio: ratio ?? 4 / 3, '--capture-ratio': ratio ?? 4 / 3 } as React.CSSProperties
        }
      >
        <video
          ref={video}
          playsInline
          muted
          autoPlay
          onLoadedData={() => setReady(true)}
          aria-label="カメラ映像"
        />
        <img
          src={photoUrl}
          alt="前回の写真"
          style={{ opacity: overlay ? opacity / 100 : 0 }}
          onLoad={(event) => {
            const img = event.currentTarget
            if (img.naturalWidth && img.naturalHeight)
              setRatio(img.naturalWidth / img.naturalHeight)
          }}
          onError={() =>
            onError('前回の写真を読み込めませんでした。写真を選択して追加してください。')
          }
        />
      </div>
      {(!ready || !ratio) && <p role="status">カメラと前回の写真を準備しています…</p>}
      <label>
        <input
          type="checkbox"
          checked={overlay}
          onChange={(event) => setOverlay(event.target.checked)}
        />
        前回の写真を重ねる
      </label>
      <label className="capture-opacity">
        前回の写真の濃さ {opacity}%
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
        />
      </label>
      <Button disabled={!ready || !ratio || capturing} onClick={() => void shoot()}>
        {capturing ? '写真を作成中…' : '撮影する'}
      </Button>
    </dialog>
  )
}
