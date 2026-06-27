import type { CreateMediaDto, MediaDto } from 'shared'
import { apiFetch } from './client'

export interface MediaDtoEx extends MediaDto {
  cloudfrontUrl: string
}

export interface PresignResult {
  presignedUrl: string
  s3Key: string
}

export async function getPresignUrl(
  bonsaiId: string,
  filename: string,
  contentType: string,
): Promise<PresignResult> {
  return apiFetch<PresignResult>('/media/presign', {
    method: 'POST',
    body: JSON.stringify({ bonsaiId, filename, contentType }),
  })
}

export async function getMedia(bonsaiId: string): Promise<MediaDtoEx[]> {
  return apiFetch<MediaDtoEx[]>(`/bonsai/${bonsaiId}/media`)
}

export async function createMedia(
  bonsaiId: string,
  dto: CreateMediaDto,
): Promise<MediaDtoEx> {
  return apiFetch<MediaDtoEx>(`/bonsai/${bonsaiId}/media`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}
