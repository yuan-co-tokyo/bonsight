# Bonsight 開発環境（ローカル）構成 検討

> 目的: 本番（Prod）は「App Runner + Supabase + Bedrock」へ移行済み。開発を継続するため、
> **DB・Webサーバー・APIをローカルで動かし、AI（Bedrock）だけをクラウドに残す**開発環境を整備する。
> 本書は (1) 現状の実態、(2) 何をローカル化し何をクラウドに残すかの切り分け、(3) 推奨構成、
> (4) コンポーネント別の具体案と必要な変更、(5) 起動手順、(6) セキュリティ注意、をまとめる。
>
> 関連資料: [`../../README.md`](../../README.md) / [`../aws/cost-optimization.md`](../aws/cost-optimization.md) /
> [`../aws/cognito-setup.md`](../aws/cognito-setup.md)

---

## 1. 現状のローカル開発の実態

`docker-compose.yml` に `db` / `api` / `web` の3サービスがある。ただし **この compose は「本番相当イメージの起動確認」向けで、日常開発（ホットリロード）には不向き** な点に注意する（コードで確認した事実）。

- `api` イメージは Dockerfile で `ENV NODE_ENV=production`、`CMD` が `prisma migrate deploy && node dist/src/main`（ビルド済みJSを本番モードで起動）。
- `web` イメージは `nginx:alpine` による**静的配信**（`dist` を配信、Vite開発サーバーではない）。ホットリロードは効かない。
- Vite は環境変数を**ビルド時に**バンドルへインライン化するため、`docker-compose` の `web.environment`（`VITE_API_BASE_URL` 等）は**ビルド済みバンドルに反映されない**。

さらに、**現状の compose の `api` サービスは `DATABASE_URL` / `PORT` しか渡していない**
（`docker-compose.yml` に `# TODO: AWS環境変数は cmd_019 で追加` のコメントあり）。
Cognito / S3 / Bedrock の環境変数も SSO 資格情報も渡らないため、**今の `docker-compose up` では API はそのまま起動できない**
（認証ガードが Cognito 環境変数を要求して失敗する）。

> **したがって日常開発は「Postgres（と MinIO）だけ Docker、API/Web はホストで `pnpm` 起動」が基本**。
> compose による API/Web 込みの一括起動を「本番相当の結合確認」に使うには、**別途 `env_file` の用意と
> 認証情報の受け渡し（SSO資格情報のマウント等）を設計する必要がある**（現状は未整備・将来対応）。

外部依存（認証・メディア・AI）の現状の扱いは次のとおり。

| コンポーネント | 現状 | 外部依存 |
|----------------|------|----------|
| DB (PostgreSQL) | docker-compose `db`（`postgres:16`） | なし（完全ローカル） |
| Web (Vite SPA) | docker-compose `web` / `pnpm --filter web dev` | Cognito Hosted UI（ログイン時） |
| API (NestJS) | docker-compose `api` / `pnpm --filter api start:dev` | 下記3つ |
| 認証 (Cognito) | `CognitoAuthGuard` が Bearer トークンを **実Cognitoの JWKS** で検証（`packages/api/src/auth/cognito-auth.guard.ts`） | 実Cognito User Pool |
| メディア (S3/CloudFront) | `MediaService` が **実S3へ presigned PUT**、`CLOUDFRONT_DOMAIN` で配信（`packages/api/src/media/media.service.ts`） | 実S3 + CloudFront |
| AI (Bedrock) | `BedrockService` が AWS SDK 既定の認証チェーンで Bedrock を呼ぶ（`packages/api/src/bedrock/bedrock.service.ts`） | 実Bedrock |

補足（コードで確認した事実）:

- `BedrockRuntimeClient` / `S3Client` はいずれも **AWS SDK の既定認証チェーン**で動く。ローカルでは
  `AWS_PROFILE=bonsight-dev` + `aws sso login --profile bonsight-dev` で認証情報が解決される。
- `S3Client` は `new S3Client({ region })` で **`endpoint` 未指定**。MinIO等のローカルS3へ向けるには
  `endpoint` と `forcePathStyle` を受け付けるコード変更が必要（§4-C）。
- `CognitoAuthGuard` は**コントローラ単位の `@UseGuards`**で適用され、コンストラクタで JWKS 検証器を生成する。
- dev用AWSアカウント（`bonsight-dev`, `698643713146`）は本番（`342016537048`）と分離済み。

