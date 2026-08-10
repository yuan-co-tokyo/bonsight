# Bonsight AWS 運用コスト最適化

> 状態: **Plan A（脱VPC + Supabase）を2026-08-08に適用済み。**
>
> 旧`BonsightDbStack-prod`、RDS PostgreSQL、VPC、NAT Gateway、NAT用Elastic IPは削除済み。既存RDSのデータは、事前承認どおり移行せず破棄した。

関連資料: [`production-deploy.md`](../deploy/production-deploy.md) / [`production-deploy-checklist.md`](../deploy/production-deploy-checklist.md) / [`cost-estimate.md`](./cost-estimate.md)

## 現行構成

```
[ユーザー]
   │
   ├─ Web: S3 + CloudFront
   ├─ Media: S3 + CloudFront
   └─ API: App Runner（PUBLIC egress）── Supabase Postgres（東京、Session pooler）

認証: Cognito
AI: Bedrock（jp.anthropic.claude-*）
課金通知: Lambda + EventBridge
```

App RunnerはVPCコネクタを使用しないため、Cognito JWKS、Bedrock、S3、Supabaseへの通信にNAT Gatewayは不要である。CDKアプリにも`BonsightDbStack`は存在しない。

## 実施結果

| 項目 | 結果 |
| --- | --- |
| DB | Supabase Postgres Free（東京 `ap-northeast-1`）へ切替 |
| 接続方式 | Supavisor Session pooler（IPv4、ポート5432） |
| DB接続文字列 | SSM `/bonsight/prod/DATABASE_URL`へSecureStringで登録 |
| TLS | `sslmode=require&uselibpqcompat=true` |
| APIネットワーク | App Runnerを`DEFAULT` PUBLIC egressへ変更 |
| 旧AWS DB基盤 | DbStack、RDS、VPC、NAT Gateway、Elastic IPを削除 |
| 動作確認 | Cognitoログイン、データ取得、AI診断の成功を確認 |

## コスト効果

旧構成では、低トラフィックでもNAT GatewayとRDSが固定費の大半を占めていた。特にNAT Gatewayは停止できず、App RunnerやRDSを止めても料金が継続する問題があった。

| 状態 | 旧構成 | 現行構成（Supabase Free） |
| --- | --- | --- |
| API稼働時 | NAT + RDS + App Runner + 従量課金 | App Runner + S3/CloudFront + Bedrock従量課金 |
| API停止時 | NATの固定費が残る | S3/CloudFront等の小額のみ |
| DB | RDS常時起動 | Supabase Freeは$0、停止時は手動Resume |
| AWS側の目安 | ~$65–100/月 | ~$12–32/月 + Bedrock従量 |

料金はリージョン、データ転送、Bedrockトークン、App Runner利用量で変動する。実際の請求はCost Explorerと日次課金通知で確認する。

## Supabase運用方針

### 接続設定

アプリの`DATABASE_URL`は、Supabase DashboardのConnect画面から取得したSession pooler接続文字列を使用する。

```text
postgresql://prisma.<project-ref>:<url-encoded-password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true
```

- Prisma専用のDBロールを使い、デフォルトの`postgres`ロールをアプリから使わない。
- `prisma migrate deploy`とPrisma Clientは同じ`DATABASE_URL`を使用するため、Session mode（5432）を使う。
- Transaction mode（6543）へ移す場合は、マイグレーション用の直接接続またはSession modeのURLを別途用意する。
- 接続文字列はSSM SecureStringだけに保管し、リポジトリ、CIログ、チャットに記載しない。

### Freeプランの注意

Supabase Freeは低活動状態が継続するとプロジェクトを停止する。リクエストだけでは復帰せず、Supabase Studioで手動Resumeが必要になる。

利用者データを継続的に保全する段階では、次のいずれかを実施する。

- Supabase Proへ移行する。
- 定期バックアップと復元手順を整備する。
- 停止・Resumeを含む運用当番と通知を定める。

## 停止・再開手順

短期間利用しない場合は、App Runnerをpauseする。

```bash
aws apprunner pause-service \
  --service-arn <APP_RUNNER_ARN> \
  --region ap-northeast-1 --profile bonsight-prod
```

再開時は、Supabase Freeが停止していれば先にStudioでResumeしてからApp Runnerをresumeする。

```bash
aws apprunner resume-service \
  --service-arn <APP_RUNNER_ARN> \
  --region ap-northeast-1 --profile bonsight-prod
```

再開後はログイン、一覧表示、画像アップロード、AI診断を確認する。

## 将来の選択肢

| 選択肢 | 向く状況 | 主なトレードオフ |
| --- | --- | --- |
| Supabase Freeを継続 | 開発・低頻度利用 | 手動Resumeとバックアップ制約 |
| Supabase Pro | 常時稼働、バックアップ、可用性が必要 | 月額固定費が増える |
| APIをLambda化 | アイドルコストをさらに下げたい | NestJSの実行方式変更とコールドスタート |
| AWS内DBへ回帰 | 契約・データ統制上AWS内完結が必須 | VPC、接続、固定費を再設計する必要 |

AWS内DBへ回帰する場合でも、旧DbStackを復元する前にネットワーク費用、バックアップ、固定送信元IP、AWSサービス到達性を含めて再設計・再見積もりする。

## 削除済み旧構成の記録

旧RDSデータを破棄してよいことを確認した後、削除保護を解除し、CloudFormation経由で`BonsightDbStack-prod`を削除した。削除後にRDS、NAT Gateway、VPC、Elastic IP、DbStackが存在しないことと、App Runnerが`RUNNING`かつPUBLIC egressであることを確認済み。

旧DbStackはCDKコードからも削除済みであるため、以後の`cdk deploy`でRDS、VPC、NAT Gatewayが再作成されることはない。
