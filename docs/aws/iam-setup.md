# ローカル開発用 IAM ユーザー セットアップ

## 方針

個人学習・ローカル開発では IAM ユーザー + アクセスキーを使用する。
ただし以下の原則を守ること:
- 最小権限: Bonsightが必要なAWSサービスのみ許可
- キー無コミット: アクセスキーをコード・ドキュメント・.envにコミットしない
- 定期ローテーション: 90日ごとにキーを更新する
- 本番は IAM ロール (ECS タスクロール等) を使用し、アクセスキーは不使用

> **推奨**: チーム開発・本番環境では IAM Identity Center (SSO) が推奨。
> 個人学習のローカル開発では IAM ユーザー + アクセスキーで可。

> **Note**: Cognito JWT 検証は JWKS 公開鍵エンドポイント (公開情報) を使うため、
> AWS 認証情報 (アクセスキー等) は不要。API サーバーの Cognito 検証部分は
> 認証情報なしで動作する。

## IAM ユーザー作成手順 (AWSコンソール)

1. AWSコンソール → IAM → 「ユーザー」→「ユーザーを作成」
2. ユーザー名: `bonsight-dev-local`
3. 「次へ」→ 「ポリシーを直接アタッチ」を選択
4. 「ポリシーを作成」(インラインポリシーで最小権限を付与 → 下記 JSON 参照)
5. ユーザーを作成

## 最小権限ポリシー

以下の JSON をカスタムポリシーとして作成する。
`YOUR-BUCKET-NAME` は実際のバケット名 (例: `bonsight-dev-media-xxxxxxxxxxxx`) に置換すること。
**実際の ARN 値はドキュメントに記載しない。**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.*"
    },
    {
      "Sid": "S3MediaBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

## アクセスキー発行

1. IAM → ユーザー → `bonsight-dev-local` → 「セキュリティ認証情報」タブ
2. 「アクセスキーを作成」→「ローカルコード」を選択
3. キーが表示されたら **CSV をダウンロード** (シークレットは二度と表示されない)
4. アクセスキー ID / シークレットアクセスキーはこのドキュメントに記載しない

## aws configure --profile 設定

```bash
aws configure --profile bonsight-dev
# 入力項目:
#   AWS Access Key ID:     (発行したキー ID)
#   AWS Secret Access Key: (発行したシークレット)
#   Default region name:   us-east-1
#   Default output format: json
```

設定は `~/.aws/credentials` の `[bonsight-dev]` セクションに保存される。
このファイルは Git 管理外 (OS がデフォルトで .gitignore 相当で扱う)。

## 利用方法

### 環境変数で指定
```bash
export AWS_PROFILE=bonsight-dev
pnpm --filter api start:dev
```

### packages/api/.env に設定 (gitignore 済みの場合のみ)
```env
AWS_PROFILE=bonsight-dev
AWS_REGION=us-east-1
# アクセスキーを直接書く場合は ~/.aws/credentials よりリスクが高い。推奨しない。
# AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
# AWS_SECRET_ACCESS_KEY=...
```

## 安全則まとめ

| ルール | 詳細 |
|--------|------|
| コミット禁止 | アクセスキー ID / シークレットをコード・ドキュメント・.env.example にコミットしない |
| .env は gitignore | packages/api/.env / packages/web/.env は .gitignore に含まれていること |
| キーローテーション | 90日ごとに新しいキーを発行し古いキーを無効化 |
| 不要キーの削除 | 使わなくなったキーは即座に無効化・削除 |
| 本番は IAM ロール | ECS タスクロール等を使用。アクセスキー不使用 |
| 最小権限 | AmazonBedrockFullAccess 等の広権限ポリシーは避け、上記カスタムポリシーを使用 |
