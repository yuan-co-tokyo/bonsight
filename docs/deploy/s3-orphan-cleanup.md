# S3 に残った未参照写真の手動削除

このスクリプトはユーザーが手動で実行するためのものです。既定はドライランで、`--execute` がある場合だけ削除します。本番に対する実行は開発時の確認には含めません。

## 準備

リポジトリのルートで依存関係と Prisma Client を用意します。

```sh
pnpm install --frozen-lockfile
pnpm --filter api exec prisma generate
```

対象は**このシェルで export した環境変数だけ**で指定します。スクリプトは `packages/api/.env` を読み込みません（export し忘れたときに、ローカル開発用の DB やバケットへ黙ってフォールバックするのを防ぐため）。`S3_BUCKET_NAME`・`DATABASE_URL`・`AWS_REGION` のいずれかが未設定なら、何もせずに停止します。本番の値を `.env` に書かないでください。

```sh
aws sso login --profile bonsight-prod
export AWS_PROFILE=bonsight-prod
export AWS_REGION=ap-northeast-1

# 本番バケット名は CDK の出力から取得する
export S3_BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name BonsightMediaStack-prod --region ap-northeast-1 \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
echo "$S3_BUCKET_NAME"

# 本番 DB（Supabase の Session pooler 接続文字列）。画面表示・履歴に残さず入力する（zsh）
read -s "DATABASE_URL?DATABASE_URL: " && export DATABASE_URL
```

実行すると最初に `Target bucket` / `Target database`（パスワードは表示しない）/ `AWS profile` を表示します。意図した本番の値になっていることを必ず確認してください。本番バケット（`bonsight-media-prod-*`）に対して `localhost` などローカルの DB ホストが指定された場合は、全写真を未参照と誤判定する危険があるため停止します。

DB とバケットは必ず同じ環境のものを指定します。スクリプトが検出できるのは「本番バケット × ローカル DB」の組み合わせだけで、それ以外の取り違え（例: 本番バケット × dev の Supabase）は判定できません。

許可するバケット名は `bonsight-media-dev-<12桁のAWSアカウントID>` または `bonsight-media-prod-<12桁のAWSアカウントID>` のみです。対象プレフィックスは `users/` 固定です。対象外の名前やキーはエラーで停止します。必要な権限は対象バケットの `s3:ListBucket`、削除時のみ対象オブジェクトの `s3:DeleteObject`、および DB の対象テーブルの読み取りです。

## 1. ドライラン

```sh
pnpm --filter api cleanup:orphan-s3 --output /tmp/bonsight-orphans-review.json
```

`Bonsai.coverImageKey`、`Media.s3Key`、`PurchaseCheck.photoKeys` のすべてを参照キーとして収集します。S3 の一覧はページングして取得します。参照されていないキーのうち、走査開始時点で最終更新から **24時間を超えたものだけ** が候補です。更新日時が不明なもの・未来のものも削除対象にしません。

標準出力と JSON に、バケット、走査日時、件数、合計バイト数、キー・サイズ・更新日時の一覧、および `users/<所有者>/<種別>/` ごとの件数を出します。JSON ファイルは新規作成専用で、既存ファイルの上書きはしません（アクセス権は所有者のみ）。失敗すると削除を開始せず終了します。

## 2. 結果確認

JSON のバケット・キー・件数を確認し、DB の環境が正しいこと、必要な写真が含まれていないことを確かめます。DB 接続先を間違えると参照中の写真も未参照と判断されるため、確認できなければ実行しないでください。

削除は元に戻せません。削除中は写真のアップロード・登録・変更を止めてください。各削除バッチの直前にも DB 参照を読み直して新たに参照されたキーを除外しますが、DB と S3 にまたがる更新を原子的に停止するものではありません。

## 3. 明示的に削除

```sh
pnpm --filter api cleanup:orphan-s3 --execute --output /tmp/bonsight-orphans-execute.json
```

再走査した結果を表示・保存した後、バケット名と候補件数を提示します。表示内容を確認して `yes` と入力したときだけ削除します。それ以外はキャンセルです。以前の JSON を削除入力として使うことはなく、実行時の候補はドライラン時と異なる場合があります。

承認済みの結果に基づいて確認入力を省略する場合のみ、`--execute --yes` を指定できます。`--yes` 単独では削除しません。対話できない環境で `--execute` のみを指定すると停止します。

最大1000キーずつ削除し、最後に削除成功件数 `deleted`、再参照による除外件数 `skipped`、失敗したキーと理由 `failures` を表示します。部分失敗・通信失敗・削除確認が返らなかったキーは失敗として記録し、終了コードは1です。失敗後は権限などを確認して、再度ドライランから実施してください。DB 照会や S3 一覧取得が失敗した場合も停止します。
