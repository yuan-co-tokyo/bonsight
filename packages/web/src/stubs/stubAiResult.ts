// TODO: 後続cmdでAWS Bedrock結線後に実AI診断へ差替え
export interface HealthFlag {
  key: 'drought' | 'rootBound' | 'sunscald' | 'pest';
  label: string;
  level: 'ok' | 'caution' | 'danger';
  note: string;
}
export interface AiResultStub {
  bonsaiId: string;
  species: string;
  confidence: number;
  health: HealthFlag[];
  styling: string;
  seasonal: string;
}
export const STUB_AI_RESULT: AiResultStub = {
  bonsaiId: 'b1',
  species: 'ゴヨウマツ・五葉松',
  confidence: 0.92,
  health: [
    { key: 'drought',   label: '水分',    level: 'ok',      note: '葉色・張りとも良好です。' },
    { key: 'rootBound', label: '根詰まり', level: 'caution', note: '植替え時期が近づいています（来春2〜3月推奨）。' },
    { key: 'sunscald',  label: '葉焼け',  level: 'ok',      note: '現状問題ありません。' },
    { key: 'pest',      label: '病害虫',  level: 'ok',      note: '異常は見られません。' },
  ],
  styling: '芽摘みで枝先を整えると樹形が引き締まります。外芽を残し内側の込み入った枝は整理しましょう。',
  seasonal: '来春2〜3月の植替えを検討してください。今夏は半日陰への移動で葉焼け予防を。',
};
