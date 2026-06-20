# Handoff: Bonsight — Phase1 スマホWeb MVP（S0–S8）

## Overview
Bonsight（Bonsai ＋ Sight/Insight）は盆栽愛好家向けのWebサービス。一本の盆栽を年単位で育てる過程を「写真の成長タイムライン」で記録し、AI（Claude Vision）が写真から樹種・健康状態を診断して世話を助言する。本パッケージは Phase1（MVP）の全9画面（S0–S8）のUIデザインを定義する。ターゲットは**スマホブラウザ**（将来 React Native + Expo へ展開）。

技術スタック（プロジェクト前提）: React + TypeScript + Vite / NestJS + Prisma / PostgreSQL / 認証 = Amazon Cognito（Hosted UI）/ メディア = S3 + CloudFront（presigned URL）/ AI = Amazon Bedrock（Claude）。API は `/api/v1`（REST・JSON）。

## About the Design Files
このバンドル内のファイルは **HTMLで作成したデザインリファレンス**（意図した見た目と挙動を示すプロトタイプ）であり、そのまま本番コードにコピーするものではありません。タスクは、これらのHTMLデザインを**ターゲットのコードベースの既存環境（React + TypeScript + Vite）の確立されたパターン・ライブラリで再現すること**です。デザインは1枚のHTML（`Bonsight.dc.html`）に全9画面を横並びのギャラリーとして収めています。各画面は iPhone 端末フレーム（`ios-frame.jsx`、ステータスバー・Dynamic Island・ホームインジケータの提供のみ）の中に、Bonsight独自のブランドUIを描画しています。**端末フレームは実装不要**（実機がフレームを提供）—フレーム内側のコンテンツのみ実装してください。

## Fidelity
**High-fidelity (hifi)**。最終的な配色・タイポgrafィ・余白・コンポーネント形状・コピーが確定しています。下記のデザイントークンと各コンポーネント仕様に従い、ピクセル単位で再現してください。ただし写真は意図的に**プレースホルダ枠**（斜めストライプ＋monospaceラベル）で表現しています。実装では実画像（S3/CloudFront配信）に差し替えてください。アイコンは軽量なインラインSVG（線アイコン）で、コードベースのアイコンライブラリ（lucide等）の同等アイコンに置換可。

---

## Design Tokens

カラー仕様の正本は同梱の `color-palette-spec.md`。要約:

### Colors
```
/* 墨 + 紙（ニュートラル） */
--color-ink:            #2B2B28;  /* 主要テキスト・骨格 */
--color-ink-soft:       #514F49;  /* 強めの本文 */
--color-text-secondary: #777067;  /* ラベル・補足 */
--color-text-tertiary:  #9A938A;  /* 日付・キャプション */
--color-bg:             #F5F4F1;  /* ページ背景（紙灰） */
--color-surface:        #FFFFFF;  /* カード前面 */
--color-surface-alt:    #FAF9F6;  /* 入力欄・淡サーフェス */
--color-border:         #E5E3DD;  /* 標準境界線 */
--color-border-strong:  #D6D3CB;  /* 強調境界・破線 */
--color-placeholder:    #ADA79D;

/* アクセント（苔）— 操作要素のみ */
--color-accent:         #5C7A52;
--color-accent-hover:   #4C6745;
--color-accent-light:   #E8EEE4;
--color-accent-contrast:#FFFFFF;

/* AIアクセント（金）— 画面に1〜2箇所まで */
--color-ai:             #B0863F;
--color-ai-light:       #F2EAD8;
--color-ai-border:      #E0CE9C;   /* AIバッジ境界 */
--color-ai-text-strong: #8A6B22;   /* AI淡背景上の濃文字 */
--color-ai-dark-glyph:  #D9A94E;   /* 暗背景上のきらめき（S7） */

/* ステータス信号色（淡背景＋濃文字＋境界＋アイコン形状） */
--status-success-bg:#E5EFE3; --status-success-text:#3E7A47; --status-success-border:#BCD7B5;  /* ✓ */
--status-warning-bg:#F4E7DC; --status-warning-text:#9C551F; --status-warning-border:#E4BE9C;  /* ! */
--status-neutral-bg:#EDEBE6; --status-neutral-text:#6B645B; --status-neutral-border:#DAD6CD;
/* progress/pending/danger は color-palette-spec.md 参照 */
```

