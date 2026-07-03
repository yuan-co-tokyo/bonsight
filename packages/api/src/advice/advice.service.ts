import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BedrockService } from '../bedrock/bedrock.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export class CreateAdviceDto {
  @IsOptional() @IsString() mediaId?: string;
}

const DIAGNOSIS_SYSTEM_PROMPT = `あなたは盆栽の専門家として、写真から盆栽の状態を診断します。
- 写真に実際に見える特徴のみに基づいて評価してください。視認できない情報を推測で断定しないでください。
- 樹種が不確実な場合は confidence を低く(0.5未満)設定し、disclaimer にその旨を明記してください。
- これは参考情報であり、専門家・樹医の診断の代替ではありません。disclaimer に非診断の注意書きを必ず含めてください。
- 健康状態は写真から判断できる範囲に限定し、断定調を避けてヘッジ表現を使用してください。
- disclaimer は絶対に空にしてはいけません。`;

const RECORD_DIAGNOSIS_TOOL = {
  toolSpec: {
    name: 'record_diagnosis',
    description: '盆栽診断結果を構造化して記録する',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          species: { type: 'string', description: '樹種の推定(例:クロマツ、不明の場合は「不明」)' },
          health: {
            type: 'array',
            description: '健康状態フラグのリスト',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                label: { type: 'string', description: '日本語ラベル' },
                level: { type: 'string', enum: ['good', 'warning', 'danger'] },
              },
              required: ['key', 'label', 'level'],
            },
          },
          styling: { type: 'string', description: '仕立て・形の所見と提案' },
          seasonal: { type: 'string', description: '現在の季節に合わせた世話のポイント' },
          confidence: { type: 'number', description: '診断の信頼度 0.0〜1.0' },
          disclaimer: { type: 'string', description: '免責事項(必ず非診断の注意書きを含む)' },
        },
        required: ['species', 'health', 'styling', 'seasonal', 'confidence', 'disclaimer'],
      },
    },
  },
};

function getImageFormat(s3Key: string): 'jpeg' | 'png' | 'webp' | 'gif' {
  const ext = s3Key.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  if (ext === 'gif') return 'gif';
  return 'jpeg';
}

function mapBedrockError(err: any): never {
  const name = err?.name ?? '';
  if (name === 'ResourceNotFoundException') {
    Logger.warn(`Bedrock ResourceNotFoundException: ${err.message}`, 'AdviceService');
    throw new ServiceUnavailableException('AI診断サービスが利用できません');
  }
  if (name === 'ThrottlingException') {
    throw new ServiceUnavailableException('AI診断サービスが混雑しています。しばらく後に再試行してください');
  }
  if (name === 'AccessDeniedException') {
    Logger.error(`Bedrock AccessDeniedException: ${err.message}`, 'AdviceService');
    throw new InternalServerErrorException('AI診断サービスへのアクセスが拒否されました');
  }
  if (name === 'ValidationException') {
    throw new BadRequestException(`AI診断リクエストが無効です: ${err.message}`);
  }
  throw new ServiceUnavailableException('AI診断に失敗しました');
}

@Injectable()
export class AdviceService {
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-northeast-1' });
  private readonly bucket = process.env.S3_BUCKET_NAME!;
  private readonly diagnosisModelId =
    process.env.BEDROCK_DIAGNOSIS_MODEL_ID ?? process.env.BEDROCK_MODEL_ID!;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bedrock: BedrockService,
  ) {}

  private async verifyBonsaiOwner(bonsaiId: string, sub: string) {
    const bonsai = await this.prisma.bonsai.findUnique({ where: { id: bonsaiId } });
    if (!bonsai) throw new NotFoundException(`Bonsai ${bonsaiId} not found`);
    if (bonsai.owner !== sub) throw new ForbiddenException();
    return bonsai;
  }

  private async getS3Bytes(s3Key: string): Promise<Uint8Array> {
    const obj = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: s3Key }));
    return (obj.Body as any).transformToByteArray();
  }

  async createAdvice(bonsaiId: string, dto: CreateAdviceDto, sub: string) {
    const bonsai = await this.verifyBonsaiOwner(bonsaiId, sub);

    let bytes: Uint8Array;
    let format: 'jpeg' | 'png' | 'webp' | 'gif';
    let resolvedMediaId: string | null = null;

    if (dto.mediaId) {
      const media = await this.prisma.media.findUnique({ where: { id: dto.mediaId } });
      if (!media || media.bonsaiId !== bonsaiId) throw new BadRequestException('写真がありません');
      bytes = await this.getS3Bytes(media.s3Key);
      format = getImageFormat(media.s3Key);
      resolvedMediaId = media.id;
    } else {
      const latestMedia = await this.prisma.media.findFirst({
        where: { bonsaiId },
        orderBy: { takenAt: 'desc' },
      });
      if (latestMedia) {
        bytes = await this.getS3Bytes(latestMedia.s3Key);
        format = getImageFormat(latestMedia.s3Key);
        resolvedMediaId = latestMedia.id;
      } else if (bonsai.coverImageKey) {
        bytes = await this.getS3Bytes(bonsai.coverImageKey);
        format = getImageFormat(bonsai.coverImageKey);
        resolvedMediaId = null;
      } else {
        throw new BadRequestException('写真がありません');
      }
    }

    let res: any;
    try {
      res = await this.bedrock.converse({
        system: [{ text: DIAGNOSIS_SYSTEM_PROMPT }],
        messages: [{
          role: 'user',
          content: [
            { image: { format, source: { bytes } } },
            { text: 'この盆栽の写真を診断してください。' },
          ],
        }],
        toolConfig: {
          tools: [RECORD_DIAGNOSIS_TOOL],
          toolChoice: { tool: { name: 'record_diagnosis' } },
        },
        maxTokens: 1024,
        modelId: this.diagnosisModelId,
      });
    } catch (err) {
      mapBedrockError(err);
    }

    const block = res.output.message.content.find((c: any) => c.toolUse)?.toolUse;
    if (!block) throw new ServiceUnavailableException('AI診断に失敗しました');

    return this.prisma.aIAdvice.create({
      data: {
        bonsaiId,
        mediaId: resolvedMediaId,
        diagnosis: block.input,
        confidence: block.input.confidence ?? null,
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
