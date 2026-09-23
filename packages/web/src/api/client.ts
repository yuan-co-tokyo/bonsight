import { fetchAuthSession, signOut } from 'aws-amplify/auth'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    if (token) return { Authorization: `Bearer ${token}` }
  } catch {
    // 未認証の場合はヘッダなしで続行
  }
  return {}
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    await signOut()
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body: unknown = await res.json()
      if (body && typeof body === 'object' && 'message' in body) {
        const message = body.message
        detail = typeof message === 'string' ? message : Array.isArray(message) ? message.filter((item): item is string => typeof item === 'string').join('、') : ''
      }
    } catch { /* JSON以外のエラーレスポンスでもHTTPステータスを表示する */ }
    const guidance = res.status === 400 ? '入力内容を確認してください。' : res.status >= 500 ? 'サーバーでエラーが発生しました。時間をおいて再度お試しください。' : ''
    throw new Error(`API error: ${res.status} ${path} ${guidance}${detail ? ` (${detail})` : ''}`.trim())
  }

  return res.json() as Promise<T>
}
