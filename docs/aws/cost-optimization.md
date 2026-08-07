# Bonsight AWS 運用コスト最適化 提案

> 目的: 現行の本番AWS構成は低トラフィック（~10ユーザー / AI診断 月~100回）に対して固定費が過大。
> 「使っていなくても消えない固定費」を極力ゼロに近づける構成へ移行する。
> 本書は (1) 現状分析、(2) 削減の考え方、(3) 推奨構成と移行手順、(4) 代替案比較、
> (5) 現行構成の停止・撤去手順、(6) 再開手順、をまとめる。
>
> 関連資料: [`production-deploy.md`](../deploy/production-deploy.md) / [`cost-estimate.md`](./cost-estimate.md)

---

## 1. 現状構成とコスト内訳

現行構成（CDK: `infrastructure/lib/*`）。

```
[ユーザー]
   │
   ├─ Web:   S3 + CloudFront (BonsightWebStack)          静的SPA
   ├─ Media: S3 + CloudFront (BonsightMediaStack)        画像配信
   │
   └─ API:   App Runner (BonsightApiStack)  ── VPCコネクタ(プライベートサブネット) ──┐
                                                                                    │
                        VPC (BonsightDbStack, maxAzs:2, natGateways:1)              │
                          ├─ NAT Gateway ×1  ← Bedrock/Cognito JWKS/S3 への外向き通信 │
                          └─ RDS PostgreSQL db.t4g.micro (単一AZ, プライベート) ←────┘
   認証: Cognito (マネージド・無料枠)
   AI:  Bedrock (jp.anthropic.claude-*)  従量課金
   課金通知: Lambda + EventBridge (BonsightBillingStack)  ほぼ無料
```

### 月額コスト内訳（ap-northeast-1・低トラフィック想定）