### Typography
- フォント: `'Noto Sans JP', sans-serif`（weights 400 / 500 / 600 / 700）。全面サンセリフ統一。
- スケール（実測 px）: 画面大タイトル 21–22/700、セクション見出し 15/700、本文 13–13.5、ラベル・補足 11–12/500、最補助・日付 10.5–11、monospaceプレースホルダラベル 9–11。
- 行間（line-height）: 本文 1.55–1.7。

### Spacing / Radius / Shadow
- 画面コンテンツ左右パディング: 16–20px。カード内 padding: 10–16px。グリッド/リスト gap: 14–16px。
- 角丸: カード 14px、入力/ボタン 10px、小要素/サムネ 7–12px、バッジ/ピル 999px、アバター/円 50%。
- 影: 原則ボーダーで分離。影を使う場合もごく淡く `0 1px 2px rgba(43,43,40,0.04)`。
- focus リング（実装時）: `0 0 0 3px rgba(92,122,82,0.15)`。

### 共通パターン
- **写真プレースホルダ**: `repeating-linear-gradient(135deg,#EDEBE6,#EDEBE6 Npx,#F4F2EE Npx,#F4F2EE 2Npx)`（N=6〜9、サイズに応じ）＋ `1px solid #E5E3DD`。中央/左下に monospace ラベル（色 `#9A938A`）。**実装では実画像に置換**。
- **AI診断バッジ**: きらめき（4点星）SVG＋テキスト。`bg #F2EAD8 / text #B0863F / border 1px #E0CE9C`、`font 10.5px/600`、`padding 2px 9px`、`border-radius 999px`、`white-space:nowrap`。
- **ステータスバッジ**: 例「✓ 問題なし」「! 要注意」。色＋**アイコン形状（✓ / !）を必ず併用**（色覚多様性配慮）。`font 11px/600`、`padding 2px 10px`、`border-radius 999px`。
- **きらめき(4点星)SVGパス**: `M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z`（viewBox 0 0 24 24、`fill:#B0863F`）。
- **葉×眼ロゴマーク**: 葉形パス `M12 3C7 8 7 16 12 21C17 16 17 8 12 3Z`（`fill:none; stroke:#2B2B28; stroke-width:1.6`）＋中央に瞳 `circle cx12 cy12 r2.4 fill:#5C7A52`。

### プライマリ/セカンダリボタン
- Primary: `height 44–50px; bg #5C7A52; color #fff; font 13.5–15/600–700; radius 10px; border none`。
- Secondary（アウトライン）: `bg #fff; color #2B2B28; border 1px #D6D3CB; radius 10px`。
- Danger（ログアウト等）: `bg #fff; color #9E3B33; border 1px #E0B0AA`。

---

## 共通シェル

### 下タブバー（グローバルナビ）
3タブ: **ホーム / AI相談 / 設定**。`bg #fff; border-top 1px #E5E3DD; padding 9px 0 24px`（下24pxはホームインジケータ安全域）。各タブ = 縦並び（アイコン23px＋ラベル10px）。アクティブ = `#5C7A52`/700、非アクティブ = `#9A938A`/500。
- ホームアイコン: 家（line, stroke-width 1.8–1.9）。
- AI相談アイコン: 吹き出し＋内部に小さなきらめき（アクティブ時は苔塗り、非アクティブは灰）。
- 設定アイコン: スライダー（2本のトラック＋ノブ円）。
- 表示ルール: タブバーは **S1ホーム / S6 AI相談 / S8設定** に表示（各々が該当タブをアクティブ表示）。**S2・S3・S4・S5・S7 は push 遷移（戻る導線）でタブバー非表示**。

### トップバー
- 一覧/ルート画面: 左にロゴマーク＋`bonsight`（18px/700）、右にアバター（34px円、`bg #E8EEE4`、頭文字）。上部 padding 約58px（ステータスバー回避）。
- push画面: 左に戻るchevron（`< ` stroke 2.4）＋画面タイトル（15px/600）。右に文脈アクション（例「編集」`#5C7A52`/600）。上部 padding 約56px。

---

## Screens / Views

> データ源・状態は各見出しに付記。コピーはデザインに使った実テキスト（差し替え可）。

