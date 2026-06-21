import type { AIAdviceDto, CreateAdviceDto } from 'shared'
import { apiFetch } from './client'

const USE_STUB = true

export async function createAdvice(
  bonsaiId: string,
  dto: CreateAdviceDto,
): Promise<AIAdviceDto> {
  // TODO: Bedrock未結線
  if (USE_STUB) return {} as AIAdviceDto
  return apiFetch<AIAdviceDto>(`/bonsai/${bonsaiId}/advice`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function getAdvices(bonsaiId: string): Promise<AIAdviceDto[]> {
  if (USE_STUB) return []
  return apiFetch<AIAdviceDto[]>(`/bonsai/${bonsaiId}/advice`)
}
