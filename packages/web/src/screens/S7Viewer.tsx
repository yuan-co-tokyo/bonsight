import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { STUB_TIMELINE } from '../stubs/stubTimeline'

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

export default function S7Viewer() {
  const { mediaId } = useParams<{ mediaId: string }>()
  const navigate = useNavigate()
  const entries = STUB_TIMELINE

  const initialIndex = mediaId ? entries.findIndex(e => e.id === mediaId) : -1
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)

  const currentEntry = entries[currentIndex]

  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1) }
  const goNext = () => { if (currentIndex < entries.length - 1) setCurrentIndex(i => i + 1) }

  if (!currentEntry) {
    return (
      <div style={{ background: '#1A1A17', color: '#EDEBE6', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>写真が見つかりません</p>
      </div>
    )
  }

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
          {currentIndex + 1} / {entries.length}
        </span>
        <button
          style={{
            width: 40, height: 40, borderRadius: 20,
            background: 'rgba(0,0,0,0.4)', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="共有"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBE6" strokeWidth="2.5">
            <path d="M12 3v13M5 10l7-7 7 7"/><path d="M5 20h14"/>
          </svg>
        </button>
      </div>

      {/* メイン写真エリア */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* 暗背景プレースホルダー */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, #2A2A24 0px 9px, #1E1E1B 9px 18px)',
          display: 'flex', alignItems: 'flex-end',
          padding: '0 0 12px 12px',
        }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#444' }}>
            {currentEntry.note}
          </span>
        </div>
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
        {currentIndex < entries.length - 1 && (
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
          {formatDateJa(currentEntry.takenAt)}
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#EDEBE6', margin: '0 0 14px' }}>
          {currentEntry.note}
        </p>
        <button
          onClick={() => navigate(`/bonsai/${currentEntry.bonsaiId}/ai`)}
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
    </div>
  )
}
