const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  // TODO: Cognitoトークンを Authorization ヘッダに付与（cmd_019以降）
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`)
  }

  return res.json() as Promise<T>
}
