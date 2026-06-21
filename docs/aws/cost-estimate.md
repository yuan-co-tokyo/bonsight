# Bonsight Phase1 AWS月額コスト概算（dev環境・低トラフィック想定）

## 前提条件
- ユーザー数: ~10人（開発・テスト目的）
- AI診断: 月~100回
- 写真アップロード: 月~500枚（平均2MB）
- リクエスト数: 月~5,000リクエスト

## サービス別概算

| サービス | 月額概算 | 備考 |
|---------|---------|------|
| Amazon Cognito | $0 | 月間50,000 MAUまで無料 |
| Amazon S3 | ~$0.05 | 1GB以下の場合ほぼ無料 |
| CloudFront | ~$0.01 | 1TB/月まで0.0085$/GBだが低トラフィックは無料枠内 |
| Amazon Bedrock (Sonnet 4.6) | ~$5〜$15 | 診断100回×入力1K+出力1Kトークン想定 |
| Amazon Bedrock (Opus 4.8) | ~$1〜$5 | 月10回程度の総合診断のみ |
| RDS PostgreSQL (db.t4g.micro) | ~$15 | 東京リージョン。Aurora Serverlessなら最低$0.06/ACU-hr |
| ECS Fargate (api) | ~$5〜$15 | 0.25vCPU/0.5GB、稼働時間に依存 |
| **合計（概算）** | **~$26〜$50/月** | Bedrockの使用量次第で変動 |

## コスト最適化Tips
- Bedrock: Haiku 4.5を軽い分類・Q&Aに使い、Sonnetは診断のみ
- RDS: 開発中は停止/起動を繰り返してコスト削減
- ECS: 開発中はdocker-composeをローカルで使い、Fargateは本番検証のみ
- S3: Intelligent-Tieringで自動コスト最適化
- CloudFront: 無料利用枠(1TB転送/月)内に収まる見込み

## 注意
- 上記はあくまで概算。実際の請求はAWS Cost Explorerで確認すること
- Bedrockは呼び出しトークン数に比例して変動する
- 本番環境では上記の10〜100倍規模になる見込み
