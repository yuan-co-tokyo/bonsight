import { Module } from '@nestjs/common';
import { AdviceModule } from './advice/advice.module';
import { BonsaiModule } from './bonsai/bonsai.module';
import { ChatModule } from './chat/chat.module';
import { MeModule } from './me/me.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [BonsaiModule, MediaModule, AdviceModule, ChatModule, MeModule],
})
export class AppModule {}
