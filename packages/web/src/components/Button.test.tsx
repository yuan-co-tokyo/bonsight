import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('fires click handler for primary variant', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button variant="primary" onClick={onClick}>登録</Button>)
    await user.click(screen.getByText('登録'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
