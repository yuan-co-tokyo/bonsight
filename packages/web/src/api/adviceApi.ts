import { apiFetch } from './client'

import type { DiagnosisData } from 'shared'
export type { HealthFlag, DiagnosisData, DiagnosisComparison } from 'shared'

export interface AdviceResult {
  id: string
  bonsaiId: string
  mediaId?: string
  diagnosis: DiagnosisData
  confidence: number | null
  createdAt: string
}

export async function createAdvice(bonsaiId: string, mediaId?: string): Promise<AdviceResult> {
  return apiFetch<AdviceResult>(`/bonsai/${bonsaiId}/advice`, {
    method: 'POST',
    body: JSON.stringify({ mediaId }),
  })
}

export async function getAdvices(bonsaiId: string): Promise<AdviceResult[]> {
  return apiFetch<AdviceResult[]>(`/bonsai/${bonsaiId}/advice`)
}

export async function sendChat(bonsaiId: string, message: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/bonsai/${bonsaiId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function sendChatGeneral(message: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}
