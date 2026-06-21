// TODO: 後続cmdでAWS(Cognito/S3/Bedrock)結線後に実APIへ差替え
export interface BonsaiStub {
  id: string;
  name: string;
  species: string;
  speciesJa: string;
  imageUrl: null; // 写真未結線、PhotoPlaceholderを使用
  status: 'healthy' | 'warning' | 'unknown';
  nextCaringDue: string | null;
  potSize: string;
  originArea: string;
  treeAge: string;
  style: string;
  acquiredAt: string;
  updatedAt: string;
}
export const STUB_BONSAI_LIST: BonsaiStub[] = [
  { id: 'b1', name: '五葉松「翁」', species: 'Pinus parviflora',
    speciesJa: 'ゴヨウマツ・五葉松', imageUrl: null,
    status: 'healthy', nextCaringDue: '2026-06-25',
    treeAge: '約25年', style: '根締木', acquiredAt: '2025.5',
    potSize: '中鉢 6号', originArea: '関東',
    updatedAt: '2026-06-18' },
  { id: 'b2', name: '真柏「蒼龍」', species: 'Juniperus chinensis',
    speciesJa: 'シンパク・真柏', imageUrl: null,
    status: 'warning', nextCaringDue: '2026-06-22',
    treeAge: '約15年', style: '斜幹', acquiredAt: '2023.3',
    potSize: '小鉢 3号', originArea: '関西',
    updatedAt: '2026-06-16' },
  { id: 'b3', name: '欅「武蔵」', species: 'Zelkova serrata',
    speciesJa: 'ケヤキ・欅', imageUrl: null,
    status: 'unknown', nextCaringDue: null,
    treeAge: '約8年', style: '直幹', acquiredAt: '2022.11',
    potSize: '大鉢 8号', originArea: '東北',
    updatedAt: '2026-06-10' },
];
