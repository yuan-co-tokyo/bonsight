import { Body, Controller, Param, Post } from '@nestjs/common';
import { ChatRequestDto, ChatService } from './chat.service';

@Controller('bonsai/:bonsaiId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(
    @Param('bonsaiId') bonsaiId: string,
    @Body() chatRequestDto: ChatRequestDto,
  ) {
    return this.chatService.chat(bonsaiId, chatRequestDto);
  }
}
