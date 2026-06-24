# S3 + CloudFront (BonsightMediaStack) Deploy 手順書

CDK スタック `BonsightMediaStack` をデプロイして S3 メディアバケットと CloudFront ディストリビューションを作成する手順。

---

## 前提条件

- AWS CLI プロファイル `bonsight-dev` 設定済み（[docs/aws/iam-setup.md](iam-setup.md) 参照）
- **deploy に必要な追加 IAM 権限**（iam-setup.md の最小権限ポリシーに以下を追加）:
  - `cloudformation:*`（CloudFormation スタック操作）
  - `s3:CreateBucket`, `s3:PutBucketPolicy`, `s3:PutBucketCORS`, `s3:PutBucketPublicAccessBlock`（バケット作成）
  - `cloudfront:CreateDistribution`, `cloudfront:CreateOriginAccessControl`, `cloudfront:TagResource`（ディストリビューション作成）
  - `iam:CreateRole`, `iam:AttachRolePolicy`, `iam:PassRole`（OAC 用ロール）
  - `ssm:GetParameter`（CDK Bootstrap 参照）
  > 簡易設定: `AdministratorAccess` または `PowerUserAccess` + `IAMFullAccess`
- Node.js 18 以上
- **リージョン: `ap-northeast-1`**（デフォルト）
  - `CDK_DEFAULT_REGION` 環境変数で上書き可能
  - カスタムドメイン + ACM 証明書を使う場合は `us-east-1` が必要（CloudFront は us-east-1 の ACM 証明書のみ使用可）
  - 本スタックはカスタムドメイン未使用のため `ap-northeast-1` デプロイで問題なし

---

## env (account / region) の解決

`bin/infrastructure.ts` は以下の環境変数を参照する:

```bash
# AWS アカウント ID の設定（バケット名に組み込まれる）
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity \
  --query Account --output text --profile bonsight-dev)

# リージョン設定（省略時は ap-northeast-1）
export CDK_DEFAULT_REGION=ap-northeast-1
```

バケット名は `bonsight-<ACCOUNT_ID>-media` の形式になる。

---

## 手順

### 1. 依存関係インストール

```bash
cd ~/documents/codex_projects/bonsight/infrastructure
npm install
```

### 2. CDK Bootstrap（初回のみ）

AWS CDK が CloudFormation スタックの管理に使用するリソース（S3 バケット、IAM ロール等）を作成する。
アカウント・リージョンの組み合わせごとに一度だけ実行。

```bash
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1 --profile bonsight-dev
```

> `<ACCOUNT_ID>` には実際の AWS アカウント ID を入れる。

### 3. スタック合成確認

CloudFormation テンプレートを生成してエラーがないことを確認する（AWS 操作は発生しない）。

```bash
npx cdk synth BonsightMediaStack --profile bonsight-dev
```

エラーなく CloudFormation テンプレートが標準出力されれば OK。

### 4. Deploy

```bash
npx cdk deploy BonsightMediaStack --profile bonsight-dev
```

- `Do you wish to deploy these changes (y/n)?` → `y` を入力
- 完了まで 3〜5 分程度かかる
- デプロイ完了後、ターミナルに Outputs が表示される（次セクション参照）

---

## スタック出力値と .env の対応

deploy 完了後、以下のような出力が表示される:

```
Outputs:
  BonsightMediaStack.BucketName = bonsight-<ACCOUNT_ID>-media
  BonsightMediaStack.CloudFrontDomain = https://XXXXXXXXXXXX.cloudfront.net
  BonsightMediaStack.CloudFrontDistributionId = EXXXXXXXXXX
```

これらを各 .env ファイルへ設定する:

**`packages/api/.env`**:

```dotenv
S3_BUCKET_NAME=bonsight-<ACCOUNT_ID>-media       # BonsightMediaStack.BucketName の値
CLOUDFRONT_DOMAIN=https://XXXXXXXXXXXX.cloudfront.net  # BonsightMediaStack.CloudFrontDomain の値
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXX           # BonsightMediaStack.CloudFrontDistributionId の値
AWS_REGION=ap-northeast-1
```

**`packages/web/.env`**（フロントから CloudFront を参照する場合）:

```dotenv
VITE_CLOUDFRONT_DOMAIN=https://XXXXXXXXXXXX.cloudfront.net  # BonsightMediaStack.CloudFrontDomain の値
```

---

## 注記

### バケットの RETAIN ポリシー

バケットは `removalPolicy: RETAIN` のため、`cdk destroy` してもバケットは削除されない。
本番データを誤削除から保護するための設定。手動削除が必要な場合は「後片付け」セクションを参照。

### アクセス制御（BLOCK_ALL + OAC）

バケットはパブリックアクセスを完全にブロック（`BlockPublicAccess.BLOCK_ALL`）。
CloudFront は Origin Access Control (OAC) 経由でのみバケットにアクセスできる。
直接 S3 URL ではアクセス不可（意図的な設計）。

### CORS 設定

presigned URL によるアップロード（PUT）に対応するため、以下のオリジンが許可済み:

| オリジン | 用途 |
|---------|------|
| `http://localhost:5173` | Vite 開発サーバー |
| `http://localhost:8080` | 代替開発サーバー |

許可メソッド: `GET`, `PUT`, `POST`, `HEAD`

CORS の変更が必要な場合は `infrastructure/lib/bonsight-media-stack.ts` の `cors` 設定を修正して再 deploy。

### CloudFront の反映待ち

deploy 後、CloudFront ディストリビューションの反映には数分〜10 分程度かかる場合がある。
AWS コンソールでディストリビューションの Status が **"Deployed"** になるまで待ってから動作確認すること。

### キャッシュ設定

| パス | キャッシュポリシー | 備考 |
|------|------------------|------|
| `/*`（デフォルト） | CACHING_OPTIMIZED | 通常のメディア配信 |
| `/upload/*` | CACHING_DISABLED | presigned URL アップロード用 |

---

## 後片付け（Teardown）

### スタック削除

```bash
cd ~/documents/codex_projects/bonsight/infrastructure
npx cdk destroy BonsightMediaStack --profile bonsight-dev
```

> バケットは `RETAIN` のため削除されず残存する。

### バケットの手動削除

```bash
# 1. バケットを空にする（オブジェクトが残っているとバケット削除不可）
aws s3 rm s3://<BUCKET_NAME> --recursive --profile bonsight-dev

# 2. バケットを削除
aws s3 rb s3://<BUCKET_NAME> --profile bonsight-dev
```

`<BUCKET_NAME>` は `bonsight-<ACCOUNT_ID>-media` の形式。

---

## 関連ドキュメント

- [iam-setup.md](iam-setup.md) — IAM ユーザー・ポリシー設定
- [cost-estimate.md](cost-estimate.md) — S3/CloudFront コスト試算
