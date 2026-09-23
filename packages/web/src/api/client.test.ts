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
      tokens: { accessToken: { toString: () => 'test-access-token' } },
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
          Authorization: 'Bearer test-access-token',
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

  it.each([{ message: ['acquiredAt must be a valid ISO 8601 date string', 'estimatedAge must be an integer number'] }, { message: '入手日が不正です' }])('400レスポンスのメッセージを表示する', async ({ message }) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 400, json: async () => ({ message }) } as Response)
    await expect(apiFetch('/bonsai')).rejects.toThrow('入力内容を確認してください。')
    await expect(apiFetch('/bonsai')).rejects.toThrow(Array.isArray(message) ? message.join('、') : message)
  })

  it('JSONでない500レスポンスにも再試行案内を出す', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('not json') } } as unknown as Response)
    await expect(apiFetch('/bonsai')).rejects.toThrow('時間をおいて再度お試しください。')
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
