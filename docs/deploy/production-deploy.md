# Bonsight 本番デプロイ手順

## アーキテクチャ概要

- api: App Runner (NestJS, HTTPS内蔵, pause可)
- web: S3 + CloudFront (静的SPA, Vite build)
- DB: RDS PostgreSQL db.t4g.micro (単一AZ, RETAIN)
- メディア: S3 + CloudFront (BonsightMediaStack prod)
- シークレット: SSM Parameter Store SecureString
- NAT Gateway: **使用する**（VPCコネクタをプライベートサブネットに配置し、Cognito JWKS取得・Bedrock APIなどインターネット経由のAWS公開エンドポイントへ到達させるために必須。RDSアクセス自体はVPC内で完結するがNATが無いとJWT検証・AI診断が動かない）
- 課金通知: Lambda + EventBridge（毎日09:00 JSTにCost Explorerの前日実績をSlackへ投稿。BonsightBillingStack）
- リージョン: ap-northeast-1 (東京)。ただしBedrockの`jp.*`推論プロファイルは内部でap-northeast-1/ap-northeast-3等へ自動ルーティングする

## コスト概算 (ap-northeast-1)

| 状態 | 月額 | 主な内訳 |
|------|------|---------|
| 稼働時 | ~$65-100/mo | App Runner ~$10-25 + RDS ~$13 + NAT Gateway ~$32-45 + S3/CF ~$2 + Bedrock ~$5-15 |
| 停止時 | ~$40-55/mo | RDS ストレージ ~$3 + NAT Gateway ~$32-45（停止不可、削除以外に止める方法なし）+ S3/CF ~$2 |

NAT GatewayはApp Runner/RDSのように一時停止できず、削除するかしないかの二択。長期間使わない場合は`cdk destroy`でNAT関連リソースごと削除し、再開時に`cdk deploy`で作り直す（§6参照）。

## 1. 前提条件 (殿が事前に行う作業)

- Bedrock ap-northeast-1 で `jp.anthropic.claude-*` 系推論プロファイルへのアクセス有効化
- GitHub OIDC プロバイダ + IAM ロール作成（信頼ポリシーは対象repository・environmentで絞る。§9参照）
- Cognito User Pool / App Client / Hosted UIドメインを作成（**手動、CDK管理外**。下記の必須オプションに注意）
- SSM パラメータ手動投入
- GitHub Secrets 登録
- Slack Incoming Webhook作成（課金通知を使う場合。§10参照）

### Cognito User Pool 作成時の必須オプション（要注意・ハマりどころ）

User Poolは`aws cognito-idp create-user-pool`で作成するが、以下2点を**作成時に**指定し忘れると詰む（`UsernameAttributes`は作成後に変更不可のためUser Pool再作成が必要になる）。

```bash
aws cognito-idp create-user-pool \
  --pool-name bonsight-prod \
  --region ap-northeast-1 \
  --profile bonsight-prod \
  --username-attributes email \
  --auto-verified-attributes email
```

- `--username-attributes email` を忘れると、サインアップ時にemail属性が正しく設定されず、確認コード送信先が無い状態になり `An error was encountered with the requested page` という汎用エラーでサインアップが失敗する。
- MFAを`ON`（必須）にすると、Cognito Hosted UIの**セルフサインアップ時にTOTP設定画面を出す導線が無く**、同様の汎用エラーになる。MFAを使う場合は`OPTIONAL`にする。

```bash
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id <POOL_ID> \
  --mfa-configuration OPTIONAL \
  --software-token-mfa-configuration Enabled=true \
  --region ap-northeast-1 --profile bonsight-prod
```

App Client作成時は`--allowed-o-auth-flows-user-pool-client`を**明示的に付与**しないと、`AllowedOAuthFlows`を指定していても実際にはOAuthフローが無効なまま（`AllowedOAuthFlowsUserPoolClient: false`）になり、ログイン時に `Client is not enabled for OAuth2.0 flows.` エラーになる。

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <POOL_ID> \
  --client-name bonsight-web-prod \
  --no-generate-secret \
  --allowed-o-auth-flows code \
  --allowed-o-auth-flows-user-pool-client \
  --allowed-o-auth-scopes openid email profile \
  --callback-urls '["https://<web-cloudfront-domain>/"]' \
  --logout-urls '["https://<web-cloudfront-domain>/"]' \
  --supported-identity-providers COGNITO \
  --region ap-northeast-1 --profile bonsight-prod
