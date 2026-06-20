import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import BonsightShell from './BonsightShell'

describe('BonsightShell', () => {
  it('renders children', () => {
    render(
      <MemoryRouter>
        <BonsightShell screen="S1" showTabBar activeTab="home">
          <div>テストコンテンツ</div>
        </BonsightShell>
      </MemoryRouter>
    )
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })
})
