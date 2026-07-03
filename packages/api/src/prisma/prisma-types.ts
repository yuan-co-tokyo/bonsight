// dist 実行時と ts 実行時でパスが異なるため __dirname で出し分ける。
// generated/prisma は gitignore のため dist には含まれない。
const generatedPath = __dirname.includes('/dist/')
  ? '../../../generated/prisma/client.js'
  : '../../generated/prisma/client.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require(generatedPath);

export const CareType: typeof generated.CareType = generated.CareType;
export type CareType = (typeof generated.CareType)[keyof typeof generated.CareType];
