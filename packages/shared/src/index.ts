export type BonsaiVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

export interface BonsaiDto {
  id: string;
  owner: string;
  visibility: BonsaiVisibility;
  name: string;
  nickname?: string | null;
  species?: string | null;
  acquiredAt?: string | null;
  estimatedAge?: number | null;
  origin?: string | null;
  potInfo?: string | null;
  style?: string | null;
  currentState?: string | null;
  coverImageKey?: string | null;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonsaiDto {
  name: string;
  nickname?: string | null;
  species?: string | null;
  acquiredAt?: string | null;
  estimatedAge?: number | null;
  origin?: string | null;
  potInfo?: string | null;
  style?: string | null;
  currentState?: string | null;
  coverImageKey?: string | null;
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

export interface HealthFlag {
  key: string;
  label: string;
  level: 'good' | 'warning' | 'danger';
}

export interface DiagnosisComparison {
  status: 'improved' | 'unchanged' | 'worsened' | 'mixed' | 'not_comparable';
  summary: string;
  details?: { aspect: string; change: string; note: string }[];
}

export interface DiagnosisData {
  species: string;
  health: HealthFlag[];
  styling: string;
  seasonal: string;
  confidence: number;
  disclaimer: string;
  comparison?: DiagnosisComparison;
}

export interface AIAdviceDto {
  id: string;
  bonsaiId: string;
  mediaId?: string;
  diagnosis: DiagnosisData;
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

export type CareType =
  | 'WATERING'
  | 'FERTILIZING'
  | 'PRUNING'
  | 'WIRING'
  | 'REPOTTING'
  | 'PEST_CONTROL';

export interface CareLogDto {
  id: string;
  bonsaiId: string;
  type: CareType;
  date: string;
  memo?: string;
  createdAt: string;
}

export interface CreateCareLogDto {
  type: CareType;
  date: string;
  memo?: string;
}

export interface UpdateCareLogDto {
  type?: CareType;
  date?: string;
  memo?: string;
}