### S0. ランディング / サインイン入口
- **目的**: 未ログインユーザーにサービスを示し、Cognito認証へ誘導。タブバー無し。
- **データ源**: なし（静的）。認証本体は Cognito Hosted UI（アプリ外画面）。
- **レイアウト**: 縦スクロール。上部ヒーロー（中央寄せ）→ ヒーロー写真プレースホルダ → 3点訴求 → 下部固定の2ボタン＋注記。
- **コンポーネント**:
  - ヒーロー: ロゴマーク54px、ワードマーク `bonsight` 30px/700/letter-spacing .8px、タグライン「AIが見守る、あなたの盆栽」14px `#777067`。
  - ヒーロー写真: `aspect-ratio 5/4`、radius 16px、プレースホルダ枠（ラベル「ヒーロー写真 / 盆栽」）。
  - 3点訴求（各: 38px角丸アイコンタイル＋見出し13.5/600＋説明11.5 `#777067`）: ①「写真で残す」カメラ（苔タイル `#E8EEE4`）②「AIが診る」きらめき（金タイル `#F2EAD8`）③「成長タイムライン」ノード線（苔タイル）。
  - ボタン: 「ログイン」Primary 50px / 「新規登録」Secondary 50px。注記「ログイン・新規登録は安全な認証画面へ移動します」10.5px `#9A938A` 中央。
- **挙動**: 両ボタン → Cognito Hosted UI へリダイレクト。

### S1. ホーム（マイ盆栽一覧）
- **目的**: 自分の盆栽を一覧し各カルテへ入る起点。タブバー＝ホーム アクティブ。
- **データ源**: `GET /api/v1/bonsai`（自ユーザー分）。
- **状態**: 通常 / **空状態**（0件は登録誘導を主役に）/ ローディング / エラー。
- **レイアウト**: トップバー（ロゴ＋アバター）→ 見出し行「マイ盆栽」21/700＋件数 → 2列グリッド（`grid-template-columns:1fr 1fr; gap:15px`）。
- **コンポーネント**:
  - 盆栽カード: `bg #fff; border 1px #E5E3DD; radius 14px; overflow hidden`。上=正方形写真（`aspect-ratio 1/1`、左下にmonospace「PHOTO」白半透明ピル）。下=名前13.5/600・樹種11 `#777067`・更新日10.5 `#9A938A`。タップ→S3。
  - 登録カード（グリッド末尾）: `border 1.5px dashed #D6D3CB; radius 14px; bg #FAF9F6`、苔丸ボタン（38px、`＋`）＋「盆栽を登録」12/600 `#5C7A52`。タップ→S2（新規）。

### S2. 盆栽 登録 / 編集フォーム
- **目的**: カルテの新規作成・編集。push（戻る/保存）。
- **データ源**: `POST /api/v1/bonsai` ・ `PATCH /api/v1/bonsai/:id`。
- **状態**: 新規 / 編集（既存値プリフィル）/ 保存中 / バリデーションエラー。
- **レイアウト**: トップバー = 左「キャンセル」13.5 `#777067` / 中央タイトル「盆栽を登録」15/700 / 右「保存」13.5/700 `#5C7A52`、下に `border-bottom 1px`。本文 = 縦スクロール、各フィールドはラベル（12 `#777067`/500）＋入力。
- **コンポーネント（入力スタイル）**: テキスト/セレクト = `height 46px; bg #fff; border 1px #E5E3DD; radius 10px; padding 0 14px; font 13.5`。textarea = `min-height 74px; padding 11px 14px`。
  - 表紙写真: `aspect-ratio 5/3` の破線アップロードタイル（`border 1.5px dashed #D6D3CB; bg #FAF9F6`）＋カメラアイコン＋「表紙写真を追加」12.5/600 `#5C7A52`。
  - 名前・愛称（text）/ 樹種（text、将来サジェスト）/ 入手日（date、右にカレンダーアイコン）＋推定樹齢（text）の2カラム / 由来（**セグメント**: 実生・挿し木・購入。トラック `bg #FAF9F6 border 1px radius 10px padding 3px`、アクティブ=白カード `border 1px radius 8px` 700）/ 仕立て樹形（select、右に▾）/ 現在の状態・メモ（textarea）。
- **挙動**: 必須=名前・樹種（最低限）。保存→ローディング→S3へ。

