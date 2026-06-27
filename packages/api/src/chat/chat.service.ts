import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BedrockService } from '../bedrock/bedrock.service';

export class ChatRequestDto {
  @IsString() @IsNotEmpty() message!: string;
}

function getSeason(month: number): string {
  if (month <= 2) return '冬';
  if (month <= 5) return '春';
  if (month <= 8) return '夏';
  return '秋';
}

function mapBedrockError(err: any): never {
  throw new ServiceUnavailableException('AIチャットサービスが利用できません');
}

@Injectable()
export class ChatService {
  private readonly chatModelId =
    process.env.BEDROCK_CHAT_MODEL_ID ?? process.env.BEDROCK_MODEL_ID!;

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

  async chat(bonsaiId: string, dto: ChatRequestDto, sub: string) {
    const bonsai = await this.verifyBonsaiOwner(bonsaiId, sub);

    const user = await this.prisma.user.findFirst({ where: { cognitoSub: sub } });

    const season = getSeason(new Date().getMonth());

    const systemPrompt = `あなたは盆栽の手入れに詳しい相談相手です。以下の文脈を踏まえて回答してください。
- 盆栽の名前: ${bonsai.name}
- 樹種: ${bonsai.species ?? '不明'}
- 利用者の地域: ${user?.region ?? '不明'}
- 現在の季節: ${season}
重要: あなたの回答は参考情報です。断定せず、「〜の可能性があります」等のヘッジ表現を用い、
不確実な点は正直に伝えてください。専門的・重大な問題は樹医や専門店への相談を促してください。`;

    let res: any;
    try {
      res = await this.bedrock.converse({
        system: [{ text: systemPrompt }],
        messages: [{ role: 'user', content: [{ text: dto.message }] }],
        maxTokens: 1024,
        modelId: this.chatModelId,
      });
    } catch (err) {
      mapBedrockError(err);
    }

    const text = res.output.message.content.find((c: any) => c.text)?.text ?? '';
    return { message: text };
  }
}