```

callback/logout URLはWebStackデプロイ後に判明する実CloudFront URLに後で`update-user-pool-client`で更新する（Phase順序上、Cognito作成→WebStackデプロイの順になるため）。

`VITE_COGNITO_DOMAIN`は**スキーム(`https://`)を含めない**こと。Amplifyの`Auth.Cognito.loginWith.oauth.domain`はホスト名のみを期待するため、`https://`を付けると内部で`https://https://...`という不正なURLが組み立てられ`DNS_PROBE_FINISHED_NXDOMAIN`になる。

```
# 誤: https://bonsight-prod.auth.ap-northeast-1.amazoncognito.com
# 正: bonsight-prod.auth.ap-northeast-1.amazoncognito.com
```

### セルフサインアップの制限（コスト事故防止）

不特定多数がサインアップしてAI診断（Bedrock呼び出し）を乱用すると想定外のコストが発生するため、
運用初期は**Hosted UIからの自己登録を無効化**している。

```bash
aws cognito-idp update-user-pool \
  --profile bonsight-prod --region ap-northeast-1 \
  --user-pool-id <POOL_ID> \
  --admin-create-user-config AllowAdminCreateUserOnly=true \
  --auto-verified-attributes email
```

無効化後は、Hosted UIの「Sign up」から登録しようとすると `Signup is not allowed.` エラーになる
（想定通りの挙動）。既存ユーザーのログインには影響しない。

新しい利用者を招待したい場合は、`admin-create-user`で手動発行する（実行後、本人へ仮パスワードが自動送信される）。

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <POOL_ID> \
  --username <招待したい人のメールアドレス> \
  --user-attributes Name=email,Value=<同じメールアドレス> Name=email_verified,Value=true \
  --region ap-northeast-1 --profile bonsight-prod
```

複数人での利用を前提にする場合は、この制限を解除した上で、AI診断のレート制限（1ユーザー1日N回等）や
AWS Budgetsのハード上限アラートなど別途コスト対策を検討すること。

App Runner が参照するSSMパラメータは以下を登録する。実値はAWS上だけに置き、リポジトリへ書かない。

| SSM Parameter | Type | 用途 |
|---------------|------|------|
| `/bonsight/prod/DATABASE_URL` | SecureString | Prismaの本番DB接続文字列。RDSパラメータグループが`rds.force_ssl=1`の場合、接続文字列に`?schema=public&sslmode=no-verify`を付与しないと接続できない |
| `/bonsight/prod/COGNITO_USER_POOL_ID` | SecureString | APIのJWT検証用CognitoユーザープールID |
| `/bonsight/prod/COGNITO_CLIENT_ID` | SecureString | APIのJWT検証用CognitoアプリクライアントID |
| `/bonsight/prod/S3_BUCKET_NAME` | SecureString or String | メディア保存用S3バケット名（MediaStackデプロイ後に判明） |
| `/bonsight/prod/SLACK_BILLING_WEBHOOK_URL` | SecureString | 課金通知Lambda用Slack Incoming Webhook URL（§10） |

`BEDROCK_DIAGNOSIS_MODEL_ID` と `BEDROCK_CHAT_MODEL_ID` は非機密のモデルIDだが、CDKでは deploy 前更新用プレースホルダーにしている。`cdk deploy BonsightApiStack-prod -c env=prod` の前に、`infrastructure/lib/bonsight-api-stack.ts`内の実モデルIDへ更新する。ap-northeast-1で利用可能な`jp.anthropic.claude-*`推論プロファイルIDを`aws bedrock list-inference-profiles --region ap-northeast-1`で確認して使う。

**Bedrock呼び出しのIAMポリシーにリージョン制限を付けない**こと。`jp.*`推論プロファイルは内部でap-northeast-1だけでなくap-northeast-3等にもルーティングされるため、`aws:RequestedRegion`条件で単一リージョンに絞ると`AccessDeniedException`になる。

MediaStack deploy 後に `CloudFrontDomain` output として `https://<xxx>.cloudfront.net` が判明する。ApiStack は MediaStack のCloudFront URLをCDKクロススタック参照で `CLOUDFRONT_DOMAIN` へ渡すため、MediaStack後にApiStackをdeployする。