---

## 2. 切り分け方針 — 「Bedrock だけクラウド、他はローカル」

方針は明快で、**Bedrock 以外の常時依存をローカルに寄せる**。判断のポイントは「クラウドでしか成立しないか」。

| コンポーネント | ローカル化 | 手段 | 備考 |
|----------------|:---------:|------|------|
| DB | ◎ できる | docker Postgres（現状のまま） | 変更不要 |
| Web / API サーバー | ◎ できる | Vite dev + Nest start:dev（現状のまま） | 変更不要 |
| 認証 (Cognito) | △ 工夫要 | **dev用の認証バイパス**（推奨） or 実dev Cognito | Cognitoは純ローカル化不可。§4-B |
| メディア (S3) | ○ できる | **MinIO（S3互換）**（推奨） or 実dev S3 | 小さなコード変更が必要。§4-C |
| AI (Bedrock) | ✕ しない | 実Bedrock（`bonsight-dev` の SSO 認証） | Bedrock Localは無い。§4-D |

> Cognitoとメディアは「純粋なローカル化」に一手間かかる。ここを **ローカル寄せ（バイパス / MinIO）** にするか
> **実dev AWS を使う** かで、2つのTierＬに分かれる（§3）。

---

## 3. 推奨構成

### 推奨: Tier 1「最小クラウド」（Bedrock以外は完全ローカル）

```
ローカルマシン（docker-compose / pnpm dev）
  ├─ Postgres (docker)                      … DB ローカル
  ├─ MinIO (docker, S3互換, :9000)          … メディア ローカル
  ├─ API (NestJS, :3000)
  │     ├─ DB     → ローカル Postgres
  │     ├─ 認証   → dev認証バイパス（固定 sub を注入）★
  │     ├─ メディア → MinIO（presigned PUT / dev限定の匿名read GET）
  │     └─ AI     → 実 Bedrock（bonsight-dev の SSO 認証）  ← 唯一のクラウド依存
  └─ Web (Vite dev, :5173)                  … Web ローカル
        └─ ログインUIはスキップ（バイパス時）or ダミートークン
```

- **長所**: オフラインでも（Bedrock以外は）動く。起動が速く、AWSリソースの事前準備が最小。inner loop が最速。
- **短所**: 認証バイパス・MinIO対応の**小さなコード変更が2点必要**（§4-B, §4-C）。実ログイン導線は別途確認が要る。

### 代替: Tier 2「dev AWS 併用」（サーバーだけローカル）

DB・Web・APIはローカルで動かすが、**認証=実dev Cognito / メディア=実dev S3** をそのまま使う。

- **長所**: **コード変更ゼロ**。本番に最も近い挙動。実ログイン導線・実CDN配信をそのまま検証できる。
- **短所**: ネットワーク必須。dev Cognito / dev S3 バケットの用意が要る。ログイン往復のぶん遅い。

> **推奨の使い分け**: 機能開発の日常ループは **Tier 1**（速い・オフライン可）。
> ログイン導線・presigned/CDN配信・本番同等の結合確認をするときだけ **Tier 2** に切り替える。
> `.env` の切り替えだけで両者を行き来できるよう設計する（§5）。

---

## 4. コンポーネント別の具体案

### 4-A. DB（変更不要）

`docker-compose.yml` の `db` をそのまま使う。API の `DATABASE_URL` はローカルPostgresを指す。

```
DATABASE_URL="postgresql://bonsight:bonsight@localhost:5432/bonsight?schema=public"
```

スキーマ適用は `npx prisma migrate deploy`（またはホットリロード開発時は `prisma migrate dev`）。

### 4-B. 認証（推奨: dev認証バイパス）

Cognitoは純ローカル化できない。開発ループを速くするため、**開発時のみ有効な認証バイパス**を用意する。

#### API側（`CognitoAuthGuard`）

**設計（コード変更・要実装）**: `canActivate` の先頭で、dev専用フラグが立っている時だけ
固定の開発ユーザー `sub` を注入して素通しする。**多重ガード**で本番混入を防ぐ。

