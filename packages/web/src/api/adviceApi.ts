import { apiFetch } from './client'

export interface HealthFlag {
  key: string
  label: string
  level: 'good' | 'warning' | 'danger'
}

export interface DiagnosisData {
  species: string
  health: HealthFlag[]
  styling: string
  seasonal: string
  confidence: number
  disclaimer: string
}

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
