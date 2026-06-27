jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const send = jest.fn();
  return {
    BedrockRuntimeClient: jest.fn(() => ({ send })),
    ConverseCommand: jest.fn((args) => args),
    __send: send,
  };
});

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({
      Body: { transformToByteArray: () => Promise.resolve(new Uint8Array([1, 2, 3])) },
    }),
  })),
  GetObjectCommand: jest.fn((a) => a),
}));

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
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
  let prisma: any;
  let bedrock: any;

  beforeEach(async () => {
    prisma = {
      bonsai: {
        findUnique: jest.fn().mockResolvedValue({ id: 'b1', owner: 'sub1', name: 'テスト', coverImageKey: null }),
      },
      media: {
        findUnique: jest.fn().mockResolvedValue({ id: 'm1', bonsaiId: 'b1', s3Key: 'users/sub1/bonsai/b1/photo.jpg' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'm1', bonsaiId: 'b1', s3Key: 'users/sub1/bonsai/b1/photo.jpg' }),
      },
      aIAdvice: {
        create: jest.fn().mockResolvedValue({ id: 'a1', bonsaiId: 'b1', mediaId: 'm1', diagnosis: mockDiagnosis, confidence: 0.85 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    bedrock = {
      converse: jest.fn().mockResolvedValue({
        output: {
          message: {
            content: [{
              toolUse: {
                name: 'record_diagnosis',
                input: mockDiagnosis,
              },
            }],
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

  it('forced tool use の toolUse.input を AIAdvice に保存する', async () => {
    const result = await service.createAdvice('b1', {}, 'sub1');

    expect(bedrock.converse).toHaveBeenCalledTimes(1);
    const converseCall = bedrock.converse.mock.calls[0][0];
    expect(converseCall.toolConfig.toolChoice).toEqual({ tool: { name: 'record_diagnosis' } });

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
    prisma.bonsai.findUnique.mockResolvedValueOnce({ id: 'b1', owner: 'sub1', name: 'T', coverImageKey: 'cover/b1.jpg' });
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
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(BadRequestException);
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

    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(ServiceUnavailableException);
    expect(prisma.aIAdvice.create).not.toHaveBeenCalled();
  });

  it('bonsai が存在しない場合は NotFoundException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce(null);
    await expect(service.createAdvice('noexist', {}, 'sub1')).rejects.toThrow(NotFoundException);
  });

  it('owner 不一致の場合は ForbiddenException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce({ id: 'b1', owner: 'other' });
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(ForbiddenException);
  });

  it('mediaId 指定で bonsaiId 不一致の場合は BadRequestException', async () => {
    prisma.media.findUnique.mockResolvedValueOnce({ id: 'm2', bonsaiId: 'b2', s3Key: 'x' });
    await expect(service.createAdvice('b1', { mediaId: 'm2' }, 'sub1')).rejects.toThrow(BadRequestException);
  });

  it('mediaId 指定なし・Media なし・coverImageKey なしの場合は BadRequestException', async () => {
    prisma.media.findFirst.mockResolvedValueOnce(null);
    // default bonsai mock has coverImageKey: null
    await expect(service.createAdvice('b1', {}, 'sub1')).rejects.toThrow(BadRequestException);
  });
});
