import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './client'

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls fetch with API base URL and JSON headers', async () => {
    const payload = { ok: true }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response)

    await expect(apiFetch('/bonsai')).resolves.toEqual(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bonsai',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('throws on non-2xx responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    await expect(apiFetch('/bonsai')).rejects.toThrow(
      'API error: 500 /bonsai',
    )
  })
})
