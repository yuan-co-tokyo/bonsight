jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const send = jest.fn();
  return {
    BedrockRuntimeClient: jest.fn(() => ({ send })),
    ConverseCommand: jest.fn((args: unknown) => args),
    __send: send,
  };
});

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({
      Body: {
        transformToByteArray: () => Promise.resolve(new Uint8Array([1, 2, 3])),
      },
    }),
  })),
  GetObjectCommand: jest.fn((a: unknown) => a),
}));

import {
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ContentBlock } from '@aws-sdk/client-bedrock-runtime';
import { S3Client } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { AdviceService } from './advice.service';
import { BedrockService } from '../bedrock/bedrock.service';
import { PrismaService } from '../prisma/prisma.service';

const mockDiagnosis = {
  species: 'クロマツ',
  health: [{ key: 'leaves', label: '葉の状態', level: 'good' }],
  styling: '直幹仕立て',
  seasonal: '春は水やりを増やす',
  confidence: 0.85,
  disclaimer: 'これは参考情報です。専門家・樹医の診断の代替ではありません。',
};

describe('AdviceService.createAdvice', () => {
  let service: AdviceService;
  type MockQuery = jest.Mock<Promise<unknown>, [unknown]>;
  let prisma: {
    user: { findFirst: MockQuery };
    careLog: { findMany: MockQuery };
    bonsai: { findUnique: MockQuery };
    media: { findUnique: MockQuery; findFirst: MockQuery };
    aIAdvice: { findFirst: MockQuery; findMany: MockQuery; create: MockQuery };
  };
  type Request = {
    messages: { content: ContentBlock[] }[];
    maxTokens: number;
    modelId?: string;
    toolConfig: { toolChoice: unknown };
  };
  let bedrock: { converse: jest.Mock<Promise<unknown>, [Request]> };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findFirst: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ region: '東京', climatezone: '温帯' }),
      },
      careLog: {
        findMany: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue([]),
      },
      bonsai: {
        findUnique: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: 'b1',
          owner: 'sub1',
          name: 'テスト',
          coverImageKey: null,
        }),
      },
      media: {
        findUnique: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: 'm1',
          bonsaiId: 'b1',
          s3Key: 'users/sub1/bonsai/b1/photo.jpg',
        }),
        findFirst: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: 'm1',
          bonsaiId: 'b1',
          s3Key: 'users/sub1/bonsai/b1/photo.jpg',
        }),
      },
      aIAdvice: {
        findFirst: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue(null),
        create: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: 'a1',
          bonsaiId: 'b1',
          mediaId: 'm1',
          diagnosis: mockDiagnosis,
          confidence: 0.85,
        }),
        findMany: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue([]),
      },
    };

    bedrock = {
      converse: jest.fn<Promise<unknown>, [Request]>().mockResolvedValue({
        output: {
          message: {
            content: [
              {
                toolUse: {
                  name: 'record_diagnosis',
                  input: mockDiagnosis,
                },
              },
            ],
          },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdviceService,
        { provide: PrismaService, useValue: prisma },
        { provide: BedrockService, useValue: bedrock },
      ],
    }).compile();

    service = module.get<AdviceService>(AdviceService);
  });

  it('登録情報・地域・日付・手入れ記録を渡し、90日/10件の取得条件を使う', async () => {
    const now = new Date('2026-09-23T16:00:00Z');
    jest.useFakeTimers().setSystemTime(now);
    try {
      prisma.bonsai.findUnique.mockResolvedValueOnce({
        id: 'b1',
        owner: 'sub1',
        name: '翁',
        species: '五葉松',
        estimatedAge: 30,
        origin: '実生',
        potInfo: '素焼き',
        style: '直幹',
        currentState: '剪定後',
        acquiredAt: new Date('2020-01-01Z'),
      });
      prisma.media.findFirst.mockResolvedValueOnce({
        id: 'm1',
        bonsaiId: 'b1',
        s3Key: 'current.jpg',
        takenAt: new Date('2026-09-20Z'),
      });
      prisma.careLog.findMany.mockResolvedValueOnce([
        { type: 'PRUNING', date: new Date('2026-09-19Z'), memo: '枝を整理' },
      ]);
      await service.createAdvice('b1', {}, 'sub1');
      const request = bedrock.converse.mock.calls[0][0];
      const text = JSON.stringify(request.messages[0].content);
      for (const value of [
        '翁',
        '五葉松',
        '30',
        '実生',
        '素焼き',
        '直幹',
        '剪定後',
        '2020-01-01',
        '東京',
        '温帯',
        '2026-09-24',
        '2026-09-20',
        'PRUNING',
        '枝を整理',
      ])
        expect(text).toContain(value);
      expect(request.maxTokens).toBe(2048);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { cognitoSub: 'sub1' },
      });
      expect(prisma.careLog.findMany).toHaveBeenCalledWith({
        where: {
          bonsaiId: 'b1',
          date: { gte: new Date(now.getTime() - 90 * 86400000), lte: now },
        },
        orderBy: { date: 'desc' },
        take: 10,
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('異なる前回写真と診断JSONをラベル付きで追加する', async () => {
    prisma.aIAdvice.findFirst.mockResolvedValueOnce({
      mediaId: 'old',
      diagnosis: mockDiagnosis,
    });
    prisma.media.findUnique.mockResolvedValueOnce({
      id: 'old',
      bonsaiId: 'b1',
      s3Key: 'old.png',
      takenAt: new Date('2026-08-01Z'),
    });
    const comparison = { status: 'unchanged', summary: '大きな変化なし' };
    bedrock.converse.mockResolvedValueOnce({
      output: {
        message: {
          content: [{ toolUse: { input: { ...mockDiagnosis, comparison } } }],
        },
      },
    });
    await service.createAdvice('b1', {}, 'sub1');
    const content = bedrock.converse.mock.calls[0][0].messages[0].content;
    expect(content.filter((block) => block.image)).toHaveLength(2);
    expect(content[1].text).toContain('今回の写真');
    expect(content[4].text).toContain('前回診断時の写真(撮影日: 2026-08-01');
    expect(content[5].image?.format).toBe('png');
    expect(content[3].text).toContain(JSON.stringify(mockDiagnosis));
    expect(prisma.aIAdvice.findFirst).toHaveBeenCalledWith({
      where: { bonsaiId: 'b1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.aIAdvice.create.mock.calls[0][0]).toHaveProperty(
      'data.diagnosis.comparison',
      comparison,
    );
  });

  it.each([null, { mediaId: null }, { mediaId: 'm1' }])(
    '前回なし/null/同じmediaIdは比較しない: %j',
    async (previous) => {
      prisma.aIAdvice.findFirst.mockResolvedValueOnce(previous);
      await service.createAdvice('b1', {}, 'sub1');
      const content = bedrock.converse.mock.calls[0][0].messages[0].content;
      expect(content.filter((block) => block.image)).toHaveLength(1);
      expect(prisma.media.findUnique).not.toHaveBeenCalled();
      expect(content[0].text).toContain('前回情報なし');
    },
  );

  it('前回写真のS3取得に失敗したらwarnを出し比較なしで保存する', async () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    prisma.aIAdvice.findFirst.mockResolvedValueOnce({
      mediaId: 'old',
      diagnosis: mockDiagnosis,
    });
    prisma.media.findUnique.mockResolvedValueOnce({
      id: 'old',
      bonsaiId: 'b1',
      s3Key: 'old.jpg',
    });
    const client = (S3Client as jest.Mock).mock.results[0].value as {
      send: jest.Mock<Promise<unknown>, [unknown]>;
    };
    client.send
      .mockResolvedValueOnce({
        Body: {
          transformToByteArray: () => Promise.resolve(new Uint8Array([1])),
        },
      })
      .mockRejectedValueOnce(new Error('S3 unavailable'));
    try {
      await service.createAdvice('b1', {}, 'sub1');
      expect(warn).toHaveBeenCalled();
      expect(
        bedrock.converse.mock.calls[0][0].messages[0].content.filter(
          (block) => block.image,
        ),
      ).toHaveLength(1);
      expect(prisma.aIAdvice.create).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }
  });

  it.each([null, { id: 'old', bonsaiId: 'other', s3Key: 'other.jpg' }])(
    '削除済み/別盆栽の前回写真は比較しない',
    async (media) => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      prisma.aIAdvice.findFirst.mockResolvedValueOnce({
        mediaId: 'old',
        diagnosis: mockDiagnosis,
      });
      prisma.media.findUnique.mockResolvedValueOnce(media);
      try {
        await service.createAdvice('b1', {}, 'sub1');
        expect(
          bedrock.converse.mock.calls[0][0].messages[0].content.filter(
            (block) => block.image,
          ),
        ).toHaveLength(1);
        expect(warn).toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    },
  );

  it('forced tool use の toolUse.input を AIAdvice に保存する', async () => {
    const result = await service.createAdvice('b1', {}, 'sub1');

    expect(bedrock.converse).toHaveBeenCalledTimes(1);
    const converseCall = bedrock.converse.mock.calls[0][0];
    expect(converseCall.toolConfig.toolChoice).toEqual({
      tool: { name: 'record_diagnosis' },
    });

    expect(prisma.aIAdvice.create).toHaveBeenCalledWith({
      data: {
        bonsaiId: 'b1',
        mediaId: 'm1',
        diagnosis: mockDiagnosis,
        confidence: 0.85,
      },
    });
    expect(result.diagnosis).toEqual(mockDiagnosis);
    expect(result.confidence).toBe(0.85);
  });

  it('Media なし + coverImageKey あり → S3取得 → AIAdvice 保存 (mediaId=null)', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce({
      id: 'b1',
      owner: 'sub1',
      name: 'T',
      coverImageKey: 'cover/b1.jpg',
    });
    prisma.media.findFirst.mockResolvedValueOnce(null);

    await service.createAdvice('b1', {}, 'sub1');

    expect(bedrock.converse).toHaveBeenCalledTimes(1);
    expect(prisma.aIAdvice.create).toHaveBeenCalledWith({
      data: {
        bonsaiId: 'b1',
        mediaId: null,
        diagnosis: mockDiagnosis,
        confidence: 0.85,
      },
    });
  });

  it('Media なし + coverImageKey なし → BadRequestException', async () => {
    prisma.media.findFirst.mockResolvedValueOnce(null);
    // bonsai mock has coverImageKey: null (default)
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('BEDROCK_DIAGNOSIS_MODEL_ID が converse の modelId に渡る', async () => {
    const origEnv = process.env.BEDROCK_DIAGNOSIS_MODEL_ID;
    process.env.BEDROCK_DIAGNOSIS_MODEL_ID = 'test-diag-model';

    const m = await Test.createTestingModule({
      providers: [
        AdviceService,
        { provide: PrismaService, useValue: prisma },
        { provide: BedrockService, useValue: bedrock },
      ],
    }).compile();
    const svc = m.get<AdviceService>(AdviceService);

    await svc.createAdvice('b1', {}, 'sub1');

    expect(bedrock.converse.mock.calls[0][0].modelId).toBe('test-diag-model');

    process.env.BEDROCK_DIAGNOSIS_MODEL_ID = origEnv;
  });

  it('Bedrock 失敗時は ServiceUnavailableException を投げ AIAdvice を保存しない', async () => {
    const throttleErr = new Error('Too many requests');
    throttleErr.name = 'ThrottlingException';
    bedrock.converse.mockRejectedValueOnce(throttleErr);

    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(prisma.aIAdvice.create).not.toHaveBeenCalled();
  });

  it('bonsai が存在しない場合は NotFoundException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce(null);
    await expect(service.createAdvice('noexist', {}, 'sub1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('owner 不一致の場合は ForbiddenException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce({
      id: 'b1',
      owner: 'other',
    });
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('mediaId 指定で bonsaiId 不一致の場合は BadRequestException', async () => {
    prisma.media.findUnique.mockResolvedValueOnce({
      id: 'm2',
      bonsaiId: 'b2',
      s3Key: 'x',
    });
    await expect(
      service.createAdvice('b1', { mediaId: 'm2' }, 'sub1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('mediaId 指定なし・Media なし・coverImageKey なしの場合は BadRequestException', async () => {
    prisma.media.findFirst.mockResolvedValueOnce(null);
    // default bonsai mock has coverImageKey: null
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
