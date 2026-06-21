import { Injectable } from '@nestjs/common';

export class UpdateUserDto {
  displayName?: string;
  region?: string;
  climatezone?: string;
}

@Injectable()
export class MeService {
  getMe() {
    // TODO: Cognito未結線
    return null;
  }

  updateMe(updateUserDto: UpdateUserDto) {
    // TODO: Cognito未結線
    return updateUserDto;
  }
}