メディアバケット（`BonsightMediaStack`）のS3 CORS設定は、`allowedOrigins`に**本番Web CloudFrontドメイン**を含めること（`infrastructure/lib/bonsight-media-stack.ts`）。localhostのみのままだと、画像アップロード（presigned URL経由のPUT）がブラウザのCORSプリフライトでブロックされる。

GitHub Actions で参照するSecretsは以下。実値や長期アクセスキーはリポジトリへ書かない。

| Secret | 用途 |
|--------|------|
| `AWS_OIDC_ROLE_ARN` | GitHub ActionsがassumeするAWS IAMロールARN。**リポジトリレベルとGitHub Environmentレベルの両方に同名シークレットを置ける仕様なので注意**（後述） |
| `AWS_REGION` | `ap-northeast-1` |
| `ECR_REPOSITORY` | apiコンテナのECRリポジトリ名 |
| `APPRUNNER_SERVICE_ARN` | api App RunnerサービスARN（Phase 2デプロイ後に判明） |
| `WEB_S3_BUCKET` | web静的ファイル配信用S3バケット名（Phase 2デプロイ後に判明） |
| `WEB_CF_DIST_ID` | web配信用CloudFront Distribution ID（Phase 2デプロイ後に判明） |
| `VITE_API_BASE_URL` | Viteビルド時注入: `https://<AppRunnerURL>/api/v1` (CDKデプロイ後に判明) |
| `VITE_COGNITO_USER_POOL_ID` | Viteビルド時注入: CognitoユーザープールID |
| `VITE_COGNITO_CLIENT_ID` | Viteビルド時注入: Cognitoアプリクライアントid |
| `VITE_COGNITO_DOMAIN` | Viteビルド時注入: `<xxx>.auth.ap-northeast-1.amazoncognito.com`（**`https://`を付けない**） |
| `VITE_CLOUDFRONT_DOMAIN` | Viteビルド時注入: `https://<xxx>.cloudfront.net` (メディアCDN) |

> **注意**: `VITE_*` はViteがビルド時に `import.meta.env.*` としてJSバンドルへインライン化する。
> 未設定のままビルドすると `localhost:3000` がハードコードされた状態で配信され、本番APIへのリクエストが全て失敗する。

> **GitHub Environment secretsの罠**: `deploy.yml`は`environment: ${{ inputs.env }}`を指定しているため、リポジトリSettings → Environments → `prod` に**環境スコープの同名シークレット**が存在すると、そちらがリポジトリレベルのシークレットより優先される。`gh secret set NAME --body VALUE`だけではリポジトリレベルしか更新されないため、環境スコープ側に古い値が残っていると気づかずハマる。`gh api repos/<owner>/<repo>/environments/prod/secrets`で確認し、必要なら`gh secret set NAME --env prod --body VALUE`で環境スコープ側も更新する。

## 2. 初回デプロイ (cdk deploy は殿が実行)

**スタック名には`-prod`サフィックスが付く**（`bin/infrastructure.ts`で`BonsightXxxStack-${appEnv}`と命名されているため。以下は誤って`-prod`を付けずに実行すると「スタックが見つからない」エラーになる）。

```bash
cd infrastructure
npx cdk bootstrap aws://<ACCOUNT>/ap-northeast-1 --profile bonsight-prod  # 初回のみ
npx cdk deploy BonsightDbStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightMediaStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightWebStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightApiStack-prod -c env=prod --profile bonsight-prod
```

ApiStackの初回デプロイ前に、ECRリポジトリ`bonsight-api`へ`:latest`タグ付きのDockerイメージを手動でbuild & pushしておくこと（App Runnerサービスは`:latest`タグを参照するため、イメージが無いと`Your service failed to create`で失敗する）。

```bash
aws ecr get-login-password --profile bonsight-prod --region ap-northeast-1 \
  | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com
# Apple Silicon Macでビルドする場合は必ず --platform linux/amd64 を付ける
# (App RunnerはARM64イメージに対応していないため、無指定だとexec formatエラーで
#  コンテナが即クラッシュし、application logすら出ない状態になる)
docker build --platform linux/amd64 -f packages/api/Dockerfile \
  -t <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com/bonsight-api:latest .
docker push <ACCOUNT>.dkr.ecr.ap-northeast-1.amazonaws.com/bonsight-api:latest
```

