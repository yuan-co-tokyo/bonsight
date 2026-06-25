import { Module } from '@nestjs/common';
import { AdviceModule } from './advice/advice.module';
import { AuthModule } from './auth/auth.module';
import { BonsaiModule } from './bonsai/bonsai.module';
import { ChatModule } from './chat/chat.module';
import { MeModule } from './me/me.module';
import { MediaModule } from './media/media.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BonsaiModule,
    MediaModule,
    AdviceModule,
    ChatModule,
    MeModule,
  ],
})
export class AppModule {}
