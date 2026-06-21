import type { UpdateUserDto, UserDto } from 'shared'
import { apiFetch } from './client'

const USE_STUB = true

export async function getMe(): Promise<UserDto> {
  // TODO: Cognito未結線
  if (USE_STUB) return {} as UserDto
  return apiFetch<UserDto>('/me')
}

export async function updateMe(dto: UpdateUserDto): Promise<UserDto> {
  if (USE_STUB) return {} as UserDto
  return apiFetch<UserDto>('/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
