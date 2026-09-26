import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GetObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { PrismaClient, PurchaseCheck } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { BedrockService } from '../bedrock/bedrock.service';
import { CreatePurchaseCheckDto } from './create-purchase-check.dto';
import {
  buildPurchaseCheckContent,
  RECORD_PURCHASE_CHECK_TOOL,
  SYSTEM_PROMPT,
} from './purchase-check-prompt';
import { parsePurchaseCheckResult } from './purchase-check-result';

const LABELS = { OVERALL: '全体', BASE: '根元', FOLIAGE: '葉' };
function imageFormat(key: string): 'jpeg' | 'png' | 'webp' | 'gif' {
  const ext = key.split('.').pop()?.toLowerCase();
  if (ext === 'png' || ext === 'webp' || ext === 'gif') return ext;
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
  throw new BadRequestException('対応する写真形式はJPEG、PNG、WebP、GIFです');
}
function bedrockError(error: unknown): never {
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);
  if (name === 'ResourceNotFoundException') {
    Logger.warn(
      `Bedrock ResourceNotFoundException: ${message}`,
      'PurchaseCheckService',
    );
    throw new ServiceUnavailableException('AI診断サービスが利用できません');
  }
  if (name === 'ThrottlingException')
    throw new ServiceUnavailableException(
      'AI診断サービスが混雑しています。しばらく後に再試行してください',
    );
  if (name === 'AccessDeniedException') {
    Logger.error(
      `Bedrock AccessDeniedException: ${message}`,
      'PurchaseCheckService',
    );
    throw new InternalServerErrorException(
      'AI診断サービスへのアクセスが拒否されました',
    );
  }
  if (name === 'ValidationException')
    throw new BadRequestException(`AI診断リクエストが無効です: ${message}`);
  throw new ServiceUnavailableException('AI診断に失敗しました');
}

@Injectable()
export class PurchaseCheckService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
  });
  private readonly bucket = process.env.S3_BUCKET_NAME!;
  private readonly domain = (process.env.CLOUDFRONT_DOMAIN ?? '').replace(
    /\/$/,
    '',
  );
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClient,
    private readonly bedrock: BedrockService,
  ) {}

  private response(check: PurchaseCheck) {
    return {
      ...check,
      photoUrls: check.photoKeys.map(
        (key) =>
          `${this.domain}/${key.split('/').map(encodeURIComponent).join('/')}`,
      ),
    };
  }
  async create(dto: CreatePurchaseCheckDto, owner: string) {
    if (
      !Array.isArray(dto.photoKeys) ||
      dto.photoKeys.length < 1 ||
      dto.photoKeys.length > 3 ||
      new Set(dto.photoKeys).size !== dto.photoKeys.length ||
      !Array.isArray(dto.photoRoles) ||
      dto.photoRoles.length !== dto.photoKeys.length ||
      new Set(dto.photoRoles).size !== dto.photoRoles.length ||
      dto.photoRoles.filter((role) => role === 'OVERALL').length !== 1 ||
      dto.photoRoles.some((role) => !Object.hasOwn(LABELS, role))
    ) {
      throw new BadRequestException(
        '全体写真を1枚含む、重複のない1〜3枚の写真を指定してください',
      );
    }
    const prefix = `users/${owner}/purchase-checks/`;
    for (const key of dto.photoKeys) {
      if (
        typeof key !== 'string' ||
        !key.startsWith(prefix) ||
        !key.slice(prefix.length) ||
        key.slice(prefix.length).includes('/')
      )
        throw new ForbiddenException('photoKeys prefix mismatch');
      imageFormat(key);
    }
    const photos = await Promise.all(
      dto.photoKeys.map(async (key, index) => {
        try {
          const response = await this.s3.send(
            new GetObjectCommand({ Bucket: this.bucket, Key: key }),
          );
          if (!response.Body) throw new Error('Photo body missing');
          const bytes = await response.Body.transformToByteArray();
          if (bytes.length === 0 || bytes.length > 3750000)
            throw new BadRequestException('写真は1枚3.75MB以下にしてください');
          return {
            bytes,
            format: imageFormat(key),
            label: LABELS[dto.photoRoles[index]],
          };
        } catch (error) {
          if (error instanceof BadRequestException) throw error;
          throw new BadRequestException(
            '写真を取得できませんでした。再度アップロードしてください',
          );
        }
      }),
    );
    const user = await this.prisma.user.findFirst({
      where: { cognitoSub: owner },
    });
    const content = buildPurchaseCheckContent({
      photos,
      species: dto.species,
      heightCm: dto.heightCm,
      sellerNote: dto.sellerNote,
      experience: dto.experience,
      region: user?.region,
      climatezone: user?.climatezone,
      today: new Date(),
    });
    let response: Awaited<ReturnType<BedrockService['converse']>>;
    try {
      response = await this.bedrock.converse({
        system: [{ text: SYSTEM_PROMPT }],
        messages: [{ role: 'user', content }],
        toolConfig: {
          tools: [RECORD_PURCHASE_CHECK_TOOL],
          toolChoice: { tool: { name: 'record_purchase_check' } },
        },
        maxTokens: 4096,
        modelId:
          process.env.BEDROCK_DIAGNOSIS_MODEL_ID ??
          process.env.BEDROCK_MODEL_ID,
      });
    } catch (error) {
      bedrockError(error);
    }
    const output = response.output?.message?.content?.find(
      (block) => block.toolUse?.name === 'record_purchase_check',
    )?.toolUse?.input;
    const result = parsePurchaseCheckResult(output);
    const saved = await this.prisma.purchaseCheck.create({
      data: {
        owner,
        photoKeys: dto.photoKeys,
        photoRoles: dto.photoRoles,
        species: dto.species,
        heightCm: dto.heightCm,
        price: dto.price,
        sellerNote: dto.sellerNote,
        experience: dto.experience,
        result,
      },
    });
    return this.response(saved);
  }
  async list(owner: string) {
    return (
      await this.prisma.purchaseCheck.findMany({
        where: { owner },
        orderBy: { createdAt: 'desc' },
      })
    ).map((check) => this.response(check));
  }
  async get(id: string, owner: string) {
    const check = await this.prisma.purchaseCheck.findUnique({ where: { id } });
    if (!check) throw new NotFoundException('購入前チェックが見つかりません');
    if (check.owner !== owner) throw new ForbiddenException();
    return this.response(check);
  }
  async delete(id: string, owner: string) {
    const check = await this.get(id, owner);
    // Keep the record when S3 fails, allowing a safe retry rather than orphaning photos.
    const response = await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: check.photoKeys.map((Key) => ({ Key })) },
      }),
    );
    if (response.Errors?.length)
      throw new ServiceUnavailableException(
        '写真を削除できませんでした。再度お試しください',
      );
    await this.prisma.purchaseCheck.delete({ where: { id } });
    return { id };
  }
}