CDKのECRリポジトリ定義は`removalPolicy: RETAIN`のため、ApiStackのデプロイが（別の原因で）失敗してロールバックすると、ECRリポジトリだけが取り残されて次回デプロイが「リポジトリが既に存在する」エラーになることがある。`infrastructure/lib/bonsight-api-stack.ts`では新規作成ではなく`ecr.Repository.fromRepositoryName(...)`で既存リポジトリをインポートする方式にして回避している。

## 3. DB マイグレーション

**手動実行ではなく、コンテナ起動時に自動実行される**（`packages/api/Dockerfile`のCMDで`npx prisma migrate deploy && node dist/src/main`を実行）。RDSは非公開サブネットにあり`publiclyAccessible: false`のため、ローカルから直接`prisma migrate deploy`を実行する経路が無いことに起因する設計。

デプロイ後、App Runnerのapplication logに以下が出ていればマイグレーション成功。

```bash
aws logs tail /aws/apprunner/bonsight-prod-api/<service-id>/application --profile bonsight-prod --region ap-northeast-1 --since 10m
# "All migrations have been successfully applied." が出ていればOK
```

pnpm workspaceのnode_modules構造は、非hoist（シンボリックリンク分離）のままだとpackages/api固有の依存（dotenv等）が最終イメージのルートnode_modulesに来ず`Cannot find module 'dotenv/config'`でクラッシュする。Dockerfileの`pnpm install`に`--shamefully-hoist`を付けて回避している。

## 4. CI/CD 有効化

- `ci.yml`: PR/push 時にtypecheck、Jest、vitest、buildを自動実行。テストSKIP数は0必須。
- `deploy.yml`: GitHub Actions → workflow_dispatch → Run workflow。OIDCでAWSロールをassumeし、apiをECR + App Runner、webをS3 + CloudFrontへ反映する。ビルドしたイメージには`${{ github.sha }}`と`latest`の両方のタグを付けてpushすること（`latest`のみ更新しないと、App Runnerが常に古いイメージを参照し続け新しいコードが反映されない）。

## 5. 動作確認

App Runner URL または CloudFront URL で以下を確認する。

- ログインできる（新規登録→確認コード入力→ログイン、の一連の流れ）
- 盆栽一覧と詳細を表示できる
- 画像アップロードとCloudFront配信が動作する
- AI診断を実行できる

## 6. 停止運用

### App Runner 停止/再開

```bash
aws apprunner pause-service --service-arn <ARN> --region ap-northeast-1 --profile bonsight-prod
aws apprunner resume-service --service-arn <ARN> --region ap-northeast-1 --profile bonsight-prod
```

### RDS 停止 (最大7日, 自動再起動あり)

DBインスタンス識別子はCDKが自動生成するため`bonsight-prod`のような固定名ではない。`aws rds describe-db-instances`で確認する。

```bash
aws rds describe-db-instances --profile bonsight-prod --region ap-northeast-1 \
  --query 'DBInstances[0].DBInstanceIdentifier' --output text

aws rds stop-db-instance --db-instance-identifier <実際の識別子> --region ap-northeast-1 --profile bonsight-prod
# 長期停止: snapshot → delete
aws rds create-db-snapshot --db-instance-identifier <実際の識別子> --db-snapshot-identifier bonsight-prod-backup-YYYYMMDD --profile bonsight-prod
aws rds delete-db-instance --db-instance-identifier <実際の識別子> --skip-final-snapshot --profile bonsight-prod
```

RDSの通常停止は最大7日で自動再起動される。長期停止ではsnapshot作成後にDB instanceを削除し、復旧時はsnapshotから復元する。

### NAT Gateway（停止不可・削除のみ）

App Runner/RDSと違い一時停止機能が無く、起動している限り課金され続ける（月$32-45程度）。長期間（数週間以上）使わないことが確実な場合のみ、`BonsightDbStack`のNAT Gateway関連リソースを削除する選択肢がある。ただし削除するとログイン（Cognito JWKS取得）・AI診断（Bedrock呼び出し）が動かなくなり、復旧には`cdk deploy`（NAT Gateway再作成は数分かかる）が必要になる。数日程度の一時停止であれば、App Runner/RDSの停止だけで十分。