### S3. 盆栽 詳細（カルテ ＋ 成長タイムライン）★主役
- **目的**: 一本の盆栽の全体像と成長の年表。push（戻る）。
- **データ源**: `GET /api/v1/bonsai/:id`、`GET /api/v1/bonsai/:id/media`。
- **状態**: 通常 / 写真0枚の空状態 / ローディング / エラー。
- **レイアウト**: トップバー（戻る＋愛称＋「編集」）→ 表紙写真（`aspect-ratio 5/4`、左右マージン16、radius14）→ 基本情報ブロック → アクション2ボタン → 「成長タイムライン」見出し＋枚数/期間 → **カード型タイムライン**（縦積み）。
- **コンポーネント**:
  - 基本情報: 名前22/700、樹種13 `#777067`、情報チップ群（樹齢/樹形/入手。`bg #fff border 1px radius 999px padding 4px 11px font 11.5 white-space:nowrap`）。
  - アクション: 「写真を追加」Primary（＋アイコン）/「AIに診てもらう」Secondary（きらめきアイコン）。各 `flex:1 height 44px gap`。→S4 / →S5。
  - **タイムラインカード**（撮影日降順、`media` 1件＝1カード）: `bg #fff border 1px radius 14px overflow hidden margin-bottom 16px`。上=`aspect-ratio 16/10` 写真。写真左下に日付ピル（白半透明 `bg rgba(255,255,255,.85) font 11/600`）、右下に**該当する場合のみ**AI診断バッジ。下=キャプション13/1.55。タップ→S7（ビューア）。
- **空状態**: 写真0枚時はタイムライン位置に「最初の写真を追加して記録を始めましょう」＋写真追加CTA。

### S4. 写真アップロード
- **目的**: 盆栽に写真を追加（成長記録の入力点）。push（キャンセル）。将来モバイルはカメラ撮影。
- **データ源**: `POST /api/v1/media/presign`（presigned URL取得）→ S3へ直送 → `POST /api/v1/bonsai/:id/media`（登録）。
- **状態**: 選択前 / プレビュー / **アップロード中（進捗バー）** / 完了 / エラー。デザインは「プレビュー（送信前）」状態。
- **レイアウト**: トップバー（キャンセル＋「写真を追加」、右は空）→ 本文（プレビュー＋フィールド）→ 下部固定アップロードバー。
- **コンポーネント**:
  - プレビュー: `aspect-ratio 4/3` 画像（プレースホルダ）。右上に「写真を変更」白ピル `#5C7A52`/600。
  - 撮影日（date、初期=今日）/ キャプション（textarea）。
  - トグル「アップロード後すぐAI診断にかける」: `38×22` ピル型スイッチ（ON=苔 `#5C7A52`、白ノブ18px）。
  - 下部バー: `bg #fff border-top 1px padding 12 20 30`、「アップロード」Primary 50px 全幅。
- **挙動**: アップロード中はボタンを進捗バー（%表示）に置換。完了→S3に新カード追加。トグルON時は完了後S5へ。

### S5. AI診断結果（会話型）
- **目的**: 写真からのAI診断を会話形式で提示し、カルテに残す。S6相談へ自然接続。push（戻る）。
- **データ源**: `POST /api/v1/bonsai/:id/advice`（サーバ→Bedrock Claude Vision、**構造化出力JSON**）。APIキーはサーバ側のみ。
- **状態**: 診断中（ローディング）/ 結果表示 / エラー / 低信頼の注意表示。
- **レイアウト**: トップバー（戻る＋「AI診断」＋きらめき）下に `border-bottom 1px`。本文 = 縦の吹き出し列（`display:flex; flex-direction:column; gap:13px`）。下部固定の保存バー。
- **コンポーネント**（AIからの語りかけとして、上から）:
  1. 対象写真サムネ（右寄せ、120×90、radius 12 12 4 12）= ユーザー側の添付として。
  2. AI吹き出し（左寄せ `bg #fff border 1px radius 14 14 14 4 padding 12 14`）: 「写真を拝見しました。樹種は **ゴヨウマツ（五葉松）** ですね。」＋インライン信頼度バッジ（success系）。
  3. AI吹き出し: 「健康状態をチェックしました：」＋ステータスバッジ群（`flex-wrap gap 6`）＝「✓ 水切れなし」success /「! 根詰まりの兆候」warning /「✓ 病害虫なし」success。
  4. AI吹き出し: 仕立て・季節の世話（来春2〜3月の植替え検討、芽摘みで整える 等）。
  5. 免責ノート（`bg #FAF9F6 border 1px dashed #D6D3CB radius 12`）: 「※ AIによる参考情報です。最終判断はご自身でお願いします。」10.5 `#9A938A`。**必須表示**。
  6. クイック返信チップ（アウトラインピル `border 1px #5C7A52 color #5C7A52`）: 「植替えの手順は？」「芽摘みのコツ」→ タップでS6へ文脈付き遷移。
  - 下部バー: 「この診断をカルテに保存」Primary 全幅 → `AIAdvice` として保存し S3 のタイムラインに紐付け。
