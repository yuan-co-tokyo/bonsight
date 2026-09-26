import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export function mapBedrockError(err: unknown, context: string): never {
  const name = err instanceof Error ? err.name : '';
  const message = err instanceof Error ? err.message : '';
  if (name === 'ResourceNotFoundException') {
    Logger.warn(`Bedrock ResourceNotFoundException: ${message}`, context);
    throw new ServiceUnavailableException('AI診断サービスが利用できません');
  }
  if (name === 'ThrottlingException') {
    throw new ServiceUnavailableException(
      'AI診断サービスが混雑しています。しばらく後に再試行してください',
    );
  }
  if (name === 'AccessDeniedException') {
    Logger.error(`Bedrock AccessDeniedException: ${message}`, context);
    throw new InternalServerErrorException(
      'AI診断サービスへのアクセスが拒否されました',
    );
  }
  if (name === 'ValidationException') {
    throw new BadRequestException(`AI診断リクエストが無効です: ${message}`);
  }
  throw new ServiceUnavailableException('AI診断に失敗しました');
}
