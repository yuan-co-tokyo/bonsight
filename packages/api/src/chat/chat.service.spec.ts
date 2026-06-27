jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const send = jest.fn();
  return {
    BedrockRuntimeClient: jest.fn(() => ({ send })),
    ConverseCommand: jest.fn((args) => args),
    __send: send,
  };
});

import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { BedrockService } from '../bedrock/bedrock.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService.chat', () => {
  let service: ChatService;
  let prisma: any;
  let bedrock: any;

  beforeEach(async () => {
    prisma = {
      bonsai: {
        findUnique: jest.fn().mockResolvedValue({ id: 'b1', owner: 'sub1', name: 'テスト松', species: 'クロマツ' }),
      },
      user: {
        findFirst: jest.fn().mockResolvedValue({ cognitoSub: 'sub1', region: '東京' }),
      },
    };

    bedrock = {
      converse: jest.fn().mockResolvedValue({
        output: {
          message: {
            content: [{ text: '水やりは週2回程度が目安の可能性があります。' }],
          },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prisma },
        { provide: BedrockService, useValue: bedrock },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('Bedrock.converse のテキスト応答を返す', async () => {
    const result = await service.chat('b1', { message: '水やりのコツは？' }, 'sub1');

    expect(bedrock.converse).toHaveBeenCalledTimes(1);
    const call = bedrock.converse.mock.calls[0][0];
    expect(call.system[0].text).toContain('テスト松');
    expect(call.system[0].text).toContain('クロマツ');
    expect(call.system[0].text).toContain('東京');
    expect(call.messages[0].content[0].text).toBe('水やりのコツは？');

    expect(result).toEqual({ message: '水やりは週2回程度が目安の可能性があります。' });
  });

  it('Bedrock 失敗時は ServiceUnavailableException を投げる', async () => {
    bedrock.converse.mockRejectedValueOnce(new Error('Connection error'));
    await expect(service.chat('b1', { message: 'test' }, 'sub1')).rejects.toThrow(ServiceUnavailableException);
  });

  it('bonsai が存在しない場合は NotFoundException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce(null);
    await expect(service.chat('noexist', { message: 'test' }, 'sub1')).rejects.toThrow(NotFoundException);
  });

  it('owner 不一致の場合は ForbiddenException', async () => {
    prisma.bonsai.findUnique.mockResolvedValueOnce({ id: 'b1', owner: 'other' });
    await expect(service.chat('b1', { message: 'test' }, 'sub1')).rejects.toThrow(ForbiddenException);
  });

  it('user が見つからない場合でも処理を継続する', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);
    const result = await service.chat('b1', { message: 'test' }, 'sub1');
    const call = bedrock.converse.mock.calls[0][0];
    expect(call.system[0].text).toContain('不明');
    expect(result.message).toBeTruthy();
  });

});

describe('ChatService.chatGeneral', () => {
  let service: ChatService;
  let prisma: any;
  let bedrock: any;

  beforeEach(async () => {
    prisma = {
      bonsai: {
        findUnique: jest.fn(),
      },
      user: {
        findFirst: jest.fn().mockResolvedValue({ cognitoSub: 'sub1', region: '大阪' }),
      },
    };

    bedrock = {
      converse: jest.fn().mockResolvedValue({
        output: {
          message: {
            content: [{ text: '盆栽の水やりについて参考としてお伝えします。' }],
          },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prisma },
        { provide: BedrockService, useValue: bedrock },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('Bedrock.converse のテキスト応答を返す', async () => {
    const result = await service.chatGeneral({ message: '盆栽の基本は？' }, 'sub1');

    expect(bedrock.converse).toHaveBeenCalledTimes(1);
    const call = bedrock.converse.mock.calls[0][0];
    expect(call.system[0].text).toContain('大阪');
    expect(call.messages[0].content[0].text).toBe('盆栽の基本は？');
    expect(result).toEqual({ message: '盆栽の水やりについて参考としてお伝えします。' });
  });

  it('Bedrock 失敗時は ServiceUnavailableException を投げる', async () => {
    bedrock.converse.mockRejectedValueOnce(new Error('Connection error'));
    await expect(service.chatGeneral({ message: 'test' }, 'sub1')).rejects.toThrow(ServiceUnavailableException);
  });

  it('user が見つからない場合でも処理を継続する', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);
    const result = await service.chatGeneral({ message: 'test' }, 'sub1');
    const call = bedrock.converse.mock.calls[0][0];
    expect(call.system[0].text).toContain('不明');
    expect(result.message).toBeTruthy();
  });
});

describe('ChatService — model env', () => {
  let prisma: any;
  let bedrock: any;

  beforeEach(() => {
    prisma = {
      bonsai: {
        findUnique: jest.fn().mockResolvedValue({ id: 'b1', owner: 'sub1', name: 'テスト松', species: 'クロマツ' }),
      },
      user: {
        findFirst: jest.fn().mockResolvedValue({ cognitoSub: 'sub1', region: '東京' }),
      },
    };
    bedrock = {
      converse: jest.fn().mockResolvedValue({
        output: { message: { content: [{ text: 'ok' }] } },
      }),
    };
  });

  it('BEDROCK_CHAT_MODEL_ID が converse の modelId に渡る', async () => {
    const origEnv = process.env.BEDROCK_CHAT_MODEL_ID;
    process.env.BEDROCK_CHAT_MODEL_ID = 'test-chat-model';

    const m = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prisma },
        { provide: BedrockService, useValue: bedrock },
      ],
    }).compile();
    const svc = m.get<ChatService>(ChatService);

    await svc.chat('b1', { message: 'テスト' }, 'sub1');

    expect(bedrock.converse.mock.calls[0][0].modelId).toBe('test-chat-model');

    process.env.BEDROCK_CHAT_MODEL_ID = origEnv;
  });
});
