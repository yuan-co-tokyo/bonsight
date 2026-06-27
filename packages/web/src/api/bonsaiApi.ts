import type { BonsaiDto, CreateBonsaiDto, UpdateBonsaiDto } from 'shared'
import { apiFetch } from './client'

export interface CoverPresignResult {
  presignedUrl: string
  s3Key: string
}

export async function getCoverPresignUrl(
  filename: string,
  contentType: string,
): Promise<CoverPresignResult> {
  return apiFetch<CoverPresignResult>('/media/presign', {
    method: 'POST',
    body: JSON.stringify({ type: 'cover', filename, contentType }),
  })
}

export async function getBonsais(): Promise<BonsaiDto[]> {
  return apiFetch<BonsaiDto[]>('/bonsai')
}

export async function getBonsai(id: string): Promise<BonsaiDto> {
  return apiFetch<BonsaiDto>(`/bonsai/${id}`)
}

export async function createBonsai(dto: CreateBonsaiDto): Promise<BonsaiDto> {
  return apiFetch<BonsaiDto>('/bonsai', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateBonsai(
  id: string,
  dto: UpdateBonsaiDto,
): Promise<BonsaiDto> {
  return apiFetch<BonsaiDto>(`/bonsai/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
