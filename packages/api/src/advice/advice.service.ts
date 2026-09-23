import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PrismaClient, Prisma } from '../../generated/prisma';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BedrockService } from '../bedrock/bedrock.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import {
  SYSTEM_PROMPT,
  RECORD_DIAGNOSIS_TOOL,
  buildDiagnosisContent,
} from './diagnosis-prompt';
import type { DiagnosisContext } from './diagnosis-prompt';

export class CreateAdviceDto {
  @IsOptional() @IsString() mediaId?: string;
}

function mapBedrockError(err: unknown): never {
  const name = err instanceof Error ? err.name : '';
  const message = err instanceof Error ? err.message : '';
  if (name === 'ResourceNotFoundException') {
    Logger.warn(
      `Bedrock ResourceNotFoundException: ${message}`,
      'AdviceService',
    );
    throw new ServiceUnavailableException('AI診断サービスが利用できません');
  }
  if (name === 'ThrottlingException') {
    throw new ServiceUnavailableException(
      'AI診断サービスが混雑しています。しばらく後に再試行してください',
    );
  }
  if (name === 'AccessDeniedException') {
    Logger.error(`Bedrock AccessDeniedException: ${message}`, 'AdviceService');
    throw new InternalServerErrorException(
      'AI診断サービスへのアクセスが拒否されました',
    );
  }
  if (name === 'ValidationException') {
    throw new BadRequestException(`AI診断リクエストが無効です: ${message}`);
  }
  throw new ServiceUnavailableException('AI診断に失敗しました');
}

@Injectable()
export class AdviceService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
  });
  private readonly bucket = process.env.S3_BUCKET_NAME!;
  private readonly diagnosisModelId =
    process.env.BEDROCK_DIAGNOSIS_MODEL_ID ?? process.env.BEDROCK_MODEL_ID!;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClient,
    private readonly bedrock: BedrockService,
  ) {}

  private async verifyBonsaiOwner(bonsaiId: string, sub: string) {
    const bonsai = await this.prisma.bonsai.findUnique({
      where: { id: bonsaiId },
    });
    if (!bonsai) throw new NotFoundException(`Bonsai ${bonsaiId} not found`);
    if (bonsai.owner !== sub) throw new ForbiddenException();
    return bonsai;
  }

  private async getS3Bytes(s3Key: string): Promise<Uint8Array> {
    const obj = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: s3Key }),
    );
    if (!obj.Body) throw new Error('Photo body missing');
    return obj.Body.transformToByteArray();
  }

  async createAdvice(bonsaiId: string, dto: CreateAdviceDto, sub: string) {
    const bonsai = await this.verifyBonsaiOwner(bonsaiId, sub);

    let bytes: Uint8Array;
    let s3Key: string;
    let takenAt: Date | null = null;
    let resolvedMediaId: string | null = null;

    if (dto.mediaId) {
      const media = await this.prisma.media.findUnique({
        where: { id: dto.mediaId },
      });
      if (!media || media.bonsaiId !== bonsaiId)
        throw new BadRequestException('写真がありません');
      bytes = await this.getS3Bytes(media.s3Key);
      s3Key = media.s3Key;
      takenAt = media.takenAt;
      resolvedMediaId = media.id;
    } else {
      const latestMedia = await this.prisma.media.findFirst({
        where: { bonsaiId },
        orderBy: { takenAt: 'desc' },
      });
      if (latestMedia) {
        bytes = await this.getS3Bytes(latestMedia.s3Key);
        s3Key = latestMedia.s3Key;
        takenAt = latestMedia.takenAt;
        resolvedMediaId = latestMedia.id;
      } else if (bonsai.coverImageKey) {
        bytes = await this.getS3Bytes(bonsai.coverImageKey);
        s3Key = bonsai.coverImageKey;
        resolvedMediaId = null;
      } else {
        throw new BadRequestException('写真がありません');
      }
    }

    const diagnosedAt = new Date();
    const since = new Date(diagnosedAt.getTime() - 90 * 24 * 60 * 60 * 1000);
    const [user, careLogs, latestAdvice] = await Promise.all([
      this.prisma.user.findFirst({ where: { cognitoSub: sub } }),
      this.prisma.careLog.findMany({
        where: { bonsaiId, date: { gte: since, lte: diagnosedAt } },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      this.prisma.aIAdvice.findFirst({
        where: {
          bonsaiId,
          mediaId: {
            not: null,
            ...(resolvedMediaId ? { notIn: [resolvedMediaId] } : {}),
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    let previous: DiagnosisContext['previous'];
    if (latestAdvice?.mediaId && latestAdvice.mediaId !== resolvedMediaId) {
      try {
        const previousMedia = await this.prisma.media.findUnique({
          where: { id: latestAdvice.mediaId },
        });
        if (!previousMedia || previousMedia.bonsaiId !== bonsaiId)
          throw new Error('Previous photo unavailable');
        if (
          !takenAt ||
          !previousMedia.takenAt ||
          previousMedia.takenAt <= takenAt
        ) {
          const previousBytes = await this.getS3Bytes(previousMedia.s3Key);
          previous = {
            photo: {
              s3Key: previousMedia.s3Key,
              bytes: previousBytes,
              takenAt: previousMedia.takenAt,
            },
            diagnosis: latestAdvice.diagnosis,
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Logger.warn(
          `Previous diagnosis photo unavailable (mediaId=${latestAdvice.mediaId}): ${message}; continuing without comparison`,
          'AdviceService',
        );
      }
    }
    const content = buildDiagnosisContent({
      bonsai: {
        name: bonsai.name,
        species: bonsai.species,
        estimatedAge: bonsai.estimatedAge,
        origin: bonsai.origin,
        potInfo: bonsai.potInfo,
        style: bonsai.style,
        currentState: bonsai.currentState,
        acquiredAt: bonsai.acquiredAt,
      },
      user,
      careLogs,
      diagnosedAt,
      photo: { s3Key, bytes, takenAt },
      previous,
    });

    let res: Awaited<ReturnType<BedrockService['converse']>>;
    try {
      res = await this.bedrock.converse({
        system: [{ text: SYSTEM_PROMPT }],
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        toolConfig: {
          tools: [RECORD_DIAGNOSIS_TOOL],
          toolChoice: { tool: { name: 'record_diagnosis' } },
        },
        maxTokens: 2048,
        modelId: this.diagnosisModelId,
      });
    } catch (err) {
      mapBedrockError(err);
    }

    const block = res.output?.message?.content?.find((c) => c.toolUse)?.toolUse;
    if (
      !block?.input ||
      typeof block.input !== 'object' ||
      Array.isArray(block.input)
    ) {
      throw new ServiceUnavailableException('AI診断に失敗しました');
    }
    const diagnosis = block.input as Prisma.InputJsonObject;

    return this.prisma.aIAdvice.create({
      data: {
        bonsaiId,
        mediaId: resolvedMediaId,
        diagnosis,
        confidence:
          typeof diagnosis.confidence === 'number'
            ? diagnosis.confidence
            : null,
      },
    });
  }

  async getAdvices(bonsaiId: string, sub: string) {
    await this.verifyBonsaiOwner(bonsaiId, sub);
    return this.prisma.aIAdvice.findMany({
      where: { bonsaiId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
