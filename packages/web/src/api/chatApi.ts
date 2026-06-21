import type { ChatRequestDto, ChatResponseDto } from 'shared'
import { apiFetch } from './client'

export async function sendChatMessage(
  dto: ChatRequestDto,
): Promise<ChatResponseDto> {
  // TODO: Bedrock未結線
  return apiFetch<ChatResponseDto>(`/bonsai/${dto.bonsaiId}/chat`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}
