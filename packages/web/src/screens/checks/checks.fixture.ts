import type { PurchaseCheckDto } from 'shared'
export const sampleCheck: PurchaseCheckDto = {
  id: 'c1',
  owner: 'me',
  photoKeys: ['whole.jpg'],
  photoRoles: ['OVERALL'],
  photoUrls: ['https://example.com/whole.jpg'],
  species: '五葉松',
  heightCm: 30,
  price: 12000,
  sellerNote: '店の説明',
  experience: 'BEGINNER',
  createdAt: '2026-09-26T00:00:00Z',
  result: {
    species: { name: '五葉松', confidence: 0.9 },
    overall: { recommendation: 'consider', summary: '根元を確認して検討してください' },
    aspects: (['nebari', 'tachiagari', 'trunk', 'branches', 'foliage_health', 'pot'] as const).map(
      (key, i) => ({
        key,
        label: ['根張り', '立ち上がり', '幹・幹模様', '枝配り', '葉・健康状態', '鉢との調和'][i],
        rating: 'unknown',
        comment: '写真では不明です',
      })
    ),
    risks: [{ title: '害虫', severity: 'medium', detail: '葉裏を確認してください' }],
    suitability: { level: 'moderate', comment: '水管理に慣れる必要があります' },
    potential: { styleDirection: '模様木', comment: '枝を整える余地があります' },
    checklist: ['鉢底の根を確認する'],
    confidence: 0.8,
    disclaimer: '参考情報であり専門家の鑑定の代わりではありません',
  },
}