- **健康フラグ（構造化出力の想定キー）**: 水切れ / 根詰まり / 葉焼け / 病害虫 をそれぞれ `{level: 'ok'|'caution'|'danger', note}` で受け、success/warning/danger バッジ＋アイコン形状にマップ。

### S6. AI相談（Q&A チャット）
- **目的**: 盆栽の世話を会話で相談。タブバー＝AI相談 アクティブ。
- **データ源**: `POST /api/v1/bonsai/:id/chat`（または汎用チャット。サーバ→Bedrock Claude、**ストリーミング応答**）。
- **状態**: 通常 / 応答待ち（ストリーミング）/ エラー。
- **レイアウト**: トップバー（戻る＋「AI相談」＋きらめき）→ **文脈チップ行**（`bg #FAF9F6 border-bottom 1px`: 対象盆栽サムネ30px＋「五葉松「翁」」＋「· ゴヨウマツ · 東京 · 初夏」）→ メッセージ列（縦スクロール `gap 14`）→ 入力バー → 下タブ。
- **コンポーネント**:
  - AI吹き出し（左、白 `radius 14 14 14 4`）/ ユーザー吹き出し（右、`bg #5C7A52 color #fff radius 14 14 4 14`）。本文13/1.65。max-width 80–82%。
  - 入力バー（`bg #fff border-top 1px padding 10 12`）: 画像添付ボタン（36px円、画像アイコン）＋入力ピル（`bg #F5F4F1 border 1px radius 999 placeholder「メッセージを入力…」`）＋送信ボタン（38px苔円、矢印）。
  - 文脈（樹種・地域・季節）をシステムプロンプトに含める。応答待ちはタイピングインジケータ。

### S7. 写真ビューア（ライトボックス・暗背景）
- **目的**: 1枚を拡大表示し前後送り。push/モーダル。**ダークUI**（端末フレームは dark、ステータスバー白）。
- **データ源**: S3(CloudFront)配信URL、`media` メタデータ。
- **状態**: 表示 / 読み込み中。
- **レイアウト**: 画面背景 `#1A1A17`、文字 `#EDEBE6`。トップバー（左 閉じる×／中央 カウンタ「5 / 12」／右 共有・その他）→ 中央フル写真（`flex:1`、左右端に前後送り丸ボタン）→ 下部オーバーレイ（日付・キャプション・AI導線）。
- **コンポーネント**:
  - 前後ボタン: 40px円 `bg rgba(0,0,0,0.4)`、白chevron。左右端 absolute。
  - 下部: 日付11.5 `rgba(237,235,230,.55)`、キャプション14/1.6 `#EDEBE6`、CTAピル「この写真をAIに診てもらう」（`bg rgba(237,235,230,.12) border 1px rgba(237,235,230,.25) color #EDEBE6`、きらめきは暗背景用 `#D9A94E`）→ S5。
- **挙動**: 左右スワイプ/ボタンで前後の `media` へ。閉じる→S3。

### S8. 設定 / プロフィール
- **目的**: ユーザー情報・アプリ設定の管理。タブバー＝設定 アクティブ。
- **データ源**: `GET/PATCH /api/v1/me`。ログアウトは Cognito。
- **状態**: 表示 / 編集 / 保存中。
- **レイアウト**: 大タイトル「設定」22/700 → プロフィールカード → グルーピングされたリスト（iOS設定風の inset カード）。各グループに小見出し（11.5/600 `#9A938A` letter-spacing .5）。
- **コンポーネント**:
  - プロフィールカード: アバター48px＋表示名15/700＋メール11.5 `#9A938A`＋右chevron。
  - 「プロフィール」グループ（白カード、行間 `border-bottom 1px #EDEBE6`）: 表示名（→将軍）/ **地域・気候帯**（→「東京 · 温暖」）。直下に金きらめき＋注記「地域・気候帯は **AIアドバイスの精度** に使われます。」（`#8A6B22` 強調）。
  - 「アカウント」グループ: アカウント管理（Cognito、chevron）/ 通知（水やり・季節）= **Phase2** neutralバッジで非活性。
  - ログアウト: Danger ボタン全幅。下にバージョン「bonsight v0.1.0 (Phase1)」10.5 `#ADA79D` 中央。

