// TODO: 後続cmdでAWS Cognito/API結線後に実認証へ差替え
export interface UserStub {
  sub: string;
  displayName: string;
  email: string;
  region: string;
  climatZone: string;
}
export const STUB_USER: UserStub = {
  sub: 'stub-user-001',
  displayName: '田中 翔',
  email: 'takashi@example.com',
  region: '東京',
  climatZone: '温暖',
};
