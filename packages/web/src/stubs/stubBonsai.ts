// TODO: 後続cmdでAWS(Cognito/S3/Bedrock)結線後に実APIへ差替え
export interface BonsaiStub {
  id: string;
  name: string;
  species: string;
  imageUrl: null; // 写真未結線、PhotoPlaceholderを使用
  status: 'healthy' | 'warning' | 'unknown';
  nextCaringDue: string | null;
  potSize: string;
  originArea: string;
}
export const STUB_BONSAI_LIST: BonsaiStub[] = [
  { id: 'b1', name: '五葉松', species: 'Pinus parviflora', imageUrl: null,
    status: 'healthy', nextCaringDue: '2026-06-25', potSize: '中鉢 6号', originArea: '関東' },
  { id: 'b2', name: '真柏', species: 'Juniperus chinensis', imageUrl: null,
    status: 'warning', nextCaringDue: '2026-06-22', potSize: '小鉢 3号', originArea: '関西' },
  { id: 'b3', name: '欅', species: 'Zelkova serrata', imageUrl: null,
    status: 'unknown', nextCaringDue: null, potSize: '大鉢 8号', originArea: '東北' },
];
