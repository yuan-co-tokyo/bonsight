import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AIBadge from './AIBadge'

describe('AIBadge', () => {
  it('renders children', () => {
    render(<AIBadge>AI診断</AIBadge>)
    expect(screen.getByText('AI診断')).toBeInTheDocument()
  })
})