> ⚠️ **落とし穴（要対応）**: 現行 Guard は `verifier` を**フィールド初期化子**で生成している
> （`private readonly verifier = CognitoJwtVerifier.create({ userPoolId: process.env.COGNITO_USER_POOL_ID!, ... })`,
> `cognito-auth.guard.ts:10`）。これは**インスタンス生成時（＝API起動時）に実行される**ため、
> Cognito環境変数が無いと `CognitoJwtVerifier.create` が投げ、`canActivate` 内のバイパスに**到達する前に起動が失敗する**。
> → バイパス時は verifier を生成しないよう **遅延初期化（getter / 初回検証時に生成）** へ変更する必要がある。

```ts
// packages/api/src/auth/cognito-auth.guard.ts（イメージ）
export class CognitoAuthGuard implements CanActivate {
  private _verifier?: ReturnType<typeof CognitoJwtVerifier.create>;

  // 遅延初期化: バイパス時は呼ばれない＝Cognito環境変数不要
  private get verifier() {
    if (!this._verifier) {
      this._verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.COGNITO_USER_POOL_ID!,
        clientId: process.env.COGNITO_CLIENT_ID!,
        tokenUse: 'access',
      });
    }
    return this._verifier;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ★ dev限定バイパス: 本番では絶対に有効化されないよう二重で防御
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true') {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: process.env.DEV_AUTH_SUB ?? 'dev-user-0001' };
      return true;
    }
    // …以降は this.verifier.verify(token) を使う現行ロジック（初回アクセス時にverifier生成）
  }
}
```

- 有効化は `.env` で `DEV_AUTH_BYPASS=true` かつ `NODE_ENV != production` のときだけ。
- 固定 `sub`（例 `dev-user-0001`）で DB 上の所有者チェック（`bonsai.owner === sub`）も一貫して通る。

#### Web側（`App.tsx` / `api/client.ts`）

**設計（コード変更・要実装）**: Web も Cognito 前提で作られているため、**バイパス用の切替が必要**（コードで確認）。

- `App.tsx:60` が `fetchAuthSession()` を呼び、`idToken` の有無で `authed` を決める。トークンが無いと
  ランディング画面（`S0Landing`）から先へ進めない。→ `import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'` のとき
  `fetchAuthSession` をスキップして `authed=true` にする分岐を入れる。
- `api/client.ts:8-10` は `fetchAuthSession()` の `accessToken` を `Authorization: Bearer` に付与する。
  バイパス時はトークンが無くヘッダ未付与になるが、**API側もバイパスで素通しするためヘッダ無しで動く**。
  （厳密にしたい場合はダミーの `Authorization` を付ける分岐にしてもよい）
- `VITE_DEV_AUTH_BYPASS` は Vite のビルド/起動時に読まれる。dev（`pnpm --filter web dev`）でのみ設定し、
  本番ビルドの環境には**絶対に渡さない**（§6）。

> **セキュリティ最重要**: このバイパスは**認証を無効化する**。本番へ絶対に持ち込まない。
> ガード条件を `NODE_ENV!=='production'` と明示フラグの **両方** にし、`DEV_AUTH_BYPASS` は
> 本番の SSM / App Runner 環境変数に**存在させない**。§6のチェックも参照。

**代替（Tier 2 / コード変更なし）**: 実の `bonsight-dev` Cognito User Pool を使う。

- API `.env`: `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` に dev の値。
- Web `.env`: `VITE_COGNITO_*` に dev の値。**App Client の callback/logout URL に `http://localhost:5173/` を追加**する
  （`aws cognito-idp update-user-pool-client`）。手順は [`../aws/cognito-setup.md`](../aws/cognito-setup.md) に準拠。
- dev ユーザーは `admin-create-user` で発行、または dev プールのセルフサインアップを許可。

### 4-C. メディア（推奨: MinIO によるローカルS3）

> ⚠️ **落とし穴（要対応）**: `S3Client` は **3箇所で個別に生成**されている（コードで確認）。
> `MediaService`（presigned PUT・個別削除）／`BonsaiService`（盆栽削除時の一括削除、`DeleteObjectsCommand`）／
> `AdviceService`（**AI診断用画像の取得**、`GetObjectCommand`）。
> `MediaService` だけ MinIO へ向けると、**AI診断は実S3を読みに行き**（＝ローカルにアップした画像が見えない）、
> **盆栽削除では MinIO のオブジェクトが消し残る**。→ **共通の S3 クライアント Provider へ集約**し、
> エンドポイント・資格情報を一元管理する設計にする。

