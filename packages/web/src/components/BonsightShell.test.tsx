import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import BonsightShell from './BonsightShell'
vi.mock('aws-amplify/auth', () => ({ signOut: vi.fn().mockResolvedValue(undefined) }))
const renderShell = () => render(<MemoryRouter initialEntries={['/home']}><BonsightShell screen="S1" breadcrumbs={[{ label: '写真' }]}><div>テストコンテンツ</div></BonsightShell></MemoryRouter>)
describe('BonsightShell', () => {
  it('renders document content, home brand and breadcrumbs without a bottom navigation', () => {
    renderShell()
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'bonsight' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('navigation', { name: 'パンくず' })).toHaveTextContent('写真')
    expect(screen.queryByRole('navigation', { name: 'メインナビゲーション' })).not.toBeInTheDocument()
  })
  it('opens navigation with current page and closes on Escape, overlay and selection', () => {
    renderShell()
    const trigger = screen.getByRole('button', { name: 'メニュー' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('link', { name: 'ホーム' }).find(link => link.getAttribute('aria-current') === 'page')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByTestId('menu-overlay'))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('link', { name: 'AI相談' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
  it('logs out from the menu', async () => {
    const { signOut } = await import('aws-amplify/auth')
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'メニュー' }))
    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }))
    expect(signOut).toHaveBeenCalled()
  })
})
