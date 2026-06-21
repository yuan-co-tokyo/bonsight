import type { BonsaiDto, CreateBonsaiDto, UpdateBonsaiDto } from 'shared'
import { apiFetch } from './client'

const USE_STUB = true // TODO: 実API接続後は false に変更

export async function getBonsais(): Promise<BonsaiDto[]> {
  if (USE_STUB) return []
  return apiFetch<BonsaiDto[]>('/bonsai')
}

export async function getBonsai(id: string): Promise<BonsaiDto> {
  if (USE_STUB) return {} as BonsaiDto
  return apiFetch<BonsaiDto>(`/bonsai/${id}`)
}

export async function createBonsai(dto: CreateBonsaiDto): Promise<BonsaiDto> {
  if (USE_STUB) return {} as BonsaiDto
  return apiFetch<BonsaiDto>('/bonsai', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateBonsai(
  id: string,
  dto: UpdateBonsaiDto,
): Promise<BonsaiDto> {
  if (USE_STUB) return {} as BonsaiDto
  return apiFetch<BonsaiDto>(`/bonsai/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
