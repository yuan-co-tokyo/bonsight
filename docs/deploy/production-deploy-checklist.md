# Bonsight 本番デプロイ チェックリスト

> **正の資料**: このチェックリストは `docs/deploy/production-deploy.md` の内容・手順・SSMパラメータ名・
> GitHub Secrets名・`cdk deploy` 実行順序をそのまま踏襲する。矛盾がある場合は
> `production-deploy.md` を優先する。
>
> **実値厳禁**: 本ファイルにAWSアカウントID・ARN・パスワード・Secrets値などの実値は
> 一切記載しない。すべてプレースホルダー（例: `<ACCOUNT_ID>`）で表記する。
> 全AWS CLIコマンド例には `--profile bonsight-prod` を明記し、devプロファイルとの
> 取り違えを防ぐ。
>
> 使い方: 上から順に `[ ]` を潰しながら進める。各項目の「検証観点」を満たしたら
> チェックを入れる。

---

## Phase 0: AWSアカウント / アクセス準備

既存 `production-deploy.md` にはない新規セクション。prod専用AWSアカウントを
AWS Organizations配下に新設し、IAM Identity Center経由でアクセス可能にする。

**前提**: AWS Organizationsが既に運用されており、管理アカウント（management account）
への管理者アクセス権を持っていること。

### 0-(a) prod専用AWSアカウントを新設する

- [ ] 管理アカウントでAWS Organizationsコンソールにサインインした
      検証観点: コンソール左上のアカウント名が管理アカウントであることを確認できる。
- [ ] Organizations コンソール → 「AWS アカウントを追加」→「AWS アカウントを作成」で
      prod専用アカウントを作成した（アカウント名・Eメールアドレスはこのプロセス内で
      未使用の一意な値が必要）
      検証観点: Organizationsの「アカウント」一覧に新しいprodアカウントが
      `ACTIVE` ステータスで表示される。
- [ ] 新規アカウント作成時に自動生成される `OrganizationAccountAccessRole`
      （管理アカウントからprodアカウントへのフルアクセス用ロール）の存在を確認した
      検証観点: prodアカウントのIAMロール一覧に `OrganizationAccountAccessRole` が存在する。

参考: [Creating a member account in an organization](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_create.html)

### 0-(b) IAM Identity Centerで本番用Permission Setを作成する

- [ ] IAM Identity Centerコンソール → 「Multi-account permissions」→
      「Permission sets」→「Create permission set」で本番用Permission Setを作成した
      （初回は `AdministratorAccess` 相当のAWS管理ポリシーを使用）
      検証観点: Permission Sets一覧に作成したPermission Setが表示される。
- [ ] **要確認事項の明記**: このPermission Setは初回構築用の暫定広範囲権限である旨を
      チーム内メモや命名（例: `BonsightProdAdmin-Initial`）で明示した
      検証観点: Permission Set名または説明欄から「初回構築用・暫定」であることが読み取れる。
- [ ] 運用開始後は `production-deploy.md` §9「本番 IAM 最小権限」の方針に従い、
      最小権限ポリシーへ差し替える計画をメモした（本チェックリストの範囲外・別タスク）
      検証観点: 差し替え予定であることがdeploy関連ドキュメントかIssue等に記録されている。

