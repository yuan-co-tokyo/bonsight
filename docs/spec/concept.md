# bonsight プロジェクトコンテキスト
最終更新: 2026-06-21

## 基本情報
- **プロジェクトID**: bonsight
- **正式名称（仮）**: Bonsight（Bonsai ＋ Sight/Insight）
- **読み**: ボンサイト（音に「盆栽(ぼんさい)」が生きる造語）
- **パス**: `~/documents/codex_projects/bonsight`（本書は同リポジトリ `docs/spec/concept.md`）
- **ステータス**: 構想段階（実装未着手 / 本書は将軍と殿の合意のまとめ）
- **関連ドキュメント**: 配色仕様 = `docs/design/color-palette-spec.md`

## 概要
盆栽愛好家向けの Web サービス（将来スマホアプリ展開）。一本の盆栽を年単位で育てる
過程を「写真の成長タイムライン」で記録し、AI（Claude Vision）が写真から樹種・健康状態を
診断し世話を助言する。盆栽 × 成長記録 × AI を一語で表す「Bonsight」を旗印とする。

## North Star
「一本の木を、長い年月をかけて育てる」という盆栽の本質に、成長記録とAIの洞察を重ねる。
育成の不安（水やり・植替え時期・病害虫・仕立て）をAIが支え、写真の年輪のような積み重ねが
愛着とリピート利用を生む——個人の育成体験を磨き上げることを最優先する。

## ターゲットユーザー
- **段階的に両方**を狙う。Phase1のMVPは初心者・ライト愛好家を主対象（AIアドバイス・世話の
  不安解消が刺さる層）。後に本格・上級愛好家向け機能（詳細管理・仕立て提案・コミュニティ）を拡張。

## 機能と性質（殿の5機能の整理）
| # | 機能 | 価値 | 難度 | 投入フェーズ |
|---|---|---|---|---|
| 1 | ログイン | 土台 | 低 | Phase1（Cognito） |
| 2 | 写真・動画アップロード | 核心（成長記録） | 写真=低 / 動画=中 | 写真=Phase1 / 動画=Phase2 |
| 3 | 盆栽の管理（カルテ） | 核心 | 低〜中 | Phase1 |
| 4 | AIによるアドバイス | 最大の差別化・実現性高 | 中 | Phase1（写真診断＋Q&A） |
| 5 | AI画像生成による成長予測 | 一番の"映え"・夢 | 高・要R&D | Phase3 |

## フェーズ計画
- **Phase1（MVP）**: Cognitoログイン(Hosted UI) ＋ 盆栽カルテ ＋ 写真アップロード(S3/presigned)
  ＋ **成長タイムライン** ＋ **AIアドバイス（写真診断＋Q&A）**。データは最初から
  owner/visibility 付きで「コミュニティ対応」にしておく。
- **Phase2**: 世話ログ＆リマインド（水やり/施肥/植替え季節通知）・動画・盆栽の公開閲覧。
- **Phase3**: SNS双方向（いいね/コメント/フォロー）・AI成長/仕立てシミュレーション画像（R&D）。

## 技術スタック（決定事項）
- **言語/フロント**: React + TypeScript + Vite（my_crm の知見を再利用）
- **バックエンド**: NestJS + Prisma（API-first / REST・JSON `/api/v1`）
- **DB**: PostgreSQL（RDS、または Aurora Serverless v2）
- **認証**: **Amazon Cognito**（User Pool / JWT。Phase1は Hosted UI＋メール/パスワードで最短、
  後にソーシャルログイン・独自UIへ拡張）。アプリDBは Cognito の `sub` でユーザーを紐付け、
  認証情報は二重に持たない。
- **メディア**: **S3 ＋ CloudFront(CDN)**。アップロードは **presigned URL** でクライアント直送。
  動画変換は Phase2 で MediaConvert。
