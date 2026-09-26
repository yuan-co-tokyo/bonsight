import type { CreatePurchaseCheckDto, PurchaseCheckDto, PurchaseCheckStatus } from 'shared'
import { apiFetch } from './client'

export const getPurchaseChecks = () => apiFetch<PurchaseCheckDto[]>('/purchase-checks')
export const getPurchaseCheck = (id: string) =>
  apiFetch<PurchaseCheckDto>(`/purchase-checks/${encodeURIComponent(id)}`)
export const deletePurchaseCheck = (id: string) =>
  apiFetch<{ id: string }>(`/purchase-checks/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const createPurchaseCheck = (dto: CreatePurchaseCheckDto) =>
  apiFetch<PurchaseCheckDto>('/purchase-checks', { method: 'POST', body: JSON.stringify(dto) })
export async function uploadPurchasePhoto(file: File): Promise<string> {
  const { presignedUrl, s3Key } = await apiFetch<{ presignedUrl: string; s3Key: string }>(
    '/media/presign',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'purchase',
        filename: `${crypto.randomUUID()}-${file.name.replace(/[/\\]/g, '_')}`,
        contentType: file.type,
      }),
    }
  )
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  if (!response.ok) throw new Error('写真のアップロードに失敗しました。もう一度お試しください。')
  return s3Key
}

export const updatePurchaseCheck = (
  id: string,
  status: Exclude<PurchaseCheckStatus, 'PURCHASED'>
) =>
  apiFetch<PurchaseCheckDto>(`/purchase-checks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