**設計（コード変更・要実装）**: 3箇所の `new S3Client(...)` をやめ、DIで注入する共通 Provider を作る。
エンドポイント（MinIO）と**S3専用の資格情報**を環境変数で受け取る。

```ts
// packages/api/src/s3/s3.module.ts（イメージ・新規）
export const S3_CLIENT = Symbol('S3_CLIENT');

const s3ClientProvider = {
  provide: S3_CLIENT,
  useFactory: () => new S3Client({   // ← useFactory（大文字F）が正しい
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT,                          // 例: http://localhost:9000（未設定なら実S3）
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // MinIOはパススタイル必須
    // ★ S3専用の資格情報を「S3クライアントにだけ」明示注入する（プロセス環境変数に置かない）
    credentials: process.env.S3_ACCESS_KEY_ID
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! }
      : undefined,   // 未指定なら SDK 既定チェーン（実S3・SSO）にフォールバック
  }),
};

// ★ 3モジュール（Media/Bonsai/Advice）から参照できるよう、export or @Global() が必要
@Global()                                    // もしくは各Moduleで S3Module を imports する
@Module({ providers: [s3ClientProvider], exports: [S3_CLIENT] })
export class S3Module {}
// 各Serviceは constructor(@Inject(S3_CLIENT) private readonly s3: S3Client) で受け取る
```

`@Global()`を付けたModuleも、アプリケーションへ一度は登録する必要がある。`AppModule`の
`imports`に`S3Module`を追加する。`@Global()`を使わない場合は、`MediaModule` / `BonsaiModule` /
`AdviceModule`のそれぞれで`S3Module`をimportする。

```ts
// packages/api/src/app.module.ts（@Global()を使う場合）
@Module({
  imports: [
    S3Module,
    // ...既存Module
  ],
})
export class AppModule {}
```

- `docker-compose` に MinIO を追加（S3互換, `:9000` API / `:9001` コンソール）。
- 起動時に開発用バケット（例 `bonsight-dev-media`）を作成し、**localhost:5173 からの PUT を許可する CORS** を設定。
- 配信URL（`CLOUDFRONT_DOMAIN`）は MinIO の公開URL（例 `http://localhost:9000/bonsight-dev-media`）に読み替える。
- presigned PUT・削除・AI診断の画像取得が、すべて同じ MinIO クライアント経由で完結（クラウド不要）。

> ⚠️ **画像の「表示」には別対応が必要（要実装）**: 現行 `MediaService` は **presigned PUT しか生成しない**。
> 表示時は `cloudfrontUrl = ${CLOUDFRONT_DOMAIN}/${s3Key}` を **`<img>` に直リンク**する実装
> （`media.service.ts:58,70`）のため、MinIO バケットが private のままだと **`AccessDenied` で表示できない**。
> 開発では次のいずれかで対応する:
> - **簡単（推奨・dev限定）**: 開発バケットに**匿名read（public download）を許可**する。
>   例: `mc anonymous set download local/bonsight-dev-media`。`CLOUDFRONT_DOMAIN` 直リンクがそのまま表示できる。
> - **厳密**: 表示用に **presigned GET を実装**して `cloudfrontUrl` の代わりに署名付きURLを返す（本番挙動とは変わる）。
> ※ 本番は CloudFront + OAC で S3 を private のまま配信しているため、この差異は**開発専用の対応**。

docker-compose 追記イメージ（**ポートは localhost 限定**。§6参照）:

```yaml
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    volumes:
      - bonsight_minio:/data
# volumes: に bonsight_minio: を追加
```

API `.env`（MinIO利用時）:

```
AWS_REGION=ap-northeast-1
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
S3_BUCKET_NAME=bonsight-dev-media
CLOUDFRONT_DOMAIN=http://localhost:9000/bonsight-dev-media
# ★ S3専用の資格情報（S3クライアントにだけ渡す。AWS_ACCESS_KEY_ID としては置かない）
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

> **重要**: `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` を `.env` に置くと、同一プロセスの
> **Bedrock 呼び出しもそのキー（minioadmin）を使って失敗する**。必ず `S3_ACCESS_KEY_ID` /
> `S3_SECRET_ACCESS_KEY` という**S3専用の名前**で持ち、上記 Provider で S3 クライアントにだけ注入する。
> Bedrock は `AWS_PROFILE=bonsight-dev` の SSO 資格情報（SDK既定チェーン）で動く（§4-D）。

**代替（Tier 2 / コード変更なし）**: 実の `bonsight-dev` S3 バケット + CloudFront を使う。
`S3_BUCKET_NAME` / `CLOUDFRONT_DOMAIN` に dev の値、認証は `AWS_PROFILE=bonsight-dev`。
バケットCORSの `allowedOrigins` に `http://localhost:5173` を含めること。

