# Bonsight 本番デプロイ・チェックリスト

> 実値（AWSアカウントID、ARN、パスワード、接続文字列、Webhook URL）はこのファイルやリポジトリに記載しない。AWS CLI例はすべて`--profile bonsight-prod`を使う。
>
> 現行の本番DBはSupabase Postgres（東京・Free）であり、旧`BonsightDbStack`、RDS、VPC、NAT Gatewayは撤去済み。

## Phase 0: AWSアカウントとアクセス

- [ ] IAM Identity Centerでprod専用アカウントへのアクセスを設定した
      検証観点: `aws sts get-caller-identity --profile bonsight-prod`がprodアカウントを返す。
- [ ] GitHub Actions用のOIDC IDプロバイダとIAMロールを作成した
      検証観点: 信頼ポリシーの`sub`条件が対象のrepository・branchまたはEnvironmentに限定されている。
- [ ] 長期アクセスキーを使わないことを確認した
      検証観点: ローカルではIAM Identity Centerの一時認証情報だけを使用している。

## Phase 1: 外部サービスとシークレット

### Bedrock

- [ ] Bedrock（`ap-northeast-1`）のAnthropicユースケース申請を完了した
- [ ] 管理者ロールで診断用Sonnetとチャット用Haikuを一度呼び出し、Marketplace初回購読を完了した
      検証観点: `production-deploy.md`の`converse`コマンドが成功する。App Runner実行ロールにはMarketplace購読権限を付与しない。

### Cognito

- [ ] Cognito User Pool、App Client、Hosted UIドメインを手動作成した
      検証観点: User Poolの`UsernameAttributes`に`email`が含まれる。
- [ ] MFAを使う場合は`OPTIONAL`にした
      検証観点: `aws cognito-idp get-user-pool-mfa-config`の`MfaConfiguration`が`OFF`または`OPTIONAL`。
- [ ] App ClientにOAuthフローを明示的に有効化した
      検証観点: `AllowedOAuthFlowsUserPoolClient`が`true`。
- [ ] コスト対策としてセルフサインアップの有効／無効を運用方針どおり設定した

### Supabase

- [ ] Supabaseプロジェクトを東京リージョン（`ap-northeast-1`）で作成した
- [ ] アプリ専用のPrisma DBロールを作成した（デフォルトの`postgres`ロールを使わない）
- [ ] DashboardのConnect画面からSession pooler接続文字列を取得した
      検証観点: Session mode、ポート`5432`、`sslmode=require&uselibpqcompat=true`を使用している。
- [ ] Transaction mode（ポート`6543`）を単独の`DATABASE_URL`に使っていない
      検証観点: 現行構成の`prisma migrate deploy`とアプリ実行がともに接続できる。
- [ ] Freeプランが低活動状態で停止した場合はStudioから手動Resumeが必要なことを運用者が把握している

### SSM Parameter Store

- [ ] 次のパラメータをprodアカウントへ投入した。実値はログに残さない。
  - [ ] `/bonsight/prod/DATABASE_URL`（Supabase Session pooler URL）
  - [ ] `/bonsight/prod/COGNITO_USER_POOL_ID`
  - [ ] `/bonsight/prod/COGNITO_CLIENT_ID`
  - [ ] `/bonsight/prod/S3_BUCKET_NAME`
  - [ ] `/bonsight/prod/SLACK_BILLING_WEBHOOK_URL`（課金通知を使う場合）
- [ ] `aws ssm get-parameter --name /bonsight/prod/DATABASE_URL --with-decryption --profile bonsight-prod`が値を返す

### GitHub Secrets

- [ ] `AWS_OIDC_ROLE_ARN`、`AWS_REGION`、`ECR_REPOSITORY`、`APPRUNNER_SERVICE_ARN`を登録した
- [ ] `WEB_S3_BUCKET`、`WEB_CF_DIST_ID`を登録した
- [ ] `VITE_API_BASE_URL`、Cognito関連の`VITE_*`、`VITE_CLOUDFRONT_DOMAIN`を登録した
- [ ] `VITE_COGNITO_DOMAIN`に`https://`を付けていない
- [ ] `prod` GitHub Environmentに同名Secretがある場合、その値も最新であることを確認した

## Phase 2: CDK初回デプロイ

- [ ] `cd infrastructure`を実行した
- [ ] 初回のみ次を実行した

  ```bash
  npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1 --profile bonsight-prod
  ```

- [ ] Apple Silicon環境では`--platform linux/amd64`を付けてAPIイメージをECRへpushした
      検証観点: ECRの`bonsight-api`に`latest`タグがある。
- [ ] 次の順でCDKスタックをデプロイした

  ```bash
  npx cdk deploy BonsightMediaStack-prod -c env=prod --profile bonsight-prod
  npx cdk deploy BonsightWebStack-prod -c env=prod --profile bonsight-prod
  npx cdk deploy BonsightApiStack-prod -c env=prod --profile bonsight-prod
  npx cdk deploy BonsightBillingStack-prod -c env=prod --profile bonsight-prod # 任意
  ```

      検証観点: MediaStack、WebStack、ApiStackが`CREATE_COMPLETE`または`UPDATE_COMPLETE`であり、App Runnerが`RUNNING`。
- [ ] `BonsightDbStack-prod`をデプロイ対象に含めていない
      検証観点: `npx cdk list -c env=prod`にDbStackが表示されない。

## Phase 3: DBマイグレーション

- [ ] 接続文字列や`.env`をコミットしていない
      検証観点: `git status`と`git diff`に秘密値が含まれない。
- [ ] コンテナ起動時に`prisma migrate deploy`が実行され、Supabaseの空DBへスキーマが適用された
      検証観点: App Runner application logに`All migrations have been successfully applied.`が出力される。

## Phase 4: CI/CD

- [ ] `ci.yml`でtypecheck、Jest、vitest、buildがすべて成功した
- [ ] テストのSKIPが0件であることを確認した
- [ ] `deploy.yml`をworkflow_dispatchで実行し、ECR、App Runner、S3、CloudFrontへの反映が成功した

## Phase 5: 動作確認

- [ ] Cognitoでログインできる
- [ ] 盆栽一覧と詳細を表示できる
- [ ] 画像アップロードとCloudFront配信が動作する
- [ ] AI診断を実行できる
- [ ] App Runnerを再起動してもSupabaseへ再接続できる

## Phase 6: 停止・再開

- [ ] 一時停止時はApp Runnerをpauseする

  ```bash
  aws apprunner pause-service --service-arn <APP_RUNNER_ARN> --region ap-northeast-1 --profile bonsight-prod
  ```

- [ ] 再開前に、停止中のSupabase FreeプロジェクトをStudioでResumeした
- [ ] App Runnerをresumeし、ログインとDB接続を再確認した

  ```bash
  aws apprunner resume-service --service-arn <APP_RUNNER_ARN> --region ap-northeast-1 --profile bonsight-prod
  ```

## 自己チェック

- [ ] `production-deploy.md`とSSMパラメータ名、GitHub Secrets、デプロイ順序が一致している
- [ ] `npx cdk list -c env=prod`に旧DbStackが表示されない
- [ ] 本ファイルにAWSアカウントID、ARN、接続文字列、パスワード、Webhook URLなどの実値がない
