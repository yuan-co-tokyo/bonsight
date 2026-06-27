import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { ChatRequestDto, ChatService } from './chat.service';

@UseGuards(CognitoAuthGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('bonsai/:bonsaiId/chat')
  chat(
    @Param('bonsaiId') bonsaiId: string,
    @Body() dto: ChatRequestDto,
    @Req() req: any,
  ) {
    return this.chatService.chat(bonsaiId, dto, req.user.sub);
  }

  @Post('chat')
  chatGeneral(
    @Body() dto: ChatRequestDto,
    @Req() req: any,
  ) {
    return this.chatService.chatGeneral(dto, req.user.sub);
  }
}
