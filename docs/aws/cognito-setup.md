# Amazon Cognito Dev環境セットアップ手順

## 重要: dev用と本番用は必ず別のUser Poolを作成すること

## 1. User Pool の作成 (AWSコンソール)

1. AWSコンソール → Cognito → 「ユーザープールを作成」
2. 認証プロバイダ設定:
   - Cognitoユーザープール: ✓
   - サインインオプション: メールアドレス
3. パスワードポリシー: デフォルト（8文字以上）
4. MFA: 任意（開発環境は無効でも可）
5. ユーザープール名: `bonsight-dev`
6. 作成後、メモ: **User Pool ID** (ap-northeast-1_XXXXXXXXX 形式)

## 2. App Client の作成

1. 作成したUser Pool → 「アプリケーション」→「アプリクライアントを追加」
2. アプリクライアント名: `bonsight-web-dev`
3. **「クライアントシークレットを生成しない」を選択** (public client / SPA向け)
4. 認証フロー:
   - ALLOW_USER_SRP_AUTH: ✓
   - ALLOW_REFRESH_TOKEN_AUTH: ✓
5. OAuthフロー: **Authorization code grant** ✓
6. OAuth スコープ: openid ✓ / email ✓ / profile ✓
7. コールバックURL: `http://localhost:5173/`
8. サインアウトURL: `http://localhost:5173/`
9. 作成後、メモ: **App Client ID**

## 3. Hosted UI ドメインの設定

1. User Pool → 「アプリケーション」→「Hosted UI」
2. Cognitoドメインを選択: `bonsight-dev.auth.ap-northeast-1.amazoncognito.com` 等
3. メモ: **Hosted UI ドメイン** (https://bonsight-dev.auth.ap-northeast-1.amazoncognito.com)

## 4. CLI で作成する場合 (代替手順)

```bash
# User Pool 作成
aws cognito-idp create-user-pool \
  --pool-name bonsight-dev \
  --region ap-northeast-1 \
  --auto-verified-attributes email

# App Client 作成（シークレットなし）
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name bonsight-web-dev \
  --no-generate-secret \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --callback-urls '["http://localhost:5173/"]' \
  --logout-urls '["http://localhost:5173/"]' \
  --supported-identity-providers COGNITO \
  --region ap-northeast-1
```

## 5. 控えておく値

| 変数 | 値 | 用途 |
|------|-----|------|
| VITE_COGNITO_USER_POOL_ID | ap-northeast-1_XXXXXXXXX | web |
| VITE_COGNITO_CLIENT_ID | xxxxxxxxxxxxxxxxxxxxxxxxxx | web |
| VITE_COGNITO_DOMAIN | https://bonsight-dev.auth.ap-northeast-1.amazoncognito.com | web |
| COGNITO_USER_POOL_ID | ap-northeast-1_XXXXXXXXX | api (JWT検証) |
| COGNITO_CLIENT_ID | xxxxxxxxxxxxxxxxxxxxxxxxxx | api |
| AWS_REGION | ap-northeast-1 | api |

## 注意事項
- App Client ID はブラウザに公開される（シークレットなしのため安全）
- .env ファイルには実値を入れて gitignore すること
- 本番用 User Pool は必ず別途作成（本開発用と共有しない）
