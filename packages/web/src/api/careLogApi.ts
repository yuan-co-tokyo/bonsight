import type { CareLogDto, CreateCareLogDto, UpdateCareLogDto } from 'shared'
import { apiFetch } from './client'

export const getCareLogsApi = (bonsaiId: string) =>
  apiFetch<CareLogDto[]>(`/bonsai/${bonsaiId}/care-logs`)

export const createCareLogApi = (bonsaiId: string, dto: CreateCareLogDto) =>
  apiFetch<CareLogDto>(`/bonsai/${bonsaiId}/care-logs`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })

export const updateCareLogApi = (bonsaiId: string, id: string, dto: UpdateCareLogDto) =>
  apiFetch<CareLogDto>(`/bonsai/${bonsaiId}/care-logs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })

export const deleteCareLogApi = (bonsaiId: string, id: string) =>
  apiFetch<void>(`/bonsai/${bonsaiId}/care-logs/${id}`, { method: 'DELETE' })
