# Bonsight

盆栽の成長記録とAIアドバイスを扱うWebサービスのPhase1実装リポジトリ。

## ローカル開発起動手順

### 全サービス一括起動（docker-compose）

```bash
docker-compose up --build
# Web:  http://localhost:8080
# API:  http://localhost:3000/api/v1
```

### 開発モード（ホットリロード）

```bash
# 1. DBのみ起動
docker-compose up -d db

# 2. API の .env 設定
cd packages/api && cp .env.example .env
# .env の DATABASE_URL をローカルPostgres向けに設定済み

# 3. migration 適用（初回のみ）
npx prisma migrate dev

# 4. 開発サーバ起動
cd ../..
pnpm --filter api start:dev &  # API: http://localhost:3000
pnpm --filter web dev           # Web: http://localhost:5173
```