- **AI**: **Amazon Bedrock**。
  - 機能4（アドバイス）= Claude Vision。日常診断/Q&A は `anthropic.claude-sonnet-4-6`、
    難しい総合診断のみ `anthropic.claude-opus-4-8`、軽い分類は `anthropic.claude-haiku-4-5`。
    構造化出力で診断をJSON化。**APIキーはサーバ側のみ**。
  - 注: Bedrock は Anthropic の Managed Agents/サーバ側ツール非対応。Claude API + 自前ツール使用で構成。
    将来エージェント機能が要れば Claude Platform on AWS（全機能パリティ・モデルID接頭辞なし）も選択肢。
  - 機能5（成長予測画像）= Bedrock の画像生成モデル（Nova Canvas / Titan Image / Stability）。
    "styling シミュレーション/インスピレーション"と位置づけ Phase3 でR&D。
- **デプロイ**: **AWS**（学習も兼ねる）。計算は ECS Fargate（NestJSコンテナ）が王道。
  IaC は AWS CDK(TypeScript) 推奨。
- **モバイル将来**: **React Native（+Expo）** を推奨（TS継続・型/APIクライアント共有・学習地続き）。
  バックエンドはAPI-firstゆえ100%再利用（ステートレス認証＋presigned URL＋APIバージョニングを担保）。

## ローカル開発：Cognito（方式A・決定）
ローカルでも **実物の dev 用 User Pool を AWS に立て、localhost から繋ぐ**（最も本番に忠実・学習向き）。
完全オフラインのエミュレータ（cognito-local / LocalStack）は Hosted UI を再現できぬため、
自動テストや一時的オフライン作業に限定する。

**AWS側の用意**
- dev用 **User Pool** を1つ作成。控える値: リージョン / User Pool ID / App Client ID / Hosted UIドメイン。
- **App Client は「シークレットなし(public client)」**（ブラウザSPA用。秘密をブラウザに置かない）。
- App Client 設定: OAuthフロー=Authorization code grant / スコープ=`openid` `email` `profile` /
  コールバックURLに `http://localhost:5173/`（Vite既定。localhostはhttp可）/ サインアウトURLも同様。
- 本番用 User Pool とは**必ず分ける**（本番ユーザーを汚さない）。

**フロント（packages/web）= AWS Amplify**
- `pnpm --filter web add aws-amplify`。`Amplify.configure({ Auth: { Cognito: {...} }})` で Hosted UI を利用。
- `.env`（gitignore済）: `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_COGNITO_DOMAIN`。
  redirectSignIn/Out = `http://localhost:5173/`、responseType=`code`、scopes=openid/email/profile。

**バックエンド（packages/api）= aws-jwt-verify（AWS公式）**
- `pnpm --filter api add aws-jwt-verify`。`CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse })`。
- NestJS Guard で `verifier.verify(token)` → `payload.sub` を不変ユーザーIDとしてアプリDBの User に紐付け。
- ローカルでも検証は **JWKS(公開鍵)で署名検証するだけ**でAWS認証情報は不要。`.env`:
  `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` / `AWS_REGION`。

**安全則**: App Client はシークレットなし(public)。`.env` は gitignore 厳守。
バックエンドは必ずサーバ側でJWT検証し、フロントの主張を信用しない。

## データ背骨（ドメインモデル素描）
```
User (Cognito sub / 表示名 / 地域・気候帯 ← 世話アドバイス精度に効く / 好み / 公開プロフィールの種)
  └─ Bonsai 盆栽（カルテ）  ※owner(=sub) と visibility(private既定/将来public・unlisted) を最初から保持
       ├─ 基本: 名前/愛称・樹種・入手日・推定樹齢・由来(実生/挿し木/購入)
       │        鉢情報・仕立て樹形(模様木/直幹/懸崖…)・現在の状態・表紙写真
       ├─ Media 写真/動画（タイムラインの素）: 撮影日・種別・キャプション・S3キー
       ├─ CareLog 世話記録: 水やり/施肥/剪定/針金/植替え/防除（日付・種別・メモ） ※Phase2
       ├─ AIAdvice AI診断履歴: 写真に紐づく診断結果・季節の世話プラン
       └─ GrowthSim 成長/仕立てシミュ画像 ※Phase3
```
- **主役の体験＝「成長タイムライン」**: 盆栽ごとに写真と世話イベントが時系列で縦に連なる年表。

## コミュニティ方針
- **まず個人ツールとして作り、データ構造だけ"コミュニティ対応"にしておく**（owner/visibility、
  公開プロフィールの種）。SNS機能はPhase2（公開閲覧）→Phase3（いいね/コメント/フォロー）で
  作り直しではなく追加で載せる。