---

## Interactions & Behavior
- **ナビゲーション**: S0→（認証）→S1。S1カード→S3。S1登録カード→S2（新規）。S3「写真を追加」→S4。S3「AIに診てもらう」/ S7 CTA / S4(トグルON完了後)→S5。S5チップ→S6。S3タイムラインカード→S7。下タブ=S1/S6/S8。
- **ローディング**: 一覧/詳細はスケルトン（写真プレースホルダと同系の淡いブロック）。AI診断・チャットは専用ローディング（診断中…／タイピング）。
- **エラー**: 全画面共通の統一エラーバナー（spec: danger 系 `bg #F3E1DE text #9E3B33 border #E0B0AA`、アイコン併用、再試行導線）。
- **空状態**: S1（0件）→登録誘導主役。S3（写真0枚）→最初の1枚CTA。
- **アニメーション/トランジション**: push/popは標準のスライド（control codebase の router transition に委ねる）。ボタン/ピルは hover/active で `--color-accent-hover #4C6745`、focus は苔の淡リング。控えめに。
- **レスポンシブ**: スマホ縦が基本（設計幅 ~402px相当）。コンテンツは中央1カラム、最大幅を設けてタブレット/デスクトップでも破綻しない範囲に。

## State Management
- `auth`: Cognito JWT（`sub`）。未ログイン→S0。
- `bonsaiList`: S1。`GET /api/v1/bonsai`。
- `bonsai(:id)` + `media[]`: S3/S7。`media` は撮影日降順。
- `form(bonsai)`: S2（新規/編集の差分、バリデーション）。
- `upload`: S4（選択ファイル、撮影日、キャプション、進捗%、autoDiagnose トグル）。presign→直送→登録の3段。
- `advice(:photoId)`: S5。構造化JSON（樹種＋信頼度、健康フラグ配列、仕立て、季節）。保存で `AIAdvice` 作成。
- `chat(:bonsaiId)`: S6。メッセージ配列＋ストリーミング、文脈（樹種/地域/季節）。
- `me`: S8（表示名、地域/気候帯）。`PATCH /api/v1/me`。
- 全データは最初から `owner(=sub)` / `visibility`（既定 private）付き（将来コミュニティ対応）。

## Assets
- 画像・写真: **なし**（全てプレースホルダ枠で表現）。実装時に S3/CloudFront 配信の実画像へ差し替え。
- アイコン: 全てインラインSVG（ホーム/吹き出し/スライダー/カメラ/カレンダー/chevron/矢印/共有/閉じる/きらめき(4点星)/葉×眼ロゴ）。コードベースのアイコンライブラリの同等品に置換可。**きらめき・ロゴのパスは Design Tokens 節に明記**。
- フォント: Noto Sans JP（Google Fonts）。
- ブランド配色の正本: 同梱 `color-palette-spec.md`。プロダクト構想の正本: 同梱 `bonsight.md`。

## Files
- `Bonsight.dc.html` — 全9画面（S0–S8）を横並びギャラリーで含むデザインリファレンス（HTMLプロトタイプ）。各画面は `data-screen-label` 属性付き（"S0 ランディング" 等）。Tweaks: `showDesignNotes`（注釈表示）/ `tabLabels`（タブ文字表示）。
- `ios-frame.jsx` — iPhone端末フレーム部品（ステータスバー/Dynamic Island/ホームインジケータの提供のみ）。**実装不要**の参照用。
- `color-palette-spec.md` — カラーパレット仕様（正本）。
- `bonsight.md` — プロジェクト構想・ドメインモデル・画面一覧（正本）。

> 注: `Bonsight.dc.html` は専用ランタイム（support.js）前提のため、ブラウザ単体ではなく**見た目と仕様の参照**として扱ってください。実装は本READMEの仕様に従い、ターゲットコードベースのコンポーネントで再現します。