参考: [Create a permission set](https://docs.aws.amazon.com/singlesignon/latest/userguide/howtocreatepermissionset.html)

### 0-(c) Permission Setをprodアカウントへ割当する

- [ ] IAM Identity Centerコンソール →「Multi-account permissions」→「AWS accounts」→
      prodアカウントを選択 →「Assign users or groups」で殿（自分）のユーザー/グループを選択した
      検証観点: prodアカウントの「割り当て済みユーザー/グループ」欄に自分が表示される。
- [ ] 「Assign permission sets」で0-(b)で作成したPermission Setを選択し、割当を完了した
      検証観点: 割当完了後、プロビジョニングが `SUCCEEDED` になる
      （反映まで数分かかる場合がある）。

参考: [Assign user or group access to AWS accounts](https://docs.aws.amazon.com/singlesignon/latest/userguide/assignusers.html)

### 0-(d) ローカルCLIからprodプロファイルを使えるようにする

- [ ] ローカル端末で `aws configure sso` を実行し、SSO start URL・SSOリージョンを入力、
      表示されたプロンプトでprodアカウント・0-(b)のPermission Setを選択、
      プロファイル名を `bonsight-prod` として保存した
      検証観点: `~/.aws/config` に `[profile bonsight-prod]` セクションと
      `sso_session` 設定が生成されている。
- [ ] `aws sso login --profile bonsight-prod` でブラウザ認証を行い、一時credentialsを取得した
      検証観点: `aws sts get-caller-identity --profile bonsight-prod` が
      prodアカウントIDとPermission Set由来のロールARNを返す。
- [ ] **長期アクセスキーは作成しない**ことを確認した（IAM Identity Center経由の一時
      credentialsのみを使用し、`aws configure` によるアクセスキー登録は行わない）
      検証観点: `~/.aws/credentials` にprod用の恒久的な `aws_access_key_id` /
      `aws_secret_access_key` が存在しない。

参考: [Configuring IAM Identity Center authentication with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

### 0-(e) GitHub OIDCロールをprodアカウント側に作成する

`production-deploy.md` §1「前提条件」の「GitHub OIDC プロバイダ + IAM ロール作成」を、
prodアカウント（`--profile bonsight-prod`）側で実施する。

- [ ] `--profile bonsight-prod` でprodアカウントにOIDC ID プロバイダ
      （プロバイダURL: `https://token.actions.githubusercontent.com`、
      オーディエンス: `sts.amazonaws.com`）を作成した
      検証観点: IAMコンソール →「Identity providers」に
      `token.actions.githubusercontent.com` が表示される。
- [ ] GitHub Actionsがassumeする IAM ロールを作成し、信頼ポリシーを対象repository・branch
      （必要に応じてenvironment）で絞った（`production-deploy.md` §9の方針と整合）
      検証観点: 作成したロールの信頼関係（Trust relationship）の
      `Condition` に対象リポジトリ・ブランチが明記されている。
      **要確認**: 信頼ポリシーの具体的なJSON条件キー（`token.actions.githubusercontent.com:sub` 等）
      は対象リポジトリ構成に応じて異なるため、実装時にAWS公式ドキュメントで最新の
      推奨条件を確認すること。
- [ ] 作成したロールARNを後続の「GitHub Secrets 登録」（Phase 4）で使う
      `AWS_OIDC_ROLE_ARN` の値として控えた（実値はリポジトリに書かず、GitHub Secretsにのみ登録）
      検証観点: ロールARNがローカルのメモ/パスワードマネージャ等、リポジトリ外にのみ存在する。

参考: [Configuring OpenID Connect in Amazon Web Services (GitHub Docs)](https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

---

## Phase 1: 前提条件（`production-deploy.md` §1 対応）

- [ ] Bedrock（ap-northeast-1）で `jp.claude` モデルへのアクセスを有効化した
      検証観点: Bedrockコンソール →「Model access」で該当モデルが `Access granted` と表示される。
- [ ] GitHub OIDC プロバイダ + IAM ロールを作成した（Phase 0-(e) で実施済み）
      検証観点: Phase 0-(e) の各チェックが完了している。
- [ ] 以下のSSMパラメータ（SecureString）をprodアカウントに手動投入した
      （`--profile bonsight-prod` で実行、実値はAWS上のみに置きリポジトリへ書かない）
  - [ ] `/bonsight/prod/DATABASE_URL`
        検証観点: `aws ssm get-parameter --name /bonsight/prod/DATABASE_URL --with-decryption --profile bonsight-prod` が値を返す（値自体はログや本チェックリストに書かない）。
  - [ ] `/bonsight/prod/COGNITO_USER_POOL_ID`
        検証観点: 同上コマンドで値が取得できる。
  - [ ] `/bonsight/prod/COGNITO_CLIENT_ID`
        検証観点: 同上コマンドで値が取得できる。
  - [ ] `/bonsight/prod/S3_BUCKET_NAME`
        検証観点: 同上コマンドで値が取得できる。
- [ ] `cdk deploy BonsightApiStack-prod -c env=prod` 実行前に、App Runnerサービス環境変数
      またはCDKコードの `BEDROCK_DIAGNOSIS_MODEL_ID` / `BEDROCK_CHAT_MODEL_ID` を
      実モデルIDへ更新した（ap-northeast-1で利用可能なAnthropic Claude系モデルID）
      検証観点: CDKコードまたはApp Runnerコンソールの環境変数欄がプレースホルダーではなく
      実モデルIDになっている。
- [ ] GitHub Secretsに以下を登録した（`--profile bonsight-prod` で得たARN/名称を使用、
      実値はGitHub Secretsにのみ登録しリポジトリへ書かない）
  - [ ] `AWS_OIDC_ROLE_ARN`
        検証観点: リポジトリ Settings → Secrets and variables → Actions に登録済み。
  - [ ] `AWS_REGION`（`ap-northeast-1`）
        検証観点: 同上。
  - [ ] `ECR_REPOSITORY`
        検証観点: 同上。
  - [ ] `APPRUNNER_SERVICE_ARN`
        検証観点: 同上（Phase 2 デプロイ後に判明する値のため、Phase 2完了後に登録でも可）。
  - [ ] `WEB_S3_BUCKET`
        検証観点: 同上（Phase 2 デプロイ後に判明）。
  - [ ] `WEB_CF_DIST_ID`
        検証観点: 同上（Phase 2 デプロイ後に判明）。
  - [ ] `VITE_API_BASE_URL`（`https://<AppRunnerURL>/api/v1`、CDKデプロイ後に判明）
        検証観点: 同上。
  - [ ] `VITE_COGNITO_USER_POOL_ID`
        検証観点: 同上。
  - [ ] `VITE_COGNITO_CLIENT_ID`
        検証観点: 同上。
  - [ ] `VITE_COGNITO_DOMAIN`（`<xxx>.auth.ap-northeast-1.amazoncognito.com`）
        検証観点: 同上。
  - [ ] `VITE_CLOUDFRONT_DOMAIN`（`https://<xxx>.cloudfront.net`、メディアCDN）
        検証観点: 同上（MediaStackデプロイ後に判明）。
- [ ] `VITE_*` はViteビルド時に `import.meta.env.*` としてJSバンドルへインライン化される旨を
      認識した。未設定のままビルドすると `localhost:3000` がハードコードされ本番APIへの
      リクエストが全て失敗することを確認した
      検証観点: Phase 4 のビルド実行前にVITE_*系Secretsが全て登録済みであることを再確認できる。

## Phase 2: 初回デプロイ（`production-deploy.md` §2 対応、`cdk deploy` は殿が実行）

- [ ] `cd infrastructure` した
      検証観点: カレントディレクトリが `infrastructure` である。
- [ ] 初回のみ `npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1 --profile bonsight-prod` を実行した
      検証観点: `CDKToolkit` スタックがprodアカウントのCloudFormationに `CREATE_COMPLETE` で存在する。
- [ ] `npx cdk deploy BonsightDbStack -c env=prod --profile bonsight-prod` を実行した
      検証観点: `BonsightDbStack` が `CREATE_COMPLETE` になり、RDSインスタンスが作成される。
- [ ] `npx cdk deploy BonsightMediaStack -c env=prod --profile bonsight-prod` を実行した
      検証観点: `BonsightMediaStack` が `CREATE_COMPLETE` になり、`CloudFrontDomain` output
      （`https://<xxx>.cloudfront.net`）が確認できる。
- [ ] `npx cdk deploy BonsightWebStack -c env=prod --profile bonsight-prod` を実行した
      検証観点: `BonsightWebStack` が `CREATE_COMPLETE` になる。
- [ ] MediaStackのCloudFront URLがクロススタック参照でApiStackの `CLOUDFRONT_DOMAIN` に
      渡ることを踏まえ、MediaStack完了後に `npx cdk deploy BonsightApiStack -c env=prod --profile bonsight-prod`
      を実行した
      検証観点: `BonsightApiStack` が `CREATE_COMPLETE` になり、App Runnerサービスが
      `RUNNING` 状態になる。

## Phase 3: DBマイグレーション（`production-deploy.md` §3 対応）

- [ ] 本番DB接続情報がSSM Parameter Storeまたは実行環境変数から供給されることを確認し、
      手元の `.env` や秘密値をコミットしていないことを確認した
      検証観点: `git status` / `git diff` に `.env` やDB接続文字列を含むファイルが含まれない。
- [ ] `pnpm --filter api prisma migrate deploy` を本番DB接続情報が解決できる環境で実行した
      検証観点: コマンドが正常終了し、Prismaが「No pending migrations」または
      適用したマイグレーション一覧を出力する。

## Phase 4: CI/CD 有効化（`production-deploy.md` §4 対応）

- [ ] `ci.yml` がPR/push時にtypecheck・Jest・vitest・buildを自動実行することを確認した
      検証観点: 直近のPRでCIワークフローが全ジョブ成功している。
- [ ] CIのテストSKIP数が0であることを確認した
      検証観点: CI実行ログにSKIPされたテストが1件も無い（CLAUDE.md「SKIP = FAIL」準拠）。
- [ ] `deploy.yml` を GitHub Actions →「workflow_dispatch」から手動実行（Run workflow）した
      検証観点: ワークフローがOIDCでAWSロールをassumeし、apiをECR + App Runner、
      webをS3 + CloudFrontへ反映するジョブが成功で完了している。

## Phase 5: 動作確認（`production-deploy.md` §5 対応）

App Runner URL または CloudFront URL で以下を確認する。

- [ ] ログインできる
      検証観点: 認証成功後、想定の画面（ダッシュボード等）へ遷移する。
- [ ] 盆栽一覧と詳細を表示できる
      検証観点: 一覧ページ・詳細ページの双方がエラーなく表示される。
- [ ] AI診断を実行できる
      検証観点: 診断リクエストが成功レスポンスを返し、結果が画面に表示される
      （Bedrockモデルアクセスが正しく有効化されている証跡になる）。
- [ ] 画像アップロードとCloudFront配信が動作する
      検証観点: アップロードした画像がCloudFront URL経由で表示される。

---

## 自己チェック（作成者記入）

- [ ] `production-deploy.md` のセクション番号（§1〜§9）・SSMパラメータ名・GitHub Secrets名・
      `cdk deploy` の実行順序（DbStack → MediaStack → WebStack → ApiStack）と本ファイルの
      記述が完全一致していることを確認した。
- [ ] 本ファイル中に実値（AWSアカウントID・ARN・パスワード・Secrets値等）が
      存在しないことを `grep` 等で確認した。
