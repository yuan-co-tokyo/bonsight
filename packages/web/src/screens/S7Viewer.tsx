import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MediaDtoEx } from '../api/mediaApi'
import { deleteMedia } from '../api/mediaApi'

function formatDateJa(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function SparkleIconDark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#D9A94E" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

interface S7State {
  mediaList: MediaDtoEx[]
  initialIndex: number
}

export default function S7Viewer() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as S7State | null

  const mediaList: MediaDtoEx[] = state?.mediaList ?? []
  const [currentIndex, setCurrentIndex] = useState(state?.initialIndex ?? 0)
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false)

  const currentMedia = mediaList[currentIndex]

  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1) }
  const goNext = () => { if (currentIndex < mediaList.length - 1) setCurrentIndex(i => i + 1) }

  const handleDeletePhoto = async () => {
    if (!currentMedia) return
    setShowDeletePhotoDialog(false)
    await deleteMedia(currentMedia.bonsaiId, currentMedia.id)
    navigate(`/bonsai/${currentMedia.bonsaiId}`, { replace: true })
  }

  if (!currentMedia) {
    return (
      <div style={{ background: '#1A1A17', color: '#EDEBE6', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>写真が見つかりません</p>
      </div>
    )
  }

  const dateLabel = currentMedia.takenAt
    ? formatDateJa(currentMedia.takenAt)
    : formatDateJa(currentMedia.createdAt)

  return (
    <div
      className="s7-viewer"
      style={{
        background: '#1A1A17', color: '#EDEBE6',
        height: '100dvh',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* トップバー */}
      <div
        className="s7-topbar"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '56px 16px 16px',
          background: 'linear-gradient(rgba(0,0,0,.5), transparent)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 40, height: 40, borderRadius: 20,
            background: 'rgba(0,0,0,0.4)', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="閉じる"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBE6" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#EDEBE6' }}>
          {currentIndex + 1} / {mediaList.length}
        </span>
        <button
          onClick={() => setShowDeletePhotoDialog(true)}
          style={{
            width: 40, height: 40, borderRadius: 20,
            background: 'rgba(0,0,0,0.4)', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="写真を削除"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>

      {/* メイン写真エリア */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={currentMedia.cloudfrontUrl}
          alt={dateLabel}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            aria-label="前の写真"
            style={{
              position: 'absolute', left: 12,
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(0,0,0,0.4)', border: 'none',
              cursor: 'pointer',
              zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBE6" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        {currentIndex < mediaList.length - 1 && (
          <button
            onClick={goNext}
            aria-label="次の写真"
            style={{
              position: 'absolute', right: 12,
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(0,0,0,0.4)', border: 'none',
              cursor: 'pointer',
              zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBE6" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* 下部オーバーレイ */}
      <div
        className="s7-overlay"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '32px 20px 40px',
          background: 'linear-gradient(transparent, rgba(0,0,0,.6))',
          zIndex: 5,
        }}
      >
        <p style={{ fontSize: 11.5, color: 'rgba(237,235,230,.55)', margin: '0 0 6px' }}>
          {dateLabel}
        </p>
        {currentMedia.caption && (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#EDEBE6', margin: '0 0 14px' }}>
            {currentMedia.caption}
          </p>
        )}
        <button
          onClick={() => navigate(`/bonsai/${currentMedia.bonsaiId}/ai`, { state: { mediaId: currentMedia.id } })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(237,235,230,.12)',
            border: '1px solid rgba(237,235,230,.25)',
            color: '#EDEBE6', borderRadius: 999,
            padding: '8px 16px', fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          <SparkleIconDark />
          この写真をAIに診てもらう
        </button>
      </div>

      {/* 写真削除確認ダイアログ */}
      {showDeletePhotoDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#2A2A27',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 id="delete-photo-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#EDEBE6' }}>
              この写真を削除しますか？
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(237,235,230,.65)', lineHeight: 1.6 }}>
              診断データも削除されます。
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowDeletePhotoDialog(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: '1px solid rgba(237,235,230,.3)',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                  color: 'rgba(237,235,230,.65)',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => void handleDeletePhoto()}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: '#C0392B',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
