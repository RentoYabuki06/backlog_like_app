# セットアップガイド

このドキュメントでは、タスク管理アプリの初期設定方法を説明します。

## 1. Google Cloud Console の設定

### 1.1 プロジェクトの作成
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成

### 1.2 OAuth 2.0 認証情報の作成
1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類: **ウェブアプリケーション**
4. 承認済みのリダイレクト URI:
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://your-domain.vercel.app/api/auth/callback/google`
5. クライアントIDとクライアントシークレットをコピー

### 1.3 Google Calendar API の有効化
1. 「APIとサービス」→「ライブラリ」に移動
2. 「Google Calendar API」を検索して有効化

## 2. データベースのセットアップ

### オプション A: Vercel Postgres（推奨）
1. Vercelダッシュボードで「Storage」タブを開く
2. 「Create Database」→「Postgres」を選択
3. データベースが作成されたら、環境変数タブで `DATABASE_URL` を確認

### オプション B: Supabase
1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. 「Project Settings」→「Database」から接続文字列を取得
3. Connection Poolingを有効にした接続文字列を使用（推奨）

### オプション C: ローカル PostgreSQL
```bash
# PostgreSQLをインストール（macOS）
brew install postgresql@14
brew services start postgresql@14

# データベースを作成
createdb backlog_app
```

## 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成します：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/backlog_app?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ランダムな文字列（下記コマンドで生成）"

# Google OAuth
GOOGLE_CLIENT_ID="あなたのGoogle Client ID"
GOOGLE_CLIENT_SECRET="あなたのGoogle Client Secret"
```

### NEXTAUTH_SECRET の生成
```bash
openssl rand -base64 32
```

## 4. データベースマイグレーション

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init

# （オプション）Prisma Studioでデータを確認
npx prisma studio
```

## 5. 開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 6. Vercelへのデプロイ

### 6.1 Vercel CLIでのデプロイ
```bash
# Vercel CLIのインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel
```

### 6.2 GitHub連携でのデプロイ
1. GitHubにリポジトリをpush
2. [Vercel](https://vercel.com/)でプロジェクトをインポート
3. 環境変数を設定:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`（本番URL）
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 6.3 本番環境でのマイグレーション

Vercelダッシュボードで：
1. 「Settings」→「General」→「Build & Development Settings」
2. Build Commandを以下に変更:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

## 7. トラブルシューティング

### Prismaエラー
```bash
# Prismaクライアントを再生成
npx prisma generate

# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset
```

### Google OAuth エラー
- リダイレクトURIが正しく設定されているか確認
- Google Cloud Consoleでカレンダー APIが有効になっているか確認
- スコープが正しく設定されているか確認

### データベース接続エラー
- `DATABASE_URL` が正しく設定されているか確認
- データベースサーバーが起動しているか確認
- ファイアウォール設定を確認（本番環境）

## 8. 使い方

1. **ログイン**: Googleアカウントでログイン
2. **プロジェクト作成**: 「プロジェクト」ページで新規プロジェクトを作成
3. **タスク追加**: プロジェクト詳細ページでタスクを追加
4. **カレンダー同期**: 「カレンダー」ページで「Googleカレンダーと同期」ボタンをクリック
5. **ダッシュボード**: 時間の使い方を分析

## 9. 開発ツール

### Prisma Studio（データベース GUI）
```bash
npx prisma studio
```

### 型チェック
```bash
npm run build
```

### Linter
```bash
npm run lint
```

## サポート

問題が発生した場合は、以下を確認してください：
- 環境変数が正しく設定されているか
- データベースマイグレーションが完了しているか
- Google Cloud Consoleの設定が正しいか

