# Bonsight 本番デプロイ手順

## 現行アーキテクチャ

- API: App Runner（NestJS、PUBLIC egress、pause可）
- Web: S3 + CloudFront（静的SPA）
- DB: Supabase Postgres Free（東京 `ap-northeast-1`、Session pooler）
- メディア: S3 + CloudFront（`BonsightMediaStack`）
- シークレット: SSM Parameter Store SecureString
- 認証: Cognito（手動作成、CDK管理外）
- AI: Amazon Bedrock（`jp.anthropic.claude-*` 推論プロファイル）
- 課金通知: Lambda + EventBridge（`BonsightBillingStack`）

App RunnerはVPCコネクタを使わず、公開EgressでSupabase、Cognito、Bedrock、S3へ接続する。
旧 `BonsightDbStack`（RDS、VPC、NAT Gateway）は撤去済みで、CDKのデプロイ対象ではない。

## コスト概算（東京・低トラフィック）

| 状態 | AWS側の目安 | 主な内訳 |
| --- | --- | --- |
| 稼働時 | ~$12–32/月 + Bedrock従量 | App Runner ~$10–25、S3/CloudFront ~$2、Supabase Freeは$0 |
| App Runner停止時 | ~$2/月 + Supabase | S3/CloudFront等。Supabase Freeは$0、Proは別途$25/月〜 |

Bedrockは入力・出力トークン数に応じた従量課金。Supabase Freeは低活動状態が継続すると停止し、Studioからの手動Resumeが必要になる。利用者データの保全や常時稼働が必要になった時点で、Supabase Proまたはバックアップ運用を検討する。

## 1. 前提条件

- Bedrockで利用モデルのアクセス・AWS Marketplace初回購読を有効化する
- GitHub OIDCプロバイダとデプロイロールを作成する
- Cognito User Pool、App Client、Hosted UIドメインを手動作成する
- SupabaseプロジェクトとPrisma専用DBロールを作成する
- SSMパラメータとGitHub Secretsを登録する
- 課金通知を使う場合はSlack Incoming Webhookを作成する

### Bedrockの初回有効化

Anthropicモデルはユースケース申請に加えてモデルごとのAWS Marketplace初回購読が必要。`aws-marketplace:Subscribe` / `ViewSubscriptions`を持つ管理者ロールで、利用するモデルを一度だけ呼び出す。App Runner実行ロールには購読権限を付与しない。

```bash
aws bedrock-runtime converse \
  --model-id jp.anthropic.claude-sonnet-4-6 \
  --messages '[{"role":"user","content":[{"text":"Reply with OK."}]}]' \
  --inference-config '{"maxTokens":8,"temperature":0}' \
  --profile bonsight-prod --region ap-northeast-1

aws bedrock-runtime converse \
  --model-id jp.anthropic.claude-haiku-4-5-20251001-v1:0 \
  --messages '[{"role":"user","content":[{"text":"Reply with OK."}]}]' \
  --inference-config '{"maxTokens":8,"temperature":0}' \
  --profile bonsight-prod --region ap-northeast-1
```

初回呼び出しが`AccessDeniedException`でも、購読処理が開始されていることがある。管理者ロールのMarketplace権限を確認し、少し待って再試行する。一度購読できれば、App Runner実行ロールは`bedrock:InvokeModel`だけでよい。

`jp.*`推論プロファイルは複数リージョンへ内部ルーティングされるため、Bedrock IAMポリシーに`aws:RequestedRegion`の単一リージョン制限を付けない。

### Cognito作成時の注意

User Pool作成時に`--username-attributes email`を指定する。これは作成後に変更できない。MFAを使う場合は、Hosted UIのセルフサインアップと両立する`OPTIONAL`を使う。

```bash
aws cognito-idp create-user-pool \
  --pool-name bonsight-prod \
  --username-attributes email \
  --auto-verified-attributes email \
  --region ap-northeast-1 --profile bonsight-prod

aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id <POOL_ID> --mfa-configuration OPTIONAL \
  --software-token-mfa-configuration Enabled=true \
  --region ap-northeast-1 --profile bonsight-prod
```

App Clientには`--allowed-o-auth-flows-user-pool-client`を明示する。`VITE_COGNITO_DOMAIN`には`https://`を付けず、ホスト名だけを設定する。

AI診断のコストを抑えるため、運用初期にセルフサインアップを止める場合は次を実行する。

```bash
aws cognito-idp update-user-pool \
  --user-pool-id <POOL_ID> \
  --admin-create-user-config AllowAdminCreateUserOnly=true \
  --auto-verified-attributes email \
  --region ap-northeast-1 --profile bonsight-prod
```

### SupabaseとSSM

Supabaseは東京リージョンで作成し、アプリ用にデフォルトの`postgres`ロールとは別のPrisma専用ロールを使う。DB接続にはDashboardの **Connect → Session pooler** から取得する接続文字列を使用する。ホスト名を手作業で組み立てない。

`DATABASE_URL`はSession mode（ポート`5432`）とし、`sslmode=require&uselibpqcompat=true`を含める。アプリ実行と`prisma migrate deploy`が同じURLを使うため、Transaction mode（ポート`6543`）を単独で指定しない。

```bash
aws ssm put-parameter \
  --name /bonsight/prod/DATABASE_URL --type SecureString --overwrite \
  --value 'postgresql://prisma.<project-ref>:<url-encoded-password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true' \
  --region ap-northeast-1 --profile bonsight-prod
```

