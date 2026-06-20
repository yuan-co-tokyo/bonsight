# Bonsight カラーパレット仕様書
最終更新: 2026-06-21

採用方向: **墨と苔（Ink & Moss）— モダン・ミニマル**

このドキュメントは Claude Design / 実装にそのまま渡して使う配色仕様。盆栽の写真を主役に据え、
UIは静かな「紙のような余白」に退かせる思想。基調は墨（ink）の無彩色、差し色は苔（moss）の緑を一点。

---

## 設計三原則
1. **写真が主役・UIは脇役。** 背景・チャートは無彩色に寄せ、盆栽写真の色を引き立てる。
2. **長時間でも疲れぬトーン。** 彩度を抑えた自然色。純白より温/灰を含んだ紙色を背景に。
3. **意味の色は別系統。** 業務/健康ステータスは独立した信号色。緑(苔)と「健康=緑」が
   ぶつからぬよう、成功色は苔より明るい別の緑にし、**色だけでなくアイコン形状(✓/!)も併用**して
   色覚多様性に配慮する。

---

## 1. ブランド / ニュートラル（墨スケール ＋ 紙）

| トークン | 用途 | HEX |
|---|---|---|
| `--color-ink` | 主要テキスト・ロゴ・骨格(ヘッダー等) | `#2B2B28` |
| `--color-ink-soft` | 見出し補助・強めの本文 | `#514F49` |
| `--color-text-secondary` | ラベル・補足テキスト | `#777067` |
| `--color-text-tertiary` | 日付・キャプション・最補助 | `#9A938A` |
| `--color-bg` | ページ全体背景（紙灰） | `#F5F4F1` |
| `--color-surface` | カード・パネル前面 | `#FFFFFF` |
| `--color-surface-alt` | 入力欄・淡いサーフェス | `#FAF9F6` |
| `--color-border` | 標準の境界線 | `#E5E3DD` |
| `--color-border-strong` | 強調境界・区切り | `#D6D3CB` |
| `--color-placeholder` | プレースホルダ文字 | `#ADA79D` |

## 2. アクセント（苔 / moss）— 操作要素・ブランド差し色（多用しない）

| トークン | 用途 | HEX |
|---|---|---|
| `--color-accent` | リンク・主ボタン・選択/アクティブ状態 | `#5C7A52` |
| `--color-accent-hover` | ボタンhover・押下 | `#4C6745` |
| `--color-accent-light` | 淡背景（選択行・バッジ地・タグ） | `#E8EEE4` |
| `--color-accent-contrast` | アクセント上の文字（白） | `#FFFFFF` |

- 苔緑は「操作可能・注目してほしい」要素に限定。画面を緑で埋めない（ミニマルの肝）。

## 3. AI アクセント（任意・極少用）— Bonsight の差別化

AI機能（AI診断バッジ・きらめきアイコン等）だけに、墨/苔とは異なる**控えめな金(琥珀)**を一点。
「洞察(insight)」の象徴。ミニマルを壊さぬよう**画面に1〜2箇所まで**。不要なら苔＋アイコンで代替可。

| トークン | 用途 | HEX |
|---|---|---|
| `--color-ai` | AI専用要素（診断バッジ・AIアイコン） | `#B0863F` |
| `--color-ai-light` | AI要素の淡背景 | `#F2EAD8` |

## 4. ステータス信号色（淡背景＋濃文字＋境界線のバッジ）

バッジ様式: `font-size:11–12px; font-weight:600; padding:3px 11px; border-radius:999px`。
AI健康フラグは 健康=success / 注意=warning / 危険=danger に対応。**アイコン形状も併用**。

| ステータス | 用途 | bg | text | border |
|---|---|---|---|---|
| success | 健康・成功・継続 | `#E5EFE3` | `#3E7A47` | `#BCD7B5` |
| progress | 進行中・対応中 | `#E7EEF3` | `#3A6A8A` | `#BFD3E0` |
| pending | 確認待ち・保留 | `#F3ECDA` | `#8A6B22` | `#E0CE9C` |
| warning | 要対応・注意 | `#F4E7DC` | `#9C551F` | `#E4BE9C` |
| danger | 危険・エラー・失効 | `#F3E1DE` | `#9E3B33` | `#E0B0AA` |
| neutral | 非アクティブ・対象外 | `#EDEBE6` | `#6B645B` | `#DAD6CD` |

