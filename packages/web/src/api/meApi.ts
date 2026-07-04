import type { UpdateUserDto, UserDto } from 'shared'
import { apiFetch } from './client'

export async function getMe(): Promise<UserDto> {
  return apiFetch<UserDto>('/me')
}

export async function updateMe(dto: UpdateUserDto): Promise<UserDto> {
  return apiFetch<UserDto>('/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
