# Bonsight 月額コスト概算（Prod・低トラフィック想定）

## 前提条件

- ユーザー数: 約10人
- AI診断: 月約100回
- 写真アップロード: 月約500枚（平均2MB）
- リクエスト数: 月約5,000件
- DB: Supabase Postgres Free（東京 `ap-northeast-1`）
- API: App Runner（0.25 vCPU / 0.5 GB、PUBLIC egress）

## サービス別概算

| サービス | 月額概算 | 備考 |
| --- | --- | --- |
| Amazon Cognito | $0 | 月間50,000 MAUまで無料枠 |
| Amazon S3 | ~$0.05 | 小容量・低頻度アクセス想定 |
| CloudFront | ~$0.01 | 低トラフィックは無料枠内を想定 |
| Amazon Bedrock | ~$5–15 | 診断回数・トークン量により大きく変動 |
| App Runner（API） | ~$10–25 | 稼働時間とリクエスト量に依存 |
| Supabase Postgres Free | $0 | 低活動状態が続くと停止し、Studioから手動Resumeが必要 |
| 課金通知（Lambda / EventBridge / SSM） | ほぼ$0 | 低頻度実行 |
| **合計（Supabase Free）** | **~$15–40/月** | BedrockとApp Runnerの利用量次第 |

Supabase Proを使う場合は、上記に月$25程度からのSupabase料金が加わる。

## App Runnerを停止した場合

APIを使わない期間にApp Runnerをpauseすると、AWS側は主にS3・CloudFrontなどの約$2/月程度まで下がる見込み。Bedrockを呼び出さなければ同サービスの課金も発生しない。Supabase Freeは$0、Proはプラン料金が残る。

## コスト最適化のポイント

- Bedrockは軽い処理にHaiku、診断にSonnetを使い分け、出力トークン上限を設定する。
- セルフサインアップを有効にする前に、ユーザー単位のAI診断レート制限とAWS Budgets通知を整備する。
- 使用しない期間はApp Runnerをpauseし、再開前にSupabase Freeプロジェクトが停止していないか確認する。
- S3ライフサイクルルールやIntelligent-Tieringを利用し、画像の保管コストを抑える。
- Cost Explorerまたは日次Slack通知で、Bedrock・App Runner・データ転送の増加を確認する。

## 注意

- この概算は料金改定や実際の利用量により変動する。請求はCost Explorerで確認する。
- Bedrockはトークン数に比例して増えるため、最も大きい変動要因になり得る。
- 旧RDS、VPC、NAT Gatewayは撤去済みであり、現行コストには含めない。