## ブランド（Bonsight）
- 語の核: Bonsai ＋ Sight/Insight（AIが樹を見て洞察する）。表記は **Bonsight**（"sight"明示）。
- ロゴ動機: 「目 × 木/葉」——葉や盆栽が眼の形を成す。AI(sight)と自然(bonsai)の融合。
- 配色: **墨と苔（Ink & Moss）モダン・ミニマル**に決定。基調=墨の無彩色＋紙灰背景、差し色=苔緑(`#5C7A52`)一点、AI専用に極少の金(`#B0863F`)。完全仕様＝CSS変数・ステータス信号色・タイポは `docs/design/color-palette-spec.md` が正。
- タグライン案: 和「AIが見守る、あなたの盆栽」/ 英「See your bonsai grow.」
- ドメイン/ハンドル候補（※空き・商標 未確認）: `bonsight.ai`（最有力）/ `.app` / `.com` / `getbonsight.com` / `@bonsight`
- **要対応**: 確定前にドメイン業者＋商標（日本=J-PlatPat / 米=USPTO）で重複確認。

---

## Phase1 画面一覧（Claude Design 用）
> 殿がこの一覧を基に Claude Design で各画面UIを作成する。各画面は「目的／主要要素／状態／データ源」を記す。
> 配色・トーンは `docs/design/color-palette-spec.md`（墨と苔・ミニマル）に準拠。

### S0. ランディング / サインイン入口
- **目的**: 未ログインユーザーにサービスを示し、Cognito の認証へ誘導。
- **主要要素**: ロゴ＋タグライン、「ログイン / 新規登録」ボタン（Cognito Hosted UI へ遷移）、
  サービスの3点訴求（記録・AI診断・成長タイムライン）の簡潔なヒーロー。
- **状態**: 既定 / 認証リダイレクト中。
- **データ源**: なし（静的）。認証本体は Cognito Hosted UI（本アプリ外の画面）。
- **備考**: ログイン/サインアップ画面そのものは Cognito Hosted UI を使うため、Phase1で独自実装は最小。
  ただしブランドを効かせるためランディングは作る。

### S1. ホーム（盆栽一覧 / マイ盆栽）
- **目的**: 自分の盆栽を一覧し、各カルテへ入る起点。
- **主要要素**: 盆栽カードのグリッド（表紙写真・名前/愛称・樹種・最終更新）、
  「＋ 盆栽を登録」プライマリボタン、トップバー（ロゴ・ユーザーメニュー）。
- **状態**: 通常 / **空状態**（1件も無い時の登録誘導）/ ローディング / エラー。
- **データ源**: `GET /api/v1/bonsai`（自ユーザー分）。

### S2. 盆栽 登録 / 編集フォーム
- **目的**: 盆栽カルテの新規作成・編集。
- **主要要素**: 入力項目＝名前/愛称・樹種・入手日・推定樹齢・由来(実生/挿し木/購入)・
  鉢情報・仕立て樹形・状態・表紙写真。保存/キャンセル。
- **状態**: 新規 / 編集 / 保存中 / バリデーションエラー。
- **データ源**: `POST /api/v1/bonsai`・`PATCH /api/v1/bonsai/:id`。

### S3. 盆栽 詳細（カルテ ＋ 成長タイムライン）★主役
- **目的**: 一本の盆栽の全体像と、成長の年表を見る心臓部。
- **主要要素**:
  - ヘッダー: 表紙写真・名前/愛称・樹種・樹齢・樹形などの基本情報、編集導線。
  - アクション: 「写真を追加」「AIに診てもらう」。
  - **成長タイムライン**: 写真（と将来の世話イベント）が撮影日順に縦に連なる年表。各項目に
    サムネ・日付・キャプション。タップで写真ビューア（S6）。
- **状態**: 通常 / 写真0枚の空状態 / ローディング / エラー。
- **データ源**: `GET /api/v1/bonsai/:id`、`GET /api/v1/bonsai/:id/media`。

