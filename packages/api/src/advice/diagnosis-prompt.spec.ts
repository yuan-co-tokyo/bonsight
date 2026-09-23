import {
  buildDiagnosisContent,
  SYSTEM_PROMPT,
  RECORD_DIAGNOSIS_TOOL,
} from './diagnosis-prompt';
import type { DiagnosisContext } from './diagnosis-prompt';

const context: DiagnosisContext = {
  bonsai: { name: '翁', species: '五葉松' },
  diagnosedAt: new Date('2026-09-23T16:00:00Z'),
  photo: { s3Key: 'photo.jpg', bytes: new Uint8Array([1]) },
  careLogs: [],
};

describe('buildDiagnosisContent', () => {
  it('JST日付と未設定地域/撮影日を出し、入力を変更しない', () => {
    const content = buildDiagnosisContent(context);
    expect(content[0].text).toContain('診断日（JST）: 2026-09-24');
    expect(content[0].text).toContain('ユーザーの地域: 不明');
    expect(content[0].text).toContain('気候帯: 不明');
    expect(content[0].text).toContain('前回情報なし');
    expect(content[1].text).toContain('今回の写真(撮影日: 不明');
    expect(content[2].image?.source?.bytes).toEqual(new Uint8Array([1]));
    expect(buildDiagnosisContent(context)).toEqual(content);
    expect(context.bonsai).toEqual({ name: '翁', species: '五葉松' });
  });

  it('未登録の項目は省略し、樹齢0は保持する', () => {
    const content = buildDiagnosisContent({
      ...context,
      bonsai: { name: '実生', species: null, estimatedAge: 0, potInfo: '' },
    });
    expect(content[0].text).toContain('"estimatedAge":0');
    expect(content[0].text).not.toContain('"species"');
    expect(content[0].text).not.toContain('"potInfo"');
  });

  it('比較時は各画像の直前に日付付きラベルを置く', () => {
    const content = buildDiagnosisContent({
      ...context,
      photo: { ...context.photo, takenAt: new Date('2026-09-22T16:00:00Z') },
      previous: {
        photo: {
          s3Key: 'old.webp',
          bytes: new Uint8Array([2]),
          takenAt: new Date('2026-08-22T16:00:00Z'),
        },
        diagnosis: { health: [] },
      },
    });
    expect(content[0].text).toContain('前回情報あり');
    expect(content[1].text).toContain('2026-09-23');
    expect(content[2].image?.format).toBe('jpeg');
    expect(content[3].text).toContain('{"health":[]}');
    expect(content[4].text).toContain('前回診断時の写真(撮影日: 2026-08-23');
    expect(content[5].image?.format).toBe('webp');
  });

  it('季節と登録樹種を尊重し比較の捏造を禁止する。比較schemaは任意', () => {
    expect(SYSTEM_PROMPT).toContain('登録樹種を前提');
    expect(SYSTEM_PROMPT).toContain('落葉・紅葉・休眠');
    expect(SYSTEM_PROMPT).toContain('植え替え・剪定');
    expect(SYSTEM_PROMPT).toContain('前回の文章から変化を捏造しない');
    const schema = RECORD_DIAGNOSIS_TOOL.toolSpec.inputSchema.json;
    expect(schema.required).not.toContain('comparison');
    expect(schema.properties.comparison.properties.status.enum).toContain(
      'not_comparable',
    );
  });
});
