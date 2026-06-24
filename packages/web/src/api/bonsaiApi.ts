import type { BonsaiDto, CreateBonsaiDto, UpdateBonsaiDto } from 'shared'
import { apiFetch } from './client'

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