## 7. Teardown

RETAIN リソース (RDS/S3/Cognito/ECR) は cdk destroy 後もデータが残る。

```bash
npx cdk destroy --all -c env=prod --profile bonsight-prod
# RETAIN リソースは手動削除 (必要に応じて)
```

削除前にsnapshot、S3バックアップ、Cognitoユーザーの扱いを確認する。誤削除防止のため、本番データストアはRETAINを前提に運用する。

## 8. 独自ドメイン (後から追加)

Route53 でドメイン取得 → ACM 証明書 → CloudFront/App Runner に設定する。CloudFront用ACM証明書はus-east-1、App Runner用のカスタムドメイン証明書はApp Runner側の手順に従う。

ドメインを追加・変更した場合、以下も合わせて更新すること（忘れるとログイン・CORSが壊れる）。

- Cognito App Clientのcallback/logout URL（`aws cognito-idp update-user-pool-client`）
- `packages/web/src/amplifyConfig.ts`の`redirectSignIn`/`redirectSignOut`は`window.location.origin`を使っているため、ドメイン変更時のコード修正は不要（自動追従する）
- `infrastructure/lib/bonsight-media-stack.ts`のS3 CORS `allowedOrigins`
- `VITE_API_BASE_URL`等GitHub Secrets（独自ドメインをWeb側に使う場合）

## 9. 本番 IAM 最小権限 (推奨)

CDK デプロイ時は AdministratorAccess を暫定使用。本番運用前に最小権限ポリシーへ更新推奨。

GitHub OIDCロールは対象repository、branch、environmentを信頼ポリシーで絞る。運用ロールにはECR push、App Runner deployment、S3 sync、CloudFront invalidationに必要な権限のみ付与する。App Runnerサービス名は`bonsight-<env>-api`という命名規則（Phase 2デプロイ後に確定）なので、IAMポリシーの`apprunner:StartDeployment`リソースARNはこの実サービス名に合わせること（`bonsight-api`のような暫定名のまま放置すると`AccessDeniedException`になる）。

## 10. 課金通知 (Slackへ毎日自動投稿)

`BonsightBillingStack`が、毎日09:00 JST（00:00 UTC）にCost Explorerで前日のサービス別コストを取得し、Slackへ投稿する（`infrastructure/lambda/billing-report/index.js` + EventBridge Scheduled Rule）。

### セットアップ

1. Slackで Incoming Webhook を作成（https://api.slack.com/apps → Create New App → From scratch → Incoming Webhooks有効化 → 投稿先チャンネル選択）
2. Webhook URLをSSMへ登録（実値はリポジトリへ書かない）

```bash
aws ssm put-parameter \
  --profile bonsight-prod --region ap-northeast-1 \
  --name /bonsight/prod/SLACK_BILLING_WEBHOOK_URL \
  --type SecureString \
  --value "https://hooks.slack.com/services/xxx/yyy/zzz" \
  --overwrite
```

3. デプロイ

```bash
cd infrastructure
npx cdk deploy BonsightBillingStack-prod -c env=prod --profile bonsight-prod
```

4. 動作確認（手動実行してSlackに届くか確認）

```bash
FUNC_NAME=$(aws lambda list-functions --profile bonsight-prod --region ap-northeast-1 \
  --query "Functions[?contains(FunctionName, 'BillingReportFunction')].FunctionName" --output text)
aws lambda invoke --profile bonsight-prod --region ap-northeast-1 \
  --function-name "$FUNC_NAME" --cli-read-timeout 60 /tmp/out.json
```

Lambda本体はCost Explorer API(`ce:GetCostAndUsage`、us-east-1固定エンドポイント)とSSM(`ssm:GetParameter`)のみのIAM権限で動作し、npm依存はLambdaランタイム(Node.js 20.x)に同梱されている`@aws-sdk/client-cost-explorer`・`@aws-sdk/client-ssm`をそのまま`require`しているため、ビルド・バンドル工程は不要（`lambda.Code.fromAsset`でJSファイルをそのままデプロイ）。