### S4. 写真アップロード
- **目的**: 盆栽に写真を追加（成長記録の入力点）。
- **主要要素**: 画像選択（将来モバイルでカメラ撮影）、プレビュー、撮影日、キャプション、アップロード。
- **状態**: 選択前 / プレビュー / アップロード中（進捗）/ 完了 / エラー。
- **データ源**: presigned URL を `POST /api/v1/media/presign` で取得 → S3へ直送 → `POST /api/v1/bonsai/:id/media` で登録。

### S5. AI診断 結果
- **目的**: 写真からのAI診断を提示し、カルテに残す。
- **主要要素**: 対象写真、診断結果＝〈樹種確認・健康フラグ(水切れ/根詰まり/病害虫/葉焼け等)・
  仕立て提案・季節の世話ポイント〉、信頼度/注意書き（「参考情報」明示）、「カルテに保存」。
- **状態**: 診断中（ローディング）/ 結果表示 / エラー / 低信頼の注意表示。
- **データ源**: `POST /api/v1/bonsai/:id/advice`（サーバ→Bedrock Claude Vision、構造化出力）。

### S6. AIチャット（Q&A）
- **目的**: 盆栽の世話について会話で相談。
- **主要要素**: チャットUI（ユーザー/AIの吹き出し）、文脈に対象盆栽（樹種・地域・季節）を含める、
  入力欄、送信。可能なら写真添付。
- **状態**: 通常 / 応答待ち（ストリーミング）/ エラー。
- **データ源**: `POST /api/v1/bonsai/:id/chat`（または汎用チャット。サーバ→Bedrock Claude）。

### S7. 写真ビューア（ライトボックス）
- **目的**: 1枚の写真を拡大表示し、前後の写真へ送る。
- **主要要素**: 全画面写真、日付・キャプション、前後送り、「AIに診てもらう」導線。
- **状態**: 表示 / 読み込み中。
- **データ源**: S3(CloudFront)配信URL、`media` メタデータ。

### S8. 設定 / プロフィール
- **目的**: ユーザー情報・アプリ設定の管理。
- **主要要素**: 表示名、**地域/気候帯**（AIアドバイス精度に使用）、（将来）公開プロフィール項目、
  ログアウト、アカウント管理（Cognito）。
- **状態**: 表示 / 編集 / 保存中。
- **データ源**: `GET/PATCH /api/v1/me`、ログアウトは Cognito。

### 横断（全画面共通の状態・要素）
- ローディング / 空状態 / エラーバナーの統一スタイル。
- 共通シェル（トップバー＋ナビ）。ブランド配色・タイポの統一。
- レスポンシブ前提（将来のモバイルを見据え、まずWebで破綻しない範囲）。

---

## 重要な決定事項（要約）
- サービス名 = **Bonsight**（方向性確定。綴り `Bonsight`）。
- ターゲット = 段階的に両方（MVPは初心者寄り）。MVP = 軽め（Phase1範囲）。
- スタック = React/TS + NestJS/Prisma + PostgreSQL、デプロイ AWS、認証 **Cognito**、メディア S3/CloudFront、AI Bedrock。
- ローカルCognito = **方式A**（dev用 User Pool＋Amplify＋aws-jwt-verify）。
- モバイル = 将来 React Native。バックエンドはAPI-firstで再利用。
- AIアドバイス MVP = 写真診断 ＋ Q&A。
- コミュニティ = 個人ツール先行、データは最初からコミュニティ対応、SNSはPhase2/3。
- 配色 = 墨と苔（Ink & Moss）ミニマル。詳細は `docs/design/color-palette-spec.md`。

## 🚨 要対応（殿の判断 / 次アクション）
- [ ] `bonsight.ai` 等ドメイン＆商標（J-PlatPat / USPTO）の空き確認 → 名称最終確定。
- [ ] 本一覧を基に Claude Design で Phase1 画面UIを作成（殿が実施）。
- [ ] UI確定後、本書を更新し、家老へ実装下知（cmd）を発する。
- [ ] （任意）コスト試算（Bedrock 推論・S3/CloudFront・RDS/Fargate）。

## 注意事項
- 本書は構想段階のまとめ。実装はまだ着手しない。決定が変われば即更新する。
- AI診断は「参考情報」であり、誤診で枯らした等のクレーム回避のため免責表示を入れる。
- Bedrock の AIキー・秘密情報はサーバ側に限定。クライアントへ露出させない。
