// TODO: 後続cmdでAWS Bedrock/APIストリーミング結線後に差替え
export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}
export const STUB_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', role: 'ai', timestamp: '2026-06-21T09:00:00',
    content: 'こんにちは！五葉松「翁」についてご相談ですね。\nどのようなことでもお気軽にどうぞ。' },
];
export const STUB_CONTEXT = {
  bonsaiId: 'b1',
  bonsaiName: '五葉松「翁」',
  speciesJa: 'ゴヨウマツ',
  region: '東京',
  season: '初夏',
};
