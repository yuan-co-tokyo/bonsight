import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'neutral' | 'progress' | 'danger' | 'pending'

interface StatusBadgeProps {
  tone: Tone
  children: ReactNode
}

function ToneIcon({ tone }: { tone: Tone }) {
  if (tone === 'success') {
    return (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (tone === 'warning' || tone === 'danger') {
    return (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 4V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
      </svg>
    )
  }
  return null
}

export default function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      data-tone={tone}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: `var(--status-${tone}-bg)`,
        color: `var(--status-${tone}-text)`,
        border: `1px solid var(--status-${tone}-border)`,
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 'var(--radius-badge)',
      }}
    >
      <ToneIcon tone={tone} />
      {children}
    </span>
  )
}
