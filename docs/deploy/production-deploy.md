# Bonsight 本番デプロイ手順

## アーキテクチャ概要

- api: App Runner (NestJS, HTTPS内蔵, pause可)
- web: S3 + CloudFront (静的SPA, Vite build)
- DB: RDS PostgreSQL db.t4g.micro (単一AZ, RETAIN)
- メディア: S3 + CloudFront (BonsightMediaStack prod)
- シークレット: SSM Parameter Store SecureString
- NAT Gateway: 使用しない (VPC Connector で RDS 接続)
- リージョン: ap-northeast-1 (東京)

## コスト概算 (ap-northeast-1)

| 状態 | 月額 | 主な内訳 |
|------|------|---------|
| 稼働時 | ~$30-55/mo | App Runner ~$10-25 + RDS ~$13 + S3/CF ~$2 + Bedrock ~$5-15 |
| 停止時 | ~$5-10/mo | RDS ストレージ ~$3 + S3/CF ~$2 |

## 1. 前提条件 (殿が事前に行う作業)

- Bedrock ap-northeast-1 で jp.claude モデルへのアクセス有効化
- GitHub OIDC プロバイダ + IAM ロール作成
- SSM パラメータ手動投入 (`/bonsight/prod/DB_PASSWORD` 等)
- GitHub Secrets 登録 (`AWS_OIDC_ROLE_ARN` 等)

App Runner が参照するSSMパラメータは以下を登録する。実値はAWS上だけに置き、リポジトリへ書かない。

| SSM Parameter | Type | 用途 |
|---------------|------|------|
| `/bonsight/prod/DATABASE_URL` | SecureString | Prismaの本番DB接続文字列 |
| `/bonsight/prod/COGNITO_USER_POOL_ID` | SecureString | APIのJWT検証用CognitoユーザープールID |
| `/bonsight/prod/COGNITO_CLIENT_ID` | SecureString | APIのJWT検証用CognitoアプリクライアントID |
| `/bonsight/prod/S3_BUCKET_NAME` | SecureString or String | メディア保存用S3バケット名 |

`BEDROCK_DIAGNOSIS_MODEL_ID` と `BEDROCK_CHAT_MODEL_ID` は非機密のモデルIDだが、CDKでは deploy 前更新用プレースホルダーにしている。`cdk deploy BonsightApiStack-prod -c env=prod` の前に、App Runnerサービス環境変数またはCDKコードを実モデルIDへ更新する。例: ap-northeast-1 で利用可能な Anthropic Claude 系モデルID。

MediaStack deploy 後に `CloudFrontDomain` output として `https://<xxx>.cloudfront.net` が判明する。ApiStack は MediaStack のCloudFront URLをCDKクロススタック参照で `CLOUDFRONT_DOMAIN` へ渡すため、MediaStack後にApiStackをdeployする。既存App Runnerサービスへ後から反映する場合は、App Runnerコンソールで `CLOUDFRONT_DOMAIN` を設定するか、`cdk deploy BonsightApiStack-prod -c env=prod` を再実行する。

GitHub Actions で参照するSecretsは以下。実値や長期アクセスキーはリポジトリへ書かない。

| Secret | 用途 |
|--------|------|
| `AWS_OIDC_ROLE_ARN` | GitHub ActionsがassumeするAWS IAMロールARN |
| `AWS_REGION` | `ap-northeast-1` |
| `ECR_REPOSITORY` | apiコンテナのECRリポジトリ名 |
| `APPRUNNER_SERVICE_ARN` | api App RunnerサービスARN |
| `WEB_S3_BUCKET` | web静的ファイル配信用S3バケット名 |
| `WEB_CF_DIST_ID` | web配信用CloudFront Distribution ID |
| `VITE_API_BASE_URL` | Viteビルド時注入: `https://<AppRunnerURL>/api/v1` (CDKデプロイ後に判明) |
| `VITE_COGNITO_USER_POOL_ID` | Viteビルド時注入: CognitoユーザープールID |
| `VITE_COGNITO_CLIENT_ID` | Viteビルド時注入: Cognitoアプリクライアントid |
| `VITE_COGNITO_DOMAIN` | Viteビルド時注入: `<xxx>.auth.ap-northeast-1.amazoncognito.com` |
| `VITE_CLOUDFRONT_DOMAIN` | Viteビルド時注入: `https://<xxx>.cloudfront.net` (メディアCDN) |

