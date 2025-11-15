# クイックスタートガイド

最小限の設定で素早くアプリを動かすための手順です。

## 必要なもの

- Node.js 18以上
- PostgreSQLデータベース（または Vercel Postgres / Supabase）
- Google Cloud Consoleのアカウント

## 手順

### 1. Google OAuth 設定（5分）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
4. アプリケーションの種類: **ウェブアプリケーション**
5. 承認済みのリダイレクト URI: `http://localhost:3000/api/auth/callback/google`
6. クライアントIDとシークレットをコピー
7. 「APIとサービス」→「ライブラリ」から「Google Calendar API」を有効化

### 2. 環境変数の設定（2分）

プロジェクトルートに `.env` ファイルを作成:

```bash
# データベース（例: ローカルPostgreSQL）
DATABASE_URL="postgresql://postgres:password@localhost:5432/backlog_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Google OAuth（上記で取得した値）
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**NEXTAUTH_SECRET** の生成:
```bash
openssl rand -base64 32
```

### 3. データベースのセットアップ（2分）

```bash
# Prismaクライアント生成
npm run db:generate

# マイグレーション実行
npm run db:migrate
```

### 4. 起動（1分）

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## データベースの選択肢

### A. ローカルPostgreSQL（開発用）
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb backlog_app

# .env
DATABASE_URL="postgresql://postgres@localhost:5432/backlog_app"
```

### B. Vercel Postgres（本番推奨）
1. Vercelダッシュボードで「Storage」→「Create Database」→「Postgres」
2. 接続情報をコピーして `.env` に設定

### C. Supabase（無料で簡単）
1. [Supabase](https://supabase.com/) でプロジェクト作成
2. 「Project Settings」→「Database」から接続文字列を取得
3. Connection Pooling URLを使用

## トラブルシューティング

### データベース接続エラー
```bash
# PostgreSQLが起動しているか確認
pg_isready

# データベースが存在するか確認
psql -l
```

### Prismaエラー
```bash
# Prismaクライアントを再生成
npm run db:generate

# マイグレーションをリセット
npx prisma migrate reset
```

### Google OAuthエラー
- リダイレクトURIが `http://localhost:3000/api/auth/callback/google` と完全一致しているか確認
- Google Calendar APIが有効化されているか確認

## 次のステップ

1. ログインして最初のプロジェクトを作成
2. タスクを追加
3. Googleカレンダーと同期

詳細は [SETUP.md](./SETUP.md) を参照してください。

