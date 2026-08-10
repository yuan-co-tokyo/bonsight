# Bonsight

盆栽の成長記録とAIアドバイスを扱うWebサービスのPhase1実装リポジトリ。

## ローカル開発起動手順

### Tier 2: dev AWSを使う開発モード（ホットリロード）

Cognito、S3/CloudFront、Bedrockは`bonsight-dev` AWSアカウントを使い、PostgreSQLだけをローカルで起動する。
日常開発ではAPIとWebをホスト上の`pnpm`で起動する。`docker-compose`のapi/webは本番向けイメージのため、
ホットリロード用途には使わない。

```bash
# 1. dev AWSへログイン
aws sso login --profile bonsight-dev

# 2. DBのみ起動
docker compose up -d db

# 3. API の .env 設定
cd packages/api && cp .env.example .env
# COGNITO_*、S3_BUCKET_NAME、CLOUDFRONT_DOMAIN、BEDROCK_* をdev環境の値で設定

# 4. Web の .env 設定
cd ../web && cp .env.example .env
# VITE_COGNITO_* と VITE_CLOUDFRONT_DOMAIN をdev環境の値で設定
# VITE_COGNITO_DOMAINには https:// を付けない

# 5. migration 適用（初回のみ）
cd ../api
npx prisma migrate dev

# 6. 開発サーバ起動
cd ../..
pnpm --filter api start:dev &  # API: http://localhost:3000
pnpm --filter web dev           # Web: http://localhost:5173
```

初回はCognito App Clientのcallback/logout URLに`http://localhost:5173/`を追加する。詳しくは
[`docs/dev/local-dev-environment.md`](docs/dev/local-dev-environment.md)を参照。
