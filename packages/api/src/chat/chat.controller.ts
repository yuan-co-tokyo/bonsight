import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { ChatRequestDto, ChatService } from './chat.service';

@UseGuards(CognitoAuthGuard)
@Controller('bonsai/:bonsaiId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(
    @Param('bonsaiId') bonsaiId: string,
    @Body() dto: ChatRequestDto,
    @Req() req: any,
  ) {
    return this.chatService.chat(bonsaiId, dto, req.user.sub);
  }
}