### 4-D. AI（実Bedrock・唯一のクラウド依存）

Bedrock はローカル代替が無いため、`bonsight-dev` アカウントの実 Bedrock を使う。

- 認証: `AWS_PROFILE=bonsight-dev` + `aws sso login --profile bonsight-dev`（SDK既定チェーンが解決）。
- `.env`:

```
AWS_PROFILE=bonsight-dev
BEDROCK_REGION=us-east-1            # .env.example準拠。ap-northeast-1に揃える場合はモデルIDも合わせる
BEDROCK_DIAGNOSIS_MODEL_ID=<有効な推論プロファイルID>
BEDROCK_CHAT_MODEL_ID=<有効な推論プロファイルID>
BEDROCK_MODEL_ID=<フォールバック用>
```

- 利用モデルは事前にアカウントでアクセス有効化＆クォータ承認が必要（`aws bedrock list-inference-profiles`）。
- コスト: 開発でも従量課金が発生する。乱用防止のため使う分だけ。

> **注意（認証情報の競合）**: Bedrock（`BedrockService`）と S3（Media/Bonsai/Advice）は同じ AWS SDK 認証チェーンを共有する。
> - **Tier 1（MinIO）**: `AWS_ACCESS_KEY_ID` を環境変数に置くと **Bedrock もそのキーで認証され失敗する**。
>   §4-C のとおり **`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` として持ち、共通 S3 Provider で S3 クライアントにだけ**
>   注入する。Bedrock は `AWS_PROFILE=bonsight-dev` の SSO 資格情報（SDK既定チェーン）を使う。この分離が Tier 1 の肝。
> - **Tier 2（実S3）**: S3もBedrockも `bonsight-dev` の SSO 資格情報で動くので競合しない（この点でもTier 2は単純）。

---

## 5. 起動手順（inner loop）

### Tier 1（推奨・最小クラウド）

```bash
# 0) Bedrock用にdev AWSへログイン（AIを使う場合のみ）
aws sso login --profile bonsight-dev

# 1) データストアだけ Docker で起動（API/Web はホストで pnpm。§1の理由参照）
docker-compose up -d db minio
# 初回のみ: MinIOに開発バケット作成 + CORS設定（mc または コンソール :9001 で）

# 2) API（.env は Tier 1 設定: DEV_AUTH_BYPASS=true / S3_ENDPOINT=... ）
cd packages/api && cp .env.example .env   # 初回のみ、Tier1向けに編集
# APIをlocalhostだけに公開し、固定の開発ユーザーで認証をバイパス
# packages/api/.env に以下を設定する
# HOST=127.0.0.1
# DEV_AUTH_BYPASS=true
# DEV_AUTH_SUB=dev-user-0001
npx prisma migrate dev                      # 初回・スキーマ変更時
cd ../.. && pnpm --filter api start:dev     # http://localhost:3000（ホットリロード）

# 3) Web（バイパスを有効化。dev起動時のみ）
VITE_DEV_AUTH_BYPASS=true pnpm --filter web dev   # http://localhost:5173（.env.localに書いてもよい）
```

> `docker-compose up`（api/web 込み）での一括起動は、`api`=本番モード・`web`=nginx静的配信であり、
> かつ**現状は api に AWS 系 env / SSO資格情報が渡らず起動できない**（§1）。本番相当の結合確認に使うなら
> `env_file`・認証情報の受け渡しを整備する必要がある。日常のホットリロード開発では **db/minio だけ Docker** にする。

### Tier 2（dev AWS 併用）

```bash
aws sso login --profile bonsight-dev
docker-compose up -d db                       # DBのみローカル
# API .env: DEV_AUTH_BYPASS 未設定 / 実dev Cognito・実dev S3 の値
pnpm --filter api start:dev
pnpm --filter web dev                         # 実Cognito Hosted UIでログイン
```

> `.env` を `env.tier1` / `env.tier2` のように用意しておけば、`cp` 一発で切り替えられる。

---

