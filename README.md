# タスク管理アプリ

Googleカレンダーと連携したタスク管理アプリケーションです。プロジェクト別にタスクを管理し、カレンダーと連携して作業時間を自動追跡・分析できます。

## 主な機能

- 🔐 **Google OAuth認証** - Googleアカウントで簡単ログイン
- 📊 **プロジェクト管理** - プロジェクトごとにタスクを整理
- ✅ **タスク管理** - タスクの作成、編集、ステータス管理
- 📅 **Googleカレンダー連携** - カレンダーの予定と自動同期
- ⏱️ **時間追跡** - プロジェクト別の作業時間を自動集計
- 📈 **ダッシュボード** - 週次・月次で時間分析
- 🎨 **カンバンビュー** - 視覚的なタスク管理

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, NextAuth.js
- **データベース**: PostgreSQL, Prisma ORM
- **認証**: NextAuth.js (Google OAuth2.0)
- **外部API**: Google Calendar API
- **デプロイ**: Vercel

## セットアップ

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

### クイックスタート

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd backlog_like_app
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
`.env` ファイルを作成し、必要な環境変数を設定:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ランダムな文字列"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

4. **データベースのセットアップ**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3000 にアクセスしてアプリを確認できます。

## プロジェクト構造

```
backlog_like_app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth.js
│   │   ├── projects/     # プロジェクトAPI
│   │   ├── tasks/        # タスクAPI
│   │   └── calendar/     # カレンダーAPI
│   ├── dashboard/         # ダッシュボードページ
│   ├── projects/          # プロジェクト管理ページ
│   └── calendar/          # カレンダーページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ
│   ├── auth.ts           # NextAuth設定
│   ├── prisma.ts         # Prismaクライアント
│   └── google-calendar.ts # Googleカレンダー連携
├── prisma/
│   └── schema.prisma     # データベーススキーマ
├── types/                # TypeScript型定義
└── docs/                 # ドキュメント
```

## 使い方

1. **ログイン**: Googleアカウントでログイン
2. **プロジェクト作成**: 新規プロジェクトを作成
3. **タスク追加**: プロジェクト内にタスクを追加
4. **カレンダー同期**: Googleカレンダーと同期して作業時間を記録
5. **ダッシュボード確認**: プロジェクト別の時間分析を確認

## Vercelへのデプロイ

### GitHub連携
1. GitHubにリポジトリをpush
2. [Vercel](https://vercel.com/)でインポート
3. 環境変数を設定
4. デプロイ

### CLI
```bash
npm install -g vercel
vercel login
vercel
```

詳細は [SETUP.md](./SETUP.md) を参照してください。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Linter
npm run lint

# Prisma Studio（DB GUI）
npx prisma studio

# マイグレーション作成
npx prisma migrate dev --name <migration-name>
```

## ライセンス

MIT

## サポート

問題が発生した場合は、[Issues](https://github.com/your-repo/issues)で報告してください。