パスワードに予約文字が含まれる場合はURLエンコードする。実際の接続文字列をシェル履歴、CIログ、リポジトリへ残さない。

App Runnerが参照するパラメータは次のとおり。

| SSM Parameter | Type | 用途 |
| --- | --- | --- |
| `/bonsight/prod/DATABASE_URL` | SecureString | Supabase Session poolerのPrisma接続文字列 |
| `/bonsight/prod/COGNITO_USER_POOL_ID` | SecureString | APIのJWT検証用User Pool ID |
| `/bonsight/prod/COGNITO_CLIENT_ID` | SecureString | APIのJWT検証用App Client ID |
| `/bonsight/prod/S3_BUCKET_NAME` | SecureStringまたはString | メディア保存先バケット名 |
| `/bonsight/prod/SLACK_BILLING_WEBHOOK_URL` | SecureString | 課金通知用（任意） |

### GitHub Secrets

| Secret | 用途 |
| --- | --- |
| `AWS_OIDC_ROLE_ARN` | GitHub ActionsがassumeするAWS IAMロールARN |
| `AWS_REGION` | `ap-northeast-1` |
| `ECR_REPOSITORY` | APIコンテナのECRリポジトリ名 |
| `APPRUNNER_SERVICE_ARN` | App RunnerサービスARN |
| `WEB_S3_BUCKET` / `WEB_CF_DIST_ID` | Web配信先のS3・CloudFront |
| `VITE_API_BASE_URL` | `https://<AppRunnerURL>/api/v1` |
| `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` | Cognito設定 |
| `VITE_COGNITO_DOMAIN` | `https://`なしのHosted UIホスト名 |
| `VITE_CLOUDFRONT_DOMAIN` | メディアCDNの`https://`付きURL |

`VITE_*`はWebのビルド時にJavaScriptへ埋め込まれる。GitHub Environmentの同名SecretはリポジトリSecretより優先されるため、`prod` Environment側も確認する。

## 2. 初回デプロイ

スタック名には`-prod`サフィックスが付く。ApiStackの前に、ECR `bonsight-api`へ`latest`タグのLinux AMD64イメージをpushする。

```bash
aws ecr get-login-password --profile bonsight-prod --region ap-northeast-1 \
  | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com
docker build --platform linux/amd64 -f packages/api/Dockerfile \
  -t <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/bonsight-api:latest .
docker push <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/bonsight-api:latest

cd infrastructure
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1 --profile bonsight-prod # 初回のみ
npx cdk deploy BonsightMediaStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightWebStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightApiStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightBillingStack-prod -c env=prod --profile bonsight-prod # 任意
```

MediaStackのCloudFront URLはCDKクロススタック参照でApiStackの`CLOUDFRONT_DOMAIN`へ渡されるため、MediaStackを先にデプロイする。

## 3. DBマイグレーション

コンテナ起動時に`npx prisma migrate deploy && node dist/src/main`が実行される。空のSupabase DBには最初の起動時にスキーマが適用される。App Runnerのapplication logで成功を確認する。

```bash
aws logs tail /aws/apprunner/bonsight-prod-api/<service-id>/application \
  --profile bonsight-prod --region ap-northeast-1 --since 10m
```

`All migrations have been successfully applied.` が出力されれば成功。ローカルから直接マイグレーションを行う必要はない。

## 4. CI/CDと動作確認

- `ci.yml`はPR/push時にtypecheck、Jest、vitest、buildを実行する。
- `deploy.yml`はworkflow_dispatchで、OIDCを用いてECR、App Runner、S3、CloudFrontへ反映する。
- APIイメージは`${{ github.sha }}`と`latest`の両方をpushする。

デプロイ後は、ログイン、盆栽一覧・詳細、画像アップロードとCloudFront配信、AI診断を確認する。

## 5. 停止・再開運用

App Runnerは必要に応じて停止・再開できる。

```bash
aws apprunner pause-service --service-arn <APP_RUNNER_ARN> --region ap-northeast-1 --profile bonsight-prod
aws apprunner resume-service --service-arn <APP_RUNNER_ARN> --region ap-northeast-1 --profile bonsight-prod
```

Supabase Freeプロジェクトが停止している場合は、App Runnerを再開する前にSupabase StudioでResumeする。RDS、VPC、NAT Gatewayは現行構成に存在しないため、停止・再開や再デプロイの対象ではない。

## 6. Teardown

AWSのCDKスタックを削除する場合は、対象を明示して実行する。S3、ECR、Cognito、SupabaseのデータはCDKの対象外または保持設定の可能性があるため、保存データと削除対象を個別に確認する。

```bash
cd infrastructure
npx cdk destroy BonsightApiStack-prod -c env=prod --profile bonsight-prod
npx cdk destroy BonsightBillingStack-prod -c env=prod --profile bonsight-prod # 任意
```

## 7. 課金通知

`BonsightBillingStack`は毎日09:00 JSTにCost Explorerの前日実績をSlackへ投稿する。WebhookをSSMへ保存後にスタックをデプロイする。

```bash
aws ssm put-parameter \
  --name /bonsight/prod/SLACK_BILLING_WEBHOOK_URL --type SecureString --overwrite \
  --value 'https://hooks.slack.com/services/xxx/yyy/zzz' \
  --region ap-northeast-1 --profile bonsight-prod

cd infrastructure
npx cdk deploy BonsightBillingStack-prod -c env=prod --profile bonsight-prod
```