## 6. セキュリティ注意（必読）

- **認証バイパスを本番に持ち込まない**。
  - API側のガード条件は `NODE_ENV !== 'production'` かつ `DEV_AUTH_BYPASS === 'true'` の **AND**。
  - `DEV_AUTH_BYPASS` / `DEV_AUTH_SUB` を **本番の SSM・App Runner 環境変数に設定しない**。Web側の
    `VITE_DEV_AUTH_BYPASS` も **本番ビルドの環境に絶対に渡さない**（Viteはビルド時にバンドルへ焼き込むため）。
  - 本番デプロイ物（App Runner）は `NODE_ENV=production`（`bonsight-api-stack.ts` で設定済み）なので、
    仮にフラグが紛れても二重ガードで無効化される。CIに「本番向けビルドでバイパスが有効化されない」テストを1本追加すると堅い。
- **認証バイパスAPI・デフォルト資格情報のMinIOをLANへ公開しない**。
  - docker-compose のポートは既定で全インターフェース（`0.0.0.0`）に公開される。認証を素通しする dev API と
    `minioadmin` 固定のMinIOが同一LANの他端末から触れると危険。**`127.0.0.1` へバインドを限定**する。
  - MinIO: `127.0.0.1:9000:9000` / `127.0.0.1:9001:9001`（§4-C の compose 例のとおり）。
  - Postgres も `127.0.0.1:5432:5432` に限定する（`docker-compose.yml` の `db.ports` を修正）。
  - **ホスト起動の API も localhost 限定が必須（要実装）**: 現行 `main.ts:11` は `app.listen(process.env.PORT ?? 3000)`
    で**全インターフェースにbind**する。バイパス利用時は認証が無効なので、`app.listen(port, process.env.HOST ?? '0.0.0.0')`
    へ変更し、dev では `HOST=127.0.0.1` を設定して LAN 露出を防ぐ（「必要に応じて」ではなく**バイパス時は必須**）。
  - Vite dev サーバーは既定で localhost bind。LAN公開する `--host` を付けないこと。
- **MinIOの資格情報（minioadmin）は開発専用**。実AWSキーを `.env` に平文で置かない（SSOを使う）。
- `.env` は `.gitignore` 済みであることを確認し、実値（Cognito ID等）をコミットしない。
- dev と prod の **AWSプロファイル取り違えに注意**（`bonsight-dev` = 698643713146 / `bonsight-prod` = 342016537048）。

---

## 7. 導入の進め方（段階）

1. **まず Tier 2 で動かす**（コード変更ゼロ・最も確実）。DB だけローカル、認証/メディアは実dev、AI=Bedrock。
   これで「ローカルAPI+DB+Web、AI=Bedrock」の骨格を最短で確認する。
2. **認証バイパス（§4-B）を実装**して日常ループを高速化（Cognito依存を外す）。
3. **MinIO対応（§4-C）を実装**してメディアもローカル化（S3依存を外す）＝ Tier 1 完成。
4. 各段階で `.env` テンプレートと本書を更新する。

> 実装（§4-B / §4-C のコード変更）は本書の範囲外の別タスク。着手時のレビュー観点:
> - **Guardの遅延初期化**（`verifier` をフィールド初期化子から getter へ。バイパス時にCognito環境変数不要にする）
> - **Web側の切替**（`App.tsx` の `fetchAuthSession` スキップ分岐、`api/client.ts` の挙動）
> - **共通 S3 Provider への集約**（`useFactory` で S3Module 化し export/import または `@Global()`。
>   `@Global()`の場合も`AppModule`へ一度importする。Media/Bonsai/Advice の3クライアントを一元化し、
>   診断画像取得・削除も MinIO を向く）
> - **画像表示の対応**（MinIO開発バケットの匿名read許可、または表示用 presigned GET の実装。
>   現行は `${CLOUDFRONT_DOMAIN}/${s3Key}` 直リンクで private だと表示不可）
> - **資格情報分離**（`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` を S3クライアントにだけ注入し、Bedrockと競合させない）
> - **本番混入防止**（API二重ガード＋CIテスト、`VITE_DEV_AUTH_BYPASS` を本番ビルドに渡さない）
> - **localhost限定バインド**（MinIO/Postgres は compose で `127.0.0.1:`、API は `main.ts` を `app.listen(port, HOST)` に変更し `HOST=127.0.0.1`）
