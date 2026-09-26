import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import BonsightLogo from './BonsightLogo'

export type ScreenKey = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'checks'
interface BonsightShellProps {
  screen: ScreenKey
  children: ReactNode
  title?: string
  breadcrumbs?: { label: string; to?: string }[]
}
export default function BonsightShell({ screen, children, title, breadcrumbs }: BonsightShellProps) {
  const [open, setOpen] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  const links = [{ label: 'ホーム', to: '/home', active: screen === 'S1' }, { label: 'AI相談', to: '/s6', active: screen === 'S6' }, { label: '購入前チェック', to: '/checks', active: screen === 'checks' }, { label: '設定', to: '/s8', active: screen === 'S8' }]
  return (
    <div data-screen={screen} className="bonsight-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand-link" aria-label="bonsight" to="/home" onClick={() => setOpen(false)}><BonsightLogo size={24} /><span>bonsight</span></Link>
          <button ref={trigger} className="menu-trigger" aria-label="メニュー" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>≡</button>
        </div>
        {open && <>
          <div className="menu-overlay" onClick={() => setOpen(false)} data-testid="menu-overlay" />
          <nav id="site-menu" className="site-menu" aria-label="メインナビゲーション">
            {links.map(link => <Link key={link.to} to={link.to} aria-current={link.active || location.pathname === link.to ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <button onClick={async () => { setOpen(false); try { await signOut() } catch { setLogoutError(true) } }}>ログアウト</button>
          </nav>
        </>}
      </header>
      <main className="site-content" inert={open}>
        {logoutError && <p role="alert">ログアウトに失敗しました。もう一度お試しください。</p>}
        {breadcrumbs && <nav className="breadcrumbs" aria-label="パンくず"><Link to="/home">ホーム</Link>{breadcrumbs.map((item, index) => <span key={index}><span aria-hidden="true"> › </span>{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>}
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </div>
  )
}
