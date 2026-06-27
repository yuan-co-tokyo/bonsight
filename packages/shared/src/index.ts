export type BonsaiVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

export interface BonsaiDto {
  id: string;
  owner: string;
  visibility: BonsaiVisibility;
  name: string;
  nickname?: string;
  species?: string;
  acquiredAt?: string;
  estimatedAge?: number;
  origin?: string;
  potInfo?: string;
  style?: string;
  currentState?: string;
  coverImageKey?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonsaiDto {
  name: string;
  nickname?: string;
  species?: string;
  acquiredAt?: string;
  estimatedAge?: number;
  origin?: string;
  potInfo?: string;
  style?: string;
  currentState?: string;
}

export interface UpdateBonsaiDto extends Partial<CreateBonsaiDto> {}

export type MediaType = "PHOTO" | "VIDEO";

export interface MediaDto {
  id: string;
  bonsaiId: string;
  type: MediaType;
  s3Key: string;
  caption?: string;
  takenAt?: string;
  createdAt: string;
}

export interface PresignResponseDto {
  uploadUrl: string;
  key: string;
}

export interface CreateMediaDto {
  s3Key: string;
  caption?: string;
  takenAt?: string;
  type?: MediaType;
}

export interface AIAdviceDto {
  id: string;
  bonsaiId: string;
  mediaId?: string;
  diagnosis: Record<string, unknown>;
  confidence?: number;
  createdAt: string;
}

export interface CreateAdviceDto {
  mediaId?: string;
}

export interface ChatMessageDto {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestDto {
  message: string;
  bonsaiId: string;
}

export interface ChatResponseDto {
  message: string;
}

export interface UserDto {
  id: string;
  cognitoSub: string;
  displayName: string;
  region?: string;
  climatezone?: string;
}

export interface UpdateUserDto {
  displayName?: string;
  region?: string;
  climatezone?: string;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
