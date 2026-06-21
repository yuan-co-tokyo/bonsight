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

1. AWSコンソール → Amazon Bedrock → 「モデルアクセス」
2. リージョン: us-east-1（推奨）を選択
3. 「モデルアクセスを管理」→ 以下を有効化:
   - Claude Sonnet 4.6 (anthropic.claude-sonnet-4-6)
   - Claude Opus 4.8 (anthropic.claude-opus-4-8)
   - Claude Haiku 4.5 (anthropic.claude-haiku-4-5-20251001)
4. Anthropicの利用規約に同意（初回のみ）
5. リクエスト送信後、承認まで数分〜数時間かかる場合あり

## APIキーは不要
BedrockはIAMロール/IAMユーザーの権限で呼び出す。
ECS FargateのタスクロールにAmazonBedrockFullAccessを付与すること。
ローカル開発: IAMユーザーの~/.aws/credentials または AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY 環境変数を使用。
ただしAPIキーをコードにハードコードしたり.envにコミットしたりしないこと。
