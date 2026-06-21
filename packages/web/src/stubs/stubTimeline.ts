// TODO: 後続cmdでAWS(S3 presigned URL/Bedrock AI診断)結線後に実APIへ差替え
export interface TimelineEntryStub {
  id: string;
  bonsaiId: string;
  photoUrl: null; // 写真未結線
  note: string;
  takenAt: string; // ISO date
  aiDiagnosis: string | null; // AI未結線
}
export const STUB_TIMELINE: TimelineEntryStub[] = [
  { id: 't1', bonsaiId: 'b1', photoUrl: null, note: '芽摘み実施。新芽が勢いよく伸びていた。',
    takenAt: '2026-06-10', aiDiagnosis: null },
  { id: 't2', bonsaiId: 'b1', photoUrl: null, note: '水やり。葉色良好。',
    takenAt: '2026-05-28', aiDiagnosis: null },
];
