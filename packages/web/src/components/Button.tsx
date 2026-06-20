import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: 14,
  },
  secondary: {
    background: '#fff',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-border-strong)',
    fontWeight: 600,
    fontSize: 14,
  },
  danger: {
    background: '#fff',
    color: '#9E3B33',
    border: '1px solid #E0B0AA',
    fontWeight: 600,
    fontSize: 14,
  },
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 46,
        borderRadius: 'var(--radius-input)',
        padding: '0 20px',
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        width: fullWidth ? '100%' : undefined,
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
