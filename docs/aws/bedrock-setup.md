# Amazon Bedrock モデルアクセス有効化手順

## リージョン選定指針

推奨リージョン: **us-east-1** または **us-west-2**
理由: Claude Sonnet/Opus/Haiku の全モデルが利用可能。ap-northeast-1(東京)は一部モデル未対応の場合あり。
※ 最新のリージョン対応状況は AWS公式ドキュメントで確認すること

## Bonsight で使用するモデル

| 用途 | モデルID | 用途詳細 |
|------|----------|----------|
| 日常診断・Q&A | anthropic.claude-sonnet-4-6 | メイン。バランスが良い |
| 総合診断 | anthropic.claude-opus-4-8 | 難しい診断のみ（コスト高） |
| 軽い分類 | anthropic.claude-haiku-4-5 | 高速・低コスト |

## アクセス有効化手順 (AWSコンソール)

> **【2025年以降 新仕様】** サーバーレス基盤モデルは、初回 API 呼び出し時にアカウント全体で自動有効化される。
> コンソールでの手動有効化（下記「旧仕様」）は不要になった。

### 旧仕様（参考: 2024年以前）

以前は以下の手順でコンソールから手動有効化が必要だった（現在は不要）:

1. AWSコンソール → Amazon Bedrock → 「モデルアクセス」
2. リージョン: us-east-1（推奨）を選択
3. 「モデルアクセスを管理」→ 対象モデルを有効化
4. 利用規約に同意 → リクエスト送信

### Anthropic モデル固有の注意

Anthropic のモデル（Claude 系）は初回利用時に**ユースケース詳細の提出**を求められる場合がある（一度きり）。
提出後、通常は数分以内に承認される。

### Marketplace 配信モデル

AWS Marketplace 経由で提供されるモデルは、権限保持者が一度呼び出すと**アカウント全体で有効化**される。

## 動作確認方法

AWSマネジメントコンソールの Bedrock プレイグラウンド (Chat) でモデルを選択してメッセージを送る、
または AWS CLI / API で InvokeModel を試みることで初回呼び出しが実行される。

## us. 接頭辞のクロスリージョン推論プロファイル

Claude Sonnet 4.6 等の新しいモデルでは、直接モデルID (`anthropic.claude-sonnet-4-6-...`) では
`ResourceNotFoundException` になる場合がある。その場合は `us.` 接頭辞のクロスリージョン推論プロファイル
（例: `us.anthropic.claude-sonnet-4-6-20250514-v1:0`）を使用すること。
利用可能なプロファイルID: https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html

## 有効化 ≠ IAM 権限

モデルアクセスが有効化されていても、呼び出し元の IAM ユーザー/ロールに別途以下の権限が必要:
- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`

詳細は iam-setup.md 参照。有効化だけでは呼び出せないことに注意。

## APIキーは不要

Bedrock は IAMロール/IAMユーザーの権限で呼び出す。
ECS Fargate のタスクロールに最小権限ポリシーを付与すること（`AmazonBedrockFullAccess` は広すぎるため非推奨）。
ローカル開発: IAMユーザーの `~/.aws/credentials` または `AWS_PROFILE` 環境変数を使用。
アクセスキーをコードにハードコードしたり `.env` にコミットしたりしないこと。
詳細は iam-setup.md を参照。
