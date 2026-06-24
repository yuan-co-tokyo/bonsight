import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './client'

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({ tokens: undefined }),
  signOut: vi.fn().mockResolvedValue(undefined),
}))

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls fetch with API base URL and JSON headers (unauthenticated)', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined } as never)

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

  it('attaches Authorization header when authenticated', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: { idToken: { toString: () => 'test-id-token' } },
    } as never)

    const payload = { ok: true }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response)

    await expect(apiFetch('/bonsai')).resolves.toEqual(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bonsai',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-id-token',
        }),
      }),
    )
  })

  it('throws on non-2xx responses', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined } as never)

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    await expect(apiFetch('/bonsai')).rejects.toThrow(
      'API error: 500 /bonsai',
    )
  })

  it('calls signOut and throws on 401 response', async () => {
    const { fetchAuthSession, signOut } = await import('aws-amplify/auth')
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined } as never)

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
    } as Response)

    await expect(apiFetch('/bonsai')).rejects.toThrow('Unauthorized')
    expect(signOut).toHaveBeenCalled()
  })
})