- 成功色 `#3E7A47`(やや青寄りの明るい緑)は、苔アクセント `#5C7A52`(オリーブ寄り)と意図的に色相をずらし、
  「ブランド緑」と「健康=緑」の混同を避けている。

---

## 5. CSS変数（実装用 `:root`）

```css
:root {
  /* ブランド / ニュートラル（墨 + 紙） */
  --color-ink: #2B2B28;
  --color-ink-soft: #514F49;
  --color-text-secondary: #777067;
  --color-text-tertiary: #9A938A;
  --color-bg: #F5F4F1;
  --color-surface: #FFFFFF;
  --color-surface-alt: #FAF9F6;
  --color-border: #E5E3DD;
  --color-border-strong: #D6D3CB;
  --color-placeholder: #ADA79D;

  /* アクセント（苔） */
  --color-accent: #5C7A52;
  --color-accent-hover: #4C6745;
  --color-accent-light: #E8EEE4;
  --color-accent-contrast: #FFFFFF;

  /* AIアクセント（任意・極少用） */
  --color-ai: #B0863F;
  --color-ai-light: #F2EAD8;

  /* ステータス信号色 */
  --status-success-bg: #E5EFE3; --status-success-text: #3E7A47; --status-success-border: #BCD7B5;
  --status-progress-bg: #E7EEF3; --status-progress-text: #3A6A8A; --status-progress-border: #BFD3E0;
  --status-pending-bg: #F3ECDA;  --status-pending-text: #8A6B22;  --status-pending-border: #E0CE9C;
  --status-warning-bg: #F4E7DC;  --status-warning-text: #9C551F;  --status-warning-border: #E4BE9C;
  --status-danger-bg: #F3E1DE;   --status-danger-text: #9E3B33;   --status-danger-border: #E0B0AA;
  --status-neutral-bg: #EDEBE6;  --status-neutral-text: #6B645B;  --status-neutral-border: #DAD6CD;
}
```

---

## 6. タイポグラフィ（推奨）
- **UI本文/ラベル**: `Noto Sans JP`（weights 400/500/600/700）。`font-family: 'Noto Sans JP', sans-serif`
- **任意の見出し演出**: 静かなギャラリー感を出すなら、ヒーローやセクション見出しだけ
  `Noto Serif JP` を少量併用可（ミニマルを壊さぬ範囲で）。基本はサンセリフで統一。
- スケール目安: ページタイトル 20–24/700、セクション見出し 16/700、本文 13–15、ラベル/補助 11–13。

## 7. 余白・角丸・影（ミニマル指針）
- **余白広め**: コンテンツ padding 28–40px、カード padding 20–26px、グリッド gap 20–24px。
- **角丸**: カード 12–14px、入力/ボタン 8–10px、バッジ 999px、アバター/円要素 50%。
- **影は最小**: 原則ボーダーで分離。影を使う場合もごく淡く（例 `0 1px 2px rgba(43,43,40,0.04)`）。
- focus リング: `0 0 0 3px rgba(92,122,82,0.15)`（苔アクセントの淡い輪）。

## 8. 使用ガイド
- `ink` はテキストと骨格（ヘッダー/ナビ）に。本文エリアの大面積を緑で塗らない。
- `accent`(苔) はボタン・リンク・選択中タブ・アクティブ表示に限定。
- `ai`(金) は AI 機能のサインのみ。画面に1〜2箇所まで。多用すると安っぽくなる。
- 背景は `bg`(ページ) と `surface`(カード) の2段で奥行きを出す。写真は `surface` の上に置き映えさせる。
- ステータスは「淡背景＋濃文字＋境界線」のバッジで。色だけに頼らずアイコン形状も併用。

## 9. ダークモード（将来・任意）
Phase1 はライトのみで可。将来対応するなら、`bg`→`#1E1E1B`、`surface`→`#27261F`、
`ink`→`#EDEBE6`、`accent` は彩度を保ちつつ明度を上げる(`#8FB07E` 等)、で同思想を反転する。