> **注意**: `VITE_*` はViteがビルド時に `import.meta.env.*` としてJSバンドルへインライン化する。
> 未設定のままビルドすると `localhost:3000` がハードコードされた状態で配信され、本番APIへのリクエストが全て失敗する。

## 2. 初回デプロイ (cdk deploy は殿が実行)

```bash
cd infrastructure
npx cdk bootstrap aws://<ACCOUNT>/ap-northeast-1  # 初回のみ
npx cdk deploy BonsightDbStack -c env=prod
npx cdk deploy BonsightMediaStack -c env=prod
npx cdk deploy BonsightWebStack -c env=prod
npx cdk deploy BonsightApiStack -c env=prod
```

## 3. DB マイグレーション

```bash
pnpm --filter api prisma migrate deploy
```

本番DB接続情報はSSM Parameter Storeまたは実行環境変数から供給する。手元の`.env`や秘密値をコミットしない。

## 4. CI/CD 有効化

- `ci.yml`: PR/push 時にtypecheck、Jest、vitest、buildを自動実行。テストSKIP数は0必須。
- `deploy.yml`: GitHub Actions → workflow_dispatch → Run workflow。OIDCでAWSロールをassumeし、apiをECR + App Runner、webをS3 + CloudFrontへ反映する。

## 5. 動作確認

App Runner URL または CloudFront URL で以下を確認する。

- ログインできる
- 盆栽一覧と詳細を表示できる
- AI診断を実行できる
- 画像アップロードとCloudFront配信が動作する

## 6. 停止運用

### App Runner 停止/再開

```bash
aws apprunner pause-service --service-arn <ARN> --region ap-northeast-1
aws apprunner resume-service --service-arn <ARN> --region ap-northeast-1
```

### RDS 停止 (最大7日, 自動再起動あり)

```bash
aws rds stop-db-instance --db-instance-identifier bonsight-prod --region ap-northeast-1
# 長期停止: snapshot → delete
aws rds create-db-snapshot --db-instance-identifier bonsight-prod --db-snapshot-identifier bonsight-prod-backup-YYYYMMDD
aws rds delete-db-instance --db-instance-identifier bonsight-prod --skip-final-snapshot
```

RDSの通常停止は最大7日で自動再起動される。長期停止ではsnapshot作成後にDB instanceを削除し、復旧時はsnapshotから復元する。

## 7. Teardown

RETAIN リソース (RDS/S3/Cognito) は cdk destroy 後もデータが残る。

```bash
npx cdk destroy --all -c env=prod
# RETAIN リソースは手動削除 (必要に応じて)
```

削除前にsnapshot、S3バックアップ、Cognitoユーザーの扱いを確認する。誤削除防止のため、本番データストアはRETAINを前提に運用する。

## 8. 独自ドメイン (後から追加)

Route53 でドメイン取得 → ACM 証明書 → CloudFront/App Runner に設定する。CloudFront用ACM証明書はus-east-1、App Runner用のカスタムドメイン証明書はApp Runner側の手順に従う。

## 9. 本番 IAM 最小権限 (推奨)

CDK デプロイ時は AdministratorAccess を暫定使用。本番運用前に最小権限ポリシーへ更新推奨。

GitHub OIDCロールは対象repository、branch、environmentを信頼ポリシーで絞る。運用ロールにはECR push、App Runner deployment、S3 sync、CloudFront invalidationに必要な権限のみ付与する。
