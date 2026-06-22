import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBonsai, getBonsais } from './bonsaiApi'

describe('bonsaiApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getBonsais returns BonsaiDto array from fetch', async () => {
    const bonsais = [
      {
        id: 'b1',
        owner: 'owner-1',
        visibility: 'PRIVATE',
        name: '黒松',
        species: 'クロマツ',
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
    ]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => bonsais,
    } as Response)

    await expect(getBonsais()).resolves.toEqual(bonsais)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bonsai',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('createBonsai calls POST /bonsai', async () => {
    const created = {
      id: 'b2',
      owner: 'owner-1',
      visibility: 'PRIVATE',
      name: '真柏',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => created,
    } as Response)

    await expect(createBonsai({ name: '真柏' })).resolves.toEqual(created)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bonsai',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: '真柏' }),
      }),
    )
  })
})
