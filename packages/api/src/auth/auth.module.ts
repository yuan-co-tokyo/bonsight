import { Global, Module } from '@nestjs/common';
import { CognitoAuthGuard } from './cognito-auth.guard';

@Global()
@Module({
  providers: [CognitoAuthGuard],
  exports: [CognitoAuthGuard],
})
export class AuthModule {}
