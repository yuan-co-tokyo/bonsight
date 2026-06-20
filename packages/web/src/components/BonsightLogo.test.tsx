import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BonsightLogo from './BonsightLogo'

describe('BonsightLogo', () => {
  it('renders an SVG element', () => {
    const { container } = render(<BonsightLogo />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies custom size', () => {
    const { container } = render(<BonsightLogo size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })
})
