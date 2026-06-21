import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders success tone with correct data-tone attribute', () => {
    render(<StatusBadge tone="success">問題なし</StatusBadge>)
    const badge = screen.getByText('問題なし').closest('span')
    expect(badge).toHaveAttribute('data-tone', 'success')
  })

  it('renders warning tone with correct data-tone attribute', () => {
    render(<StatusBadge tone="warning">要注意</StatusBadge>)
    const badge = screen.getByText('要注意').closest('span')
    expect(badge).toHaveAttribute('data-tone', 'warning')
  })
})
