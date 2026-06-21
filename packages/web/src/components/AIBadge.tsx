interface AIBadgeProps {
  children: React.ReactNode
}

export default function AIBadge({ children }: AIBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'var(--color-ai-light)',
        color: 'var(--color-ai)',
        border: '1px solid var(--color-ai-border)',
        fontSize: '10.5px',
        fontWeight: 600,
        padding: '2px 9px',
        borderRadius: 'var(--radius-badge)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="var(--color-ai)"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
      </svg>
      {children}
    </span>
  )
}
