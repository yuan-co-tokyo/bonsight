import { Module } from '@nestjs/common';
import { AdviceModule } from './advice/advice.module';
import { AuthModule } from './auth/auth.module';
import { BedrockModule } from './bedrock/bedrock.module';
import { BonsaiModule } from './bonsai/bonsai.module';
import { CareLogModule } from './care-log/care-log.module';
import { ChatModule } from './chat/chat.module';
import { MeModule } from './me/me.module';
import { MediaModule } from './media/media.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BedrockModule,
    BonsaiModule,
    CareLogModule,
    MediaModule,
    AdviceModule,
    ChatModule,
    MeModule,
  ],
})
export class AppModule {}