以下は概算。東京リージョンのNAT Gatewayは時間料金だけで約`$0.062 × 730時間 ≒ $45/月`となり、
別途データ処理・データ転送・Public IPv4料金が発生し得る。実施判断前にCost Explorerで直近30〜90日の
サービス別・Usage Type別実績と照合する。参考: [Amazon VPC pricing](https://aws.amazon.com/vpc/pricing/)

| サービス                       |          稼働時 |               停止時 | 性質                | 備考                                                                             |
| ------------------------------ | --------------: | -------------------: | ------------------- | -------------------------------------------------------------------------------- |
| **NAT Gateway ×1**             |       **~$45+** |            **~$45+** | 🔴 固定費・停止不可 | 時間料金のみで約$45。データ処理・Public IPv4等は別。一時停止機能なし（削除のみ） |
| **RDS db.t4g.micro**           |            ~$13 | ~$3 (ストレージのみ) | 🟠 準固定費         | 通常stopは最大7日で自動再起動                                                    |
| **App Runner**                 |         ~$10-25 |        ~$0 (pause可) | 🟢 変動費           | pauseで停止可                                                                    |
| Bedrock                        |          ~$5-15 |                   $0 | 🟢 従量課金         | 使った分だけ                                                                     |
| S3 + CloudFront ×2             |             ~$2 |                  ~$2 | 🟢 ほぼ無料枠       |                                                                                  |
| Cognito / Lambda / EventBridge |             ~$0 |                  ~$0 | 🟢 無料枠           |                                                                                  |
| **合計**                       | **~$75-105/mo** |         **~$50+/mo** |                     |                                                                                  |

### 問題点（コストの主犯）

1. **NAT Gateway が最大の固定費（月$45前後+従量料金）で、しかも「止められない」。**
   App Runner を停止しても、RDS を停止しても、NAT Gateway は課金され続ける。
   停止時でも月$50前後以上かかるのはこれが原因。
2. **RDS が 24時間常時起動。** 低頻度アクセスに対して割高。通常stopも7日で自動復帰する。
3. **VPC / NAT が必要な理由は「App Runner をVPCに入れているから」。**
   App RunnerのVPCコネクタは _全ての外向き通信_ をVPC経由に強制する（egress は VPC か PUBLIC の二択で、部分適用不可）。
   そのため Bedrock・Cognito JWKS 取得・S3 といったインターネット向け通信にも NAT Gateway が必須になっている。
   VPCに入れている唯一の理由は **プライベートサブネットのRDSに到達するため** だけ。

> **結論**: 「App Runner を VPC から出す（＝RDSをVPC外の公開TLSエンドポイントにする）」だけで、
> VPCコネクタとNAT Gatewayが丸ごと不要になり、**最大の固定費が消える。**

---

## 2. 削減の基本方針

低トラフィックのサービスでは、常時発生する固定費をなくし、無料枠・従量課金・必要時停止を組み合わせる。
具体的には次の3つを狙う。

1. **NAT Gateway を撤去する** … 最大の固定費。App RunnerをPUBLIC egressにすれば不要。
2. **DB を「常時起動の固定費」から外す** … マネージドServerless Postgres（従量/無料枠）へ。
3. **API のアイドルコストを下げる** … App Runner はアイドルでも最小課金があるため、
   必要なら Lambda 化で完全なScale-to-Zeroも選べる（本書では段階案として提示）。

Web / Media（S3+CloudFront）・Cognito・課金通知Lambda は既に十分安いので**そのまま維持**する。

---

## 3. 推奨構成 — Plan A: 「脱VPC」サーバレス構成

**App Runner を PUBLIC egress にし、DBをVPC外のマネージドServerless Postgresへ移す。**
VPC・VPCコネクタ・NAT Gateway・RDS をまとめて撤去する。

```
[ユーザー]
   ├─ Web:   S3 + CloudFront          （変更なし）
   ├─ Media: S3 + CloudFront          （変更なし）
   └─ API:   App Runner (PUBLIC egress, VPCなし)
                 ├─ Bedrock       → インターネット直（NAT不要）
                 ├─ Cognito JWKS  → インターネット直（NAT不要）
                 ├─ S3            → インターネット直（NAT不要）
                 └─ DB            → マネージドServerless Postgres の公開TLSエンドポイント
```

### DBの選択肢

`DATABASE_URL` は既に SSM SecureString パラメータ（`/bonsight/prod/DATABASE_URL`）で
外部注入されている（`bonsight-api-stack.ts` の `runtimeEnvironmentSecrets`）。
**接続文字列を差し替えるだけ**でDBバックエンドを変更でき、アプリコード（Prisma）は無変更でよい。

| 選択肢                                               |                             月額 | 長所                                                             | 短所                                                                                                 |
| ---------------------------------------------------- | -------------------------------: | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Supabase (Postgres, 東京 `ap-northeast-1`)** ★推奨 |        $0（Free） / $25〜（Pro） | **東京リージョン有**、IPv4対応Session pooler、管理UI、Prisma互換 | AWS外の3rdパーティ。Freeは低活動状態が7日続くと停止し、復帰はStudioから手動操作。Proは自動停止しない |
| Neon (Serverless Postgres)                           |             $0（Free）〜従量課金 | 自動Scale-to-Zero、接続プーラ、Prisma互換                        | **東京リージョンが無い**（最寄りはSingapore `ap-southeast-1`）ためレイテンシ・データ所在地で不利     |
| Aurora Serverless v2 (auto-pause)                    | ACU・ストレージ・I/O等の従量課金 | AWS内完結・東京リージョン                                        | 安全なプライベート接続にはVPC構成が必要。RDS Proxyはauto-pauseと両立しない（後述 Plan B）            |

> **推奨は Supabase Free/Proプラン（東京リージョン `ap-northeast-1`）**。
> Neonは東京リージョンが無く最寄りがSingaporeになるため、レイテンシ（App Runner=東京との往復）と
> データ所在地の観点でSupabaseが優位。Prismaスキーマは原則そのまま利用できるが、
> データ移行、専用ロールの権限設定、Secrets Managerの接続文字列更新が必要。
> AWS内完結が必須の場合は、Plan Bをそのまま採用せず、VPC Endpointを含むネットワーク費用まで再設計・再試算する。
>
> 補足: Supabase Free は低活動状態が7日続くとプロジェクトが停止し、**アクセスだけでは復帰せず、
> Supabase Studioから手動で Resume する必要がある**。常時安定稼働と日次バックアップが必要ならPro（$25/mo〜）を採用する。
>
> 公式資料: [利用可能リージョン](https://supabase.com/docs/guides/platform/regions) /
> [接続方式](https://supabase.com/docs/guides/database/connecting-to-postgres) /
> [Freeプロジェクトの停止](https://supabase.com/docs/guides/platform/free-project-pausing) /
> [料金](https://supabase.com/pricing)

### コスト試算（Plan A）

| サービス                                |             月額 |
| --------------------------------------- | ---------------: |
| App Runner（低トラフィック・pause併用） |           ~$5-15 |
| Supabase Free                           |               $0 |
| Bedrock（従量）                         |           ~$5-15 |
| S3 + CloudFront + Cognito + Lambda      |              ~$2 |
| **合計（Free）**                        | **~$12〜$32/mo** |
| Supabase Proを採用する場合の追加固定費  |    **+$25/mo〜** |

**現行 ~$75-105/mo → Freeなら ~$12-32/mo、Proなら ~$37-57/mo。**
いずれもNAT GatewayとRDSの固定費を撤去できる。FreeでApp Runnerをpauseし、Bedrockを使わない期間は
AWS側を**ほぼ$2/mo（S3/CloudFront等）**まで下げられる。ProはApp RunnerをpauseしてもSupabaseの$25/mo〜が残る。

### 移行手順（Plan A）

前提: **既存データの移行は行わない**（まだ本格利用しておらず、ゼロから作り直して問題ない方針）。
新DBは空の状態で用意し、スキーマは Bonsight コンテナ起動時の `prisma migrate deploy` で自動作成される
（`packages/api/Dockerfile` のCMDで実行）。旧RDSのデータは撤去時に破棄する。

#### A-1. 移行先DB（Supabase）を用意する

1. Supabase で **Region = Tokyo (`ap-northeast-1`)** を選んでプロジェクトを新規作成（**空DBでよい**）。
2. Supabase SQL Editorで、アプリからデフォルトの`postgres`ロールを使わないためのPrisma専用ユーザーを作成する。
   パスワードはパスワードマネージャー等で生成し、リポジトリや作業ログに残さない。

   ```sql
   create user "prisma" with password '<strong-password>' bypassrls createdb;
   grant "prisma" to "postgres";
   grant usage, create on schema public to prisma;
   grant all on all tables in schema public to prisma;
   grant all on all routines in schema public to prisma;
   grant all on all sequences in schema public to prisma;
   alter default privileges for role postgres in schema public grant all on tables to prisma;
   alter default privileges for role postgres in schema public grant all on routines to prisma;
   alter default privileges for role postgres in schema public grant all on sequences to prisma;
   ```

   BonsightはSupabase Data API/Auth/Storageを使わないため、不要なData API（PostgREST）はAPI Settingsで無効化する。
   SQLは[SupabaseのPrisma公式ガイド](https://supabase.com/docs/guides/database/prisma)に準拠する。

3. 接続文字列を控える。**接続方式の選択が重要**（下記の理由）。
   ホスト名は手作業で組み立てず、Supabase Dashboardの`Connect`からSession pooler文字列をコピーする。
   ただしDashboardが出す文字列はデフォルトの`postgres.<project-ref>`ユーザー。
   **コピー後にユーザー名を手順2で作成した独自ロールの `prisma.<project-ref>` へ、パスワードをそのロールのものへ差し替える**
   （独自ロールもSupavisor経由で `<role>.<project-ref>` 形式で接続できる）。

   本プロジェクトは `packages/api/prisma.config.ts` で **`DATABASE_URL` を1本だけ**参照しており、
   コンテナ起動時の `prisma migrate deploy`（`packages/api/Dockerfile` の CMD）と
   アプリ実行時のPrisma Clientが**同じURL**を使う（`directUrl` は未設定）。
   したがって「migrateも運用も両方通る」接続方式を1本選ぶ必要がある。

   → **推奨: Supavisor の Session mode（ポート 5432）を `DATABASE_URL` に使う。**
   - Session modeはIPv4対応（App RunnerのPUBLIC egressから到達可）かつDDL/マイグレーションが通る。
   - 例: `postgresql://prisma.<project-ref>:<pass>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require`
   - ❌ Transaction mode（ポート 6543）を単独の `DATABASE_URL` にしない。
     現構成ではアプリとmigrationが同じURLを使う一方、`prisma migrate deploy`には直結またはSession modeが必要。
   - ❌ 直結ホスト（`db.<ref>.supabase.co:5432`）はFree/新規プロジェクトでIPv6のみのことがあり、
     App RunnerのIPv4 egressから繋がらない場合がある。Supavisor経由（`...pooler.supabase.com`）が無難。

   > 将来、接続数が増えてTransaction modeプーラを使う場合は、アプリ用`DATABASE_URL`を6543へ変更し、
   > マイグレーション用`DIRECT_URL`を5432のSession modeとして追加する。Prisma 7では
   > `prisma.config.ts`の`datasource.url`を`DIRECT_URL`へ変更し、アプリは現在どおり`DATABASE_URL`を
   > `PrismaPg`へ渡す。低トラフィックの現状ではSession mode 1本で十分。
   >
   > ⚠️ 本プロジェクトの実行経路はPrisma query engineではなく **node-postgres driver adapter（`PrismaPg`、
   > `src/prisma/prisma.service.ts`）**。Transaction mode（6543）でよく使う `?pgbouncer=true` は
   > Prisma query engine向けの指定であり、driver adapterの制御には使わない。
   > 現在の`PrismaPg`初期化では`statementNameGenerator`を指定していないため、名前付きprepared statementは
   > キャッシュされない。アプリ実行時は6543を利用できる可能性があるが、`prisma migrate deploy`には
   > 直結またはSession modeが必要なので、6543へ移す場合は前述のとおりURLを分離する。
   > なお `?sslmode=require` は `pg` が解釈するため、現行のdriver adapter経路でも有効。

4. データ投入・スキーマ適用は不要（A-4 のデプロイ時に `prisma migrate deploy` が空DBへ自動でテーブルを作成する）。
   ※ `sslmode=require`（TLS）は必須。DBパスワードは強固なものにする。

#### A-2. SSM の DATABASE_URL を差し替え

```bash
aws ssm put-parameter --profile bonsight-prod --region ap-northeast-1 \
  --name /bonsight/prod/DATABASE_URL --type SecureString --overwrite \
  --value "postgresql://prisma.<project-ref>:<url-encoded-pass>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

パスワード中の予約文字はURLエンコードする。このコマンドの実値をシェル履歴・CIログ・チャットへ残さない。

#### A-3. CDK を「脱VPC」に修正

`infrastructure/lib/bonsight-api-stack.ts` を編集し、App Runner を PUBLIC egress にする。

- `networkConfiguration.egressConfiguration` を `{ egressType: 'DEFAULT' }` に変更（VPCコネクタ参照を削除）。
- `CfnVpcConnector`・`apiVpcConnectorSecurityGroup`・`DbIngressFromApiVpcConnector` の定義を削除。
- `bin/infrastructure.ts` から `apiStack.addDependency(dbStack)` と
  `vpc/apiSecurityGroup/dbSecurityGroup` の受け渡しを削除。
- **この時点では`BonsightDbStack`の生成を残す。** A-5で`cdk destroy`するには、CDKアプリ内に
  対象Stackが存在している必要がある。DbStackの生成とimportを消すのはdestroy完了後。
- `bonsight-api-stack.ts` の `props` から `vpc/apiSecurityGroup/dbSecurityGroup` を除去。

> 参考（変更の要点。実際の適用時は型定義も合わせて修正すること）:
>
> ```ts
> // before
> networkConfiguration: {
>   egressConfiguration: { egressType: 'VPC', vpcConnectorArn: vpcConnector.attrVpcConnectorArn },
> },
> // after（VPCコネクタ・SGごと削除し、公開egressに）
> networkConfiguration: {
>   egressConfiguration: { egressType: 'DEFAULT' },
> },
> ```

Bedrock/S3/SSM を叩く IAM（instanceRole）はそのまま維持する（egress方式が変わるだけで権限要件は不変）。

#### A-4. デプロイと動作確認

```bash
cd infrastructure
npx cdk deploy BonsightApiStack-prod -c env=prod --profile bonsight-prod
```

- ログイン（Cognito JWKS取得）が通る
- 盆栽一覧・詳細（DB接続）が表示される
- 画像アップロード（S3 presigned）が動く
- AI診断（Bedrock）が動く
- App Runnerのapplication logに`prisma migrate deploy`成功が記録されている
- App Runnerを再起動してもSupabaseへ再接続できる

#### A-5. 旧VPC/NAT/RDS を撤去

Plan A の効果は旧リソース削除で初めて確定する。**§5「レベル2-A: Plan A移行後のDbStack撤去」**に従う。
この段階では、新構成へ更新済みのApiStackやWeb/Media/Billing Stackをdestroyしない。

---

## 4. 代替案の比較

| 観点             | Plan A: 脱VPC + Supabase(東京) ★推奨       | Plan B: AWS内完結 + Aurora Serverless v2                     | Plan C: 単一EC2 all-in-one                |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------- |
| 概要             | App Runner(PUBLIC) + Supabase(東京)        | App Runner(VPC) + Aurora(private) + NATまたはVPC Endpoint    | t4g.micro 1台にDocker(API+Postgres+Caddy) |
| 固定費(アイドル) | Free: ~$2 / Pro: ~$27〜                    | ストレージに加えNATまたはInterface Endpointの固定費          | ~$6-10/mo（EC2常時起動）                  |
| 稼働時目安       | Free: ~$12-32 / Pro: ~$37-57               | ACU・ストレージ・I/O・ネットワーク構成に依存するため要再試算 | ~$8-12/mo                                 |
| AWS内完結        | ✕（DBが3rdパーティ・ただし東京リージョン） | ◎                                                            | ◎                                         |
| 自動休止         | Freeは停止するが復帰は手動 / Proは停止なし | Auroraは0 ACU対応版でauto-pause可。App Runnerのpauseは手動   | ✕（常時起動）                             |
| 運用負荷         | 低（マネージド・管理UIあり）               | 中〜高（Auroraとネットワーク設計が必要）                     | 高（OS/パッチ/バックアップ自前）          |
| 移行の容易さ     | ◎（DATABASE_URL差し替え中心）              | △（VPC/NATまたはEndpointを含む再設計）                       | △（構成総入れ替え）                       |
| セキュリティ注意 | TLS、専用DBロール、3rdパーティ審査が必要   | Auroraはprivate endpointを維持する                           | SG/鍵管理を自前で厳格に                   |

補足:

- **Plan B の注意**: App RunnerのPUBLIC egressには固定送信元IPがないため、公開AuroraのSGをApp Runnerだけに
  制限できない。本書では公開Aurora構成を採用しない。RDS ProxyもVPC外からアクセスできず、Auroraへの接続を
  維持してauto-pauseを妨げるため、この用途の解決策にならない。AWS内完結が必要ならApp RunnerのVPC接続を維持し、
  NAT Gatewayまたは必要なVPC Endpointを設計して総額を再計算する。
  参考: [RDS Proxyの制約](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html) /
  [Aurora auto-pauseの制約](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html)
- **Plan C** はコスト最小級だが、TLS証明書・OSパッチ・DBバックアップ・監視を全て自前運用する必要があり、
  個人〜極小規模で運用工数を許容できる場合の選択肢。

### さらに削るなら（Plan A+: API を Lambda 化）

App Runner はアイドルでも最小のプロビジョニング課金がある。トラフィックが本当に少なければ、
NestJS を Lambda（`@codegenie/serverless-express` 等のアダプタ）+ Function URL / API Gateway 化すると
**完全なScale-to-Zero**になり、アイドルコストが実質ゼロになる。ただしコールドスタートと
アプリ側の改修が発生するため、まずは Plan A で固定費を潰し、必要なら次段で検討する。

---

## 5. 現行AWS構成の停止・撤去手順

用途に応じて次の3種類を使い分ける。

- **レベル1: 一時停止（数日）** … 課金を減らすが構成は残す。ただし **NAT Gatewayは止まらない**ため効果は限定的。
- **レベル2-A: Plan A移行後のDbStack撤去** … 新しいApiStackを残し、旧NAT/RDS/VPCだけを削除する。
- **レベル2-B: 全サービス停止** … ApiStackを含むAWS構成全体を停止・削除する。

> ⚠️ 本書は「既存RDSデータを破棄してよい」という方針を前提とする。**実行直前にサービス責任者の承認を
> Issue等へ記録すること。承認を確認できない場合は削除を中止し、最終スナップショットを取得する。**
> `RemovalPolicy.DESTROY`への変更とDbStackのdestroyは取り消せない。

### レベル1: 一時停止（構成は維持）

```bash
# 1) App Runner を pause
APP_ARN=$(aws apprunner list-services --profile bonsight-prod --region ap-northeast-1 \
  --query "ServiceSummaryList[?ServiceName=='bonsight-prod-api'].ServiceArn" --output text)
test -n "$APP_ARN" && test "$APP_ARN" != "None"
aws apprunner pause-service --service-arn "$APP_ARN" --region ap-northeast-1 --profile bonsight-prod

# 2) RDS を停止（最大7日で自動再起動される点に注意）
DB_ID=$(aws cloudformation list-stack-resources \
  --stack-name BonsightDbStack-prod --profile bonsight-prod --region ap-northeast-1 \
  --query "StackResourceSummaries[?ResourceType=='AWS::RDS::DBInstance'].PhysicalResourceId | [0]" \
  --output text)
test -n "$DB_ID" && test "$DB_ID" != "None"
aws sts get-caller-identity --profile bonsight-prod
aws rds describe-db-instances --db-instance-identifier "$DB_ID" \
  --region ap-northeast-1 --profile bonsight-prod \
  --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Engine]' --output table
aws rds stop-db-instance --db-instance-identifier "$DB_ID" --region ap-northeast-1 --profile bonsight-prod
```

> この状態でも **NAT Gatewayは時間料金だけで月約$45、加えてデータ処理・Public IPv4等が課金継続**。
> 数日の一時停止向け。長期はレベル2へ。

### レベル2-A: Plan A移行後のDbStack撤去

前提はA-4の動作確認完了と、ApiStackからDbStackへのVPC/SG参照がなくなっていること。
**ApiStack、WebStack、MediaStack、BillingStackは削除しない。**

#### 5-A-1. DbStackを削除可能な設定へ変更

`infrastructure/lib/bonsight-db-stack.ts` のRDS定義を一時的に次のように変更する。

```ts
deletionProtection: false,
removalPolicy: cdk.RemovalPolicy.DESTROY,
```

これによりRDS本体とCDKが生成したDB subnet groupをCloudFormation管理下で削除できる。
データ保全が必要になった場合は`DESTROY`へ変更せず、ここで作業を中止する。

#### 5-A-2. 変更内容を確認してDbStackを更新・削除

```bash
cd infrastructure
aws sts get-caller-identity --profile bonsight-prod
npx cdk diff BonsightDbStack-prod -c env=prod --profile bonsight-prod
npx cdk deploy BonsightDbStack-prod -c env=prod --profile bonsight-prod
npx cdk destroy BonsightDbStack-prod -c env=prod --profile bonsight-prod
```

`cdk destroy`完了後に、`bin/infrastructure.ts`から`BonsightDbStack`の生成とimportを削除する。
削除に失敗した場合は手動で別のRDSを削除せず、CloudFormationのstack eventsで失敗した論理リソースを確認する。

### レベル2-B: 全サービス停止

旧構成のまま全サービスを止める場合は、DbStackを参照するApiStackを先に削除する。その後、5-A-1と
5-A-2に従ってDbStackを削除する。Web/Mediaを残せばメンテナンス画面や静的コンテンツは維持できる。

```bash
cd infrastructure
npx cdk destroy BonsightApiStack-prod -c env=prod --profile bonsight-prod

# 任意: 課金通知も止める場合
npx cdk destroy BonsightBillingStack-prod -c env=prod --profile bonsight-prod

# 任意: Web/Mediaも止める場合（S3バケットはRemovalPolicy.RETAINにより残る）
# npx cdk destroy BonsightWebStack-prod   -c env=prod --profile bonsight-prod
# npx cdk destroy BonsightMediaStack-prod -c env=prod --profile bonsight-prod
```

### 撤去後の確認（課金が止まったか）

```bash
# DbStackが存在しないこと（ValidationErrorなら削除済み）
aws cloudformation describe-stacks --stack-name BonsightDbStack-prod \
  --profile bonsight-prod --region ap-northeast-1

# NAT Gateway が残っていないこと
aws ec2 describe-nat-gateways --profile bonsight-prod --region ap-northeast-1 \
  --filter Name=state,Values=available --query 'NatGateways[].NatGatewayId'
# prod専用アカウントで空配列ならOK

# 未解放のElastic IP（NATに紐づいていたもの）がないこと（あると少額課金）
aws ec2 describe-addresses --profile bonsight-prod --region ap-northeast-1 \
  --query 'Addresses[?AssociationId==null].AllocationId'

# prod専用アカウントでRDSが残っていないこと
aws rds describe-db-instances --profile bonsight-prod --region ap-northeast-1 \
  --query 'DBInstances[].DBInstanceIdentifier'
```

Cost Explorerへの反映には時間差があるため、翌日以降にNAT Gateway・RDS・Public IPv4の使用量が増えていないことも確認する。

> 残るリソース: Web/MediaのS3バケットは`RemovalPolicy.RETAIN`。ECRリポジトリはCDKへimportしているため
> Stack管理外、Cognito User Poolは手動作成のためCDK管理外であり、いずれもStack削除では消えない。
> 不要なら、保存データと対象アカウントを確認して個別に削除する。

---

## 6. 再開手順

### レベル1（一時停止）からの再開

前節のリソース取得コマンドを再実行して`DB_ID`と`APP_ARN`を設定してから、DBが利用可能になるのを待ってAPIを再開する。

```bash
aws rds start-db-instance --db-instance-identifier "$DB_ID" --region ap-northeast-1 --profile bonsight-prod
aws rds wait db-instance-available --db-instance-identifier "$DB_ID" --region ap-northeast-1 --profile bonsight-prod
aws apprunner resume-service --service-arn "$APP_ARN" --region ap-northeast-1 --profile bonsight-prod
```

### レベル2（完全撤去）からの再開

- **Plan A へ移行済みの場合**: 通常はApiStackが稼働したままなので再deploy不要。App Runnerをpauseした場合のみresumeする。
  Supabase Freeプロジェクトが停止している場合は、先にSupabase Studioで手動Resumeする。
- **全サービス停止後に旧構成へ戻す場合**: `BonsightDbStack`のimport・生成とApiStackへのVPC参照をコードへ戻し、
  RDSを`deletionProtection: true`・`RemovalPolicy.RETAIN`へ戻してから、`BonsightDbStack`（VPC/NAT/RDS）→
  `DATABASE_URL` を新RDSエンドポイントで更新 → `BonsightApiStack` の順にdeploy。
  データ復元は不要（コンテナ起動時の `prisma migrate deploy` で空DBにスキーマが作られる）。
  （`production-deploy.md` §2 の初回デプロイ手順に準拠）

---

## 7. リスク・注意点

- **NAT Gateway 削除の影響**: 旧構成のままVPC/NATを消すと、App Runner が Bedrock/Cognito/S3 に到達できず
  ログイン・AI診断・画像が動かなくなる。**必ず Plan A（PUBLIC egress化）とセットで撤去**すること。
- **外部公開DBのセキュリティ**: Plan AのSupabase公開エンドポイントでは、
  強固なパスワード + `sslmode=require`（TLS強制）を必須とし、デフォルトの`postgres`ではなくPrisma専用ロールを使う。
  自前RDS/Auroraの公開は送信元をApp Runnerだけに制限できないため、本書では採用しない。
- **Supabase Freeの可用性・バックアップ**: 低活動状態による停止後はStudioからの手動Resumeが必要。
  Freeでは本番向けのバックアップ・可用性を前提にせず、利用者データを保全する段階ではProまたは定期的な
  外部`pg_dump`バックアップへ移行する。
- **データ所在地**: 3rdパーティDBを使う場合、盆栽画像メタデータ・ユーザー情報の保管リージョン要件を確認する
  （東京リージョンを選択）。第三者サービス利用規約・DPA・サブプロセッサも運用開始前に確認する。
- **コスト事故防止**: セルフサインアップ無効化（`production-deploy.md` 記載）とAWS Budgetsアラートを維持する。
  **現行APIにユーザー単位のAI診断レート制限は未実装**なので、セルフサインアップを有効化する前に
  1ユーザー1日N回等の上限を実装する。Bedrockは従量課金のため乱用が最大のコストリスク。
- **段階移行を推奨**: まず Plan A で「NAT撤去＝最大固定費の削減」を確実に取り、
  それでも足りなければ Plan A+（Lambda化）や Plan C を検討する。一度に全部変えない。

---

## 付録: Before / After サマリ

|                    | 現行                         | Plan A（推奨）                                           |
| ------------------ | ---------------------------- | -------------------------------------------------------- |
| API                | App Runner (VPC)             | App Runner (PUBLIC egress)                               |
| DB                 | RDS db.t4g.micro (VPC, 24/7) | Supabase Postgres (東京。Freeは低活動時に停止・手動復帰) |
| ネットワーク       | VPC + NAT Gateway ×1         | VPCなし・NATなし                                         |
| 稼働時月額         | ~$75-105                     | **Free: ~$12-32 / Pro: ~$37-57**                         |
| App Runner pause時 | ~$50+（NATが残る）           | **Free: ~$2 / Pro: ~$27〜**                              |
| 主な削減           | —                            | **NAT ~$45+ + RDS ~$13 を撤去**                          |
