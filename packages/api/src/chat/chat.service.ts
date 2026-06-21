import { Injectable } from '@nestjs/common';

export class ChatRequestDto {
  message!: string;
}

@Injectable()
export class ChatService {
  chat(bonsaiId: string, chatRequestDto: ChatRequestDto) {
    // TODO: Bedrock未結線
    return { bonsaiId, message: chatRequestDto.message };
  }
}
