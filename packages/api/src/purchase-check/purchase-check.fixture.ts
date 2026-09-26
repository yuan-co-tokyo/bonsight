import { ASPECTS } from './purchase-check-prompt';
// Test-only sample used by service and prompt regression tests.
export const sampleResult = {
  species: { name: '五葉松', confidence: 0.8 },
  overall: {
    recommendation: 'consider',
    summary: '根元を確認して検討してください',
  },
  aspects: Object.entries(ASPECTS).map(([key, label]) => ({
    key,
    label,
    rating: 'unknown',
    comment: '写真では確認できません',
  })),
  risks: [
    {
      title: '根元',
      severity: 'medium',
      detail: '店頭でぐらつきを確認してください',
    },
  ],
  suitability: { level: 'moderate', comment: '水管理に慣れる必要があります' },
  potential: { styleDirection: '模様木', comment: '枝を整える余地があります' },
  checklist: ['鉢底の根を確認する'],
  confidence: 0.75,
  disclaimer: '参考情報であり専門家の鑑定の代わりではありません',
};
