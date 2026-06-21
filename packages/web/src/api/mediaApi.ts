import type { CreateMediaDto, MediaDto, PresignResponseDto } from 'shared'
import { apiFetch } from './client'

const USE_STUB = true

export async function getMedia(bonsaiId: string): Promise<MediaDto[]> {
  if (USE_STUB) return []
  return apiFetch<MediaDto[]>(`/bonsai/${bonsaiId}/media`)
}

export async function presignUpload(): Promise<PresignResponseDto> {
  // TODO: S3未結線
  return apiFetch<PresignResponseDto>('/media/presign', { method: 'POST' })
}

export async function createMedia(
  bonsaiId: string,
  dto: CreateMediaDto,
): Promise<MediaDto> {
  if (USE_STUB) return {} as MediaDto
  return apiFetch<MediaDto>(`/bonsai/${bonsaiId}/media`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}
