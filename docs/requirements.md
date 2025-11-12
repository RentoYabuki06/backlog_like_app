# プロジェクト要件定義書: backloライクなタスク管理アプリ

## 1\. プロジェクト概要

Backlogライクな課題管理・プロジェクト管理アプリケーションを構築する。
モダンな技術スタック（T3 Stack / Supabase Stack）を採用し、堅牢かつスケーラブルな設計を目指す。

### 設計方針

- **パフォーマンス重視**: 軽量で高速なユーザー体験を提供
- **モダンなアーキテクチャ**: Next.js App Router、React Server Components を最大限活用
- **スタイリング戦略**: Tailwind CSS + shadcn/ui を採用（Material-UI等のCSS-in-JSライブラリは不使用）
- **型安全性**: TypeScript による厳密な型チェック
- **セキュリティ**: Supabase Row Level Security (RLS) によるデータベースレベルでの権限制御

## 2\. 技術スタック選定

| カテゴリ | 技術・サービス | 備考 |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | SSR/RSCによるパフォーマンス最適化 |
| **Language** | TypeScript | 型安全性による保守性向上 |
| **Styling** | Tailwind CSS | ユーティリティファーストCSS |
| **UI Library** | shadcn/ui | アクセシビリティ対応・カスタマイズ性 |
| **Database / Auth** | Supabase | PostgreSQL, Authentication, Storage, Realtime |
| **Deployment** | Vercel | Next.js最適化・自動デプロイ |
| **Form Management** | React Hook Form + Zod | バリデーション管理 |
| **Drag & Drop** | dnd-kit | カンバンボード実装用 |

### スタイリング方針

本プロジェクトでは**Tailwind CSS + shadcn/ui**を採用し、**Material-UI (MUI)などのCSS-in-JSベースのUIライブラリは使用しない**方針とする。

#### 採用理由

1. **パフォーマンス最適化**
   - Tailwind CSSはビルド時に最適化され、未使用のスタイルが自動削除される
   - ランタイムオーバーヘッドが一切ない
   - バンドルサイズを最小限に抑えられる（~10-30KB vs MUIの~300KB）

2. **Next.js App Router / Server Components との完全な親和性**
   - Server Componentsでそのまま使用可能
   - `'use client'`ディレクティブが不要
   - RSC（React Server Components）のメリットを最大限活用

3. **一貫したスタイリング手法**
   - プロジェクト全体でTailwind CSSのユーティリティクラスに統一
   - CSS-in-JSとの混在による複雑性を回避
   - コードレビューとメンテナンスが容易

4. **dnd-kitとのシームレスな統合**
   - カンバンボードのドラッグ&ドロップUI実装が容易
   - 条件付きスタイリングが直感的
   ```tsx
   className={cn("rounded-lg p-4", isDragging && "opacity-50")}
   ```

5. **コンポーネントの完全な所有権**
   - shadcn/uiのコンポーネントは自プロジェクトにコピーされる
   - カスタマイズが完全に自由
   - ベンダーロックインのリスクがない

6. **モダンなUI/UX**
   - 2024-2025年のWebアプリケーションのトレンドに合致
   - Backlogライクなクリーンでミニマルなデザインに最適
   - Material Designの制約を受けない

#### MUIを採用しない理由

- ❌ Tailwind CSSと併用するとスタイリング手法が混在し、コードベースが複雑化
- ❌ バンドルサイズが大きく、パフォーマンスに悪影響
- ❌ CSS-in-JSのランタイムオーバーヘッド
- ❌ Next.js App Router / Server Componentsとの統合が不完全
- ❌ Material Designの制約により、独自デザインの実現が困難

## 3\. 機能要件

### 3.1 認証機能 (Authentication)

Supabase Authを使用した認証システム:

  * メールアドレス/パスワードによるサインアップ・ログイン
  * GitHub/Google等によるソーシャルログイン（OAuth Providers）
  * セッション管理（JWT Token、Cookie-based）
  * ユーザープロファイル管理（アイコン、表示名）
  * Row Level Security (RLS) によるデータベースレベルのアクセス制御

### 3.2 プロジェクト管理

  * プロジェクトの作成・編集・削除
  * プロジェクトキーの設定（例: `PROJ`）
      * 課題キー（`PROJ-1`）のプレフィックスとなる
  * プロジェクトメンバー管理
      * メンバーの招待・追加・削除
      * 役割（Role）の設定（Admin、Member、Viewer）

### 3.3 課題（タスク）管理

  * **CRUD操作:** 課題の作成、閲覧、更新、削除
  * **課題プロパティ:**
      * 件名 (Subject)
      * 詳細 (Description) - Markdown対応推奨
      * 状態 (Status) - 未対応、処理中、処理済み、完了
      * 優先度 (Priority)
      * 担当者 (Assignee)
      * 開始日 (Start Date) - ガントチャート表示用、オプショナル
      * 期限日 (Due Date) - オプショナル
      * **課題キー:** プロジェクトごとの連番（例: `PROJ-12`）
  * **親子課題（サブタスク）:**
      * 親課題と子課題の紐付け
      * 階層構造の表示（一覧画面でのツリー表示、詳細画面での子課題リスト）
      * *制約事項:* 実装複雑化を防ぐため、階層は「親 \> 子」の2階層までとする（孫課題は作成不可）

### 3.4 表示ビュー

プロジェクトの課題を3つの異なるビューで表示可能にする。

  * **リストビュー:** 
      * 課題を一覧形式で表示（テーブル形式）
      * フィルタリング機能（ステータス、担当者、優先度、期限等）
      * ソート機能（作成日、更新日、期限日、優先度等）
      * ページネーション対応
      * 親子課題のツリー表示
  
  * **ボードビュー (カンバン):**
      * ステータスごとにレーン（列）を分けて表示
      * ドラッグ&ドロップでステータス変更
      * 各カードに課題の基本情報を表示（件名、担当者、期限日、優先度）
      * レーン内でのソート機能
      * dnd-kitを使用した実装
  
  * **ガントチャートビュー:**
      * 時系列で課題のスケジュールを可視化
      * 横軸：時間（日・週・月単位で切り替え可能）
      * 縦軸：課題リスト
      * 表示要素：
          * 課題バー（開始日〜期限日）
          * マイルストーン表示
          * 進捗状況の可視化
          * 親子課題の階層表示
          * 担当者アバター表示
      * インタラクション機能：
          * バーのドラッグ&ドロップで日付変更
          * バーの端をドラッグして期間変更
          * 課題クリックで詳細表示
          * 今日の日付をハイライト
      * Tailwind CSSベースのカスタム実装 または react-gantt-chart 使用

### 3.5 コミュニケーション

  * 課題に対するコメント投稿
  * （オプション）アクティビティログ（「Aさんがステータスを変更しました」等の履歴）

### 3.6 時間管理・分析機能

作業時間を記録・分析し、生産性を可視化する機能。

#### 3.6.1 作業時間の記録（タイムトラッキング）

  * **手動記録:**
      * 課題ごとに作業時間を記録
      * 記録項目：
          * 作業日 (Date)
          * 作業時間 (時間数、例: 2.5時間)
          * 作業内容メモ (オプション)
      * 課題詳細画面から記録を追加・編集・削除
  
  * **簡易タイマー機能（オプション）:**
      * 「作業開始」ボタンでタイマー開始
      * 「作業終了」ボタンで停止し、自動で作業時間を記録
      * 複数課題の同時トラッキングは不可（1つの課題のみアクティブ）

#### 3.6.2 時間分析ダッシュボード

プロジェクトまたはユーザーごとの時間使用状況を可視化。

  * **期間選択:**
      * 今週（月曜〜日曜）
      * 今月（1日〜月末）
      * 先週、先月
      * カスタム期間（日付範囲指定）
  
  * **表示切り替え:**
      * プロジェクト別集計
      * ユーザー別集計
      * 課題別集計
      * ステータス別集計
      * 優先度別集計

#### 3.6.3 可視化チャート

  * **円グラフ（Pie Chart）:**
      * プロジェクト別の時間配分
      * ステータス別の時間配分
      * 優先度別の時間配分
  
  * **棒グラフ（Bar Chart）:**
      * 日別の作業時間推移
      * 週別の作業時間推移
      * ユーザー別の作業時間比較
      * 課題別の作業時間ランキング（Top 10）
  
  * **折れ線グラフ（Line Chart）:**
      * 時系列での作業時間トレンド
      * 複数プロジェクトの比較

  * **ヒートマップ（オプション）:**
      * 曜日×時間帯の作業パターン可視化

#### 3.6.4 サマリー表示

ダッシュボード上部に表示する主要メトリクス：

  * **総作業時間:** 選択期間の合計作業時間
  * **平均作業時間/日:** 選択期間の1日あたりの平均
  * **最も時間を使った課題:** Top 3を表示
  * **最も時間を使ったプロジェクト:** 複数プロジェクト参加時
  * **完了した課題数:** 選択期間内に完了した課題
  * **進行中の課題数:** 現在進行中の課題

#### 3.6.5 レポート機能（オプション）

  * CSVエクスポート機能
  * PDFレポート生成（週次・月次）
  * メールでの定期レポート配信

### 3.7 スクラム/アジャイル開発機能

スクラム開発手法をサポートする機能群。

#### 3.7.1 スプリント管理

  * **スプリントの作成:**
      * スプリント名（例: "Sprint 12"）
      * 開始日・終了日
      * スプリントゴール（目標）の設定
      * 期間（通常1-4週間）
  
  * **スプリントステータス:**
      * 計画中（Planning）
      * 進行中（Active）
      * 完了（Completed）
      * 1つのプロジェクトで同時に進行中のスプリントは1つのみ
  
  * **スプリントへの課題割り当て:**
      * バックログから課題をスプリントに追加
      * スプリント内での課題の優先順位付け
      * ストーリーポイント（見積もり）の設定
      * スプリント中の課題追加・削除
  
  * **スプリント操作:**
      * スプリント開始（Planning → Active）
      * スプリント完了（Active → Completed）
      * 未完了課題の次スプリントへの移動

#### 3.7.2 プロダクトバックログ

  * スプリント未割り当ての課題一覧
  * 優先順位での並び替え（ドラッグ&ドロップ）
  * ストーリーポイントの設定
  * バックログから直接課題作成

#### 3.7.3 バーンダウンチャート

スプリントの進捗を可視化するチャート。

  * **表示要素:**
      * X軸：スプリント期間（日付）
      * Y軸：残作業量（ストーリーポイント or 課題数）
      * 理想線（Ideal Line）：均等な進捗を表す直線
      * 実績線（Actual Line）：実際の残作業量の推移
      * スプリント開始時点の総作業量
      * 現在の残作業量
  
  * **計算方法:**
      * 残作業量 = 未完了課題の合計ストーリーポイント
      * 完了基準：課題のステータスが「完了（done）」
      * 日次で自動更新
  
  * **追加情報:**
      * 完了済み課題数 / 総課題数
      * 完了率（%）
      * 予測完了日（トレンドベース）
      * ベロシティ（過去スプリントの平均完了ポイント）

#### 3.7.4 スプリントボード

スプリント専用のカンバンボード表示。

  * スプリント内の課題のみ表示
  * ステータスごとのレーン
  * ストーリーポイント表示
  * 各レーンの合計ポイント表示
  * ドラッグ&ドロップでステータス変更

#### 3.7.5 スクラムメトリクス

  * **ベロシティ（Velocity）:**
      * 過去数スプリントの完了ストーリーポイントの平均
      * トレンドグラフ表示
  
  * **スプリント完了率:**
      * 完了した課題の割合
      * 完了したストーリーポイントの割合
  
  * **スプリント予実比較:**
      * 計画した課題数 vs 実際に完了した課題数
      * 計画したポイント vs 実際に完了したポイント

#### 3.7.6 ストーリーポイント

  * フィボナッチ数列（1, 2, 3, 5, 8, 13, 21）での設定
  * または Tシャツサイズ（XS, S, M, L, XL）
  * 課題ごとに設定可能（オプショナル）
  * チーム全体の見積もり合意

## 4\. データモデル設計 (Schema Design)

Supabase (PostgreSQL) を使用。主要なエンティティ定義。

### `profiles` (ユーザー)

Supabase Authの`auth.users`テーブルと連携。認証情報を拡張したプロファイル情報。

  - `id` (UUID, PK) - Supabase Auth User IDと紐付け（`auth.uid()`）
  - `username` (Text, Unique) - 表示名/ユーザーネーム
  - `avatar_url` (Text) - プロフィール画像URL
  - `created_at`, `updated_at` (Timestamp)

### `projects` (プロジェクト)

  - `id` (UUID, PK)
  - `key` (Text, Unique) - 例: "MYAPP"
  - `name` (Text)
  - `description` (Text)
  - `owner_id` (UUID, FK -> profiles)
  - `created_at`, `updated_at` (Timestamp)

### `project_members` (プロジェクトメンバー)

プロジェクトへのアクセス権限を管理。

  - `id` (UUID, PK)
  - `project_id` (UUID, FK -> projects)
  - `user_id` (UUID, FK -> profiles)
  - `role` (Text/Enum) - 'admin', 'member', 'viewer'
  - `created_at` (Timestamp)
  - **Unique制約:** (project_id, user_id)

### `tasks` (課題)

自己参照による親子関係を持つ最重要テーブル。

  - `id` (UUID, PK)
  - `project_id` (UUID, FK)
  - `issue_number` (Integer) - プロジェクト内連番
  - `parent_id` (UUID, FK, Self-Reference) - **親課題のID（NULLなら親なし）**
  - `title` (Text)
  - `description` (Text)
  - `status` (Text/Enum) - 'todo', 'in_progress', 'in_review', 'done'
  - `priority` (Text/Enum) - 'low', 'medium', 'high', 'urgent'
  - `assignee_id` (UUID, FK -\> profiles) - Nullable
  - `start_date` (Date) - Nullable、ガントチャート用
  - `due_date` (Date) - Nullable、期限日
  - `story_points` (Integer) - Nullable、ストーリーポイント（1, 2, 3, 5, 8, 13, 21等）
  - `sprint_id` (UUID, FK -> sprints) - Nullable、所属スプリント
  - `backlog_order` (Integer) - Nullable、バックログ内での優先順位
  - `created_at`, `updated_at` (Timestamp)

### `comments` (コメント)

  - `id` (UUID, PK)
  - `task_id` (UUID, FK)
  - `user_id` (UUID, FK)
  - `content` (Text)
  - `created_at`, `updated_at` (Timestamp)

### `time_entries` (作業時間記録)

課題に対する作業時間を記録するテーブル。

  - `id` (UUID, PK)
  - `task_id` (UUID, FK -> tasks)
  - `user_id` (UUID, FK -> profiles)
  - `work_date` (Date) - 作業した日付
  - `hours` (Decimal) - 作業時間（時間単位、例: 2.5）
  - `description` (Text, Nullable) - 作業内容メモ
  - `created_at`, `updated_at` (Timestamp)
  - **Index:** (task_id, user_id, work_date) でパフォーマンス最適化

### `sprints` (スプリント)

スクラム開発のスプリントを管理するテーブル。

  - `id` (UUID, PK)
  - `project_id` (UUID, FK -> projects)
  - `name` (Text) - スプリント名（例: "Sprint 12"）
  - `goal` (Text, Nullable) - スプリントゴール
  - `start_date` (Date) - 開始日
  - `end_date` (Date) - 終了日
  - `status` (Text/Enum) - 'planning', 'active', 'completed'
  - `created_at`, `updated_at` (Timestamp)
  - **制約:** 1つのプロジェクトで同時にactiveなスプリントは1つのみ

### `sprint_snapshots` (スプリントスナップショット)

バーンダウンチャート用の日次データを保存。

  - `id` (UUID, PK)
  - `sprint_id` (UUID, FK -> sprints)
  - `snapshot_date` (Date) - スナップショット日付
  - `remaining_points` (Integer) - 残ストーリーポイント
  - `remaining_tasks` (Integer) - 残課題数
  - `completed_points` (Integer) - 完了ストーリーポイント（累積）
  - `completed_tasks` (Integer) - 完了課題数（累積）
  - `created_at` (Timestamp)
  - **Unique制約:** (sprint_id, snapshot_date)

## 5\. ディレクトリ構成案 (Next.js App Router)

```text
app/
├── (auth)/                 # 認証グループ
│   ├── login/
│   └── signup/
├── (dashboard)/            # アプリケーション本体
│   ├── layout.tsx          # サイドバー等の共通UI
│   ├── page.tsx            # ダッシュボードHOME（個人サマリー）
│   ├── analytics/          # 時間分析ダッシュボード
│   │   ├── page.tsx        # 分析トップ（全体サマリー）
│   │   ├── projects/       # プロジェクト別分析
│   │   └── users/          # ユーザー別分析
│   └── projects/
│       └── [projectId]/
│           ├── page.tsx    # プロジェクト概要
│           ├── list/       # リストビュー（課題一覧）
│           ├── board/      # カンバンボード
│           ├── gantt/      # ガントチャート
│           ├── analytics/  # プロジェクト別時間分析
│           ├── issues/     # 課題操作
│           │   ├── new/    # 新規課題作成
│           │   └── [issueId]/ # 課題詳細（親子表示含む）
│           │       └── time-entries/ # 作業時間記録
│           └── settings/   # プロジェクト設定
└── api/                    # API Routes (Webhook等)
```

## 6\. API設計

### 6.1 API実装アプローチ

  * **Server Actions**: データ変更操作（POST/PUT/DELETE）
  * **Direct Supabase Client**: データ取得操作（GET）- Server Componentsから直接呼び出し
  * **API Routes**: Webhook、外部連携用（必要に応じて）

### 6.2 認証・認可

  * **認証方式**: Supabase Auth（JWT Token）
  * **セッション管理**: Cookie-based（`@supabase/ssr`使用）
  * **認可**: Supabase Row Level Security (RLS) による制御

### 6.3 エンドポイント設計

#### 6.3.1 プロジェクト関連 API

| エンドポイント | メソッド | 説明 | 認証 |
|:---|:---|:---|:---|
| `/api/projects` | GET | プロジェクト一覧取得 | 必須 |
| `/api/projects` | POST | プロジェクト作成 | 必須 |
| `/api/projects/[id]` | GET | プロジェクト詳細取得 | 必須 |
| `/api/projects/[id]` | PATCH | プロジェクト更新 | 必須（オーナーのみ）|
| `/api/projects/[id]` | DELETE | プロジェクト削除 | 必須（オーナーのみ）|
| `/api/projects/[id]/members` | GET | プロジェクトメンバー一覧 | 必須 |
| `/api/projects/[id]/members` | POST | メンバー追加 | 必須（管理者以上）|

**Request Body例（POST `/api/projects`）:**
```json
{
  "key": "MYAPP",
  "name": "マイアプリケーション",
  "description": "プロジェクトの説明"
}
```

**Response例:**
```json
{
  "id": "uuid",
  "key": "MYAPP",
  "name": "マイアプリケーション",
  "description": "プロジェクトの説明",
  "owner_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### 6.3.2 課題（タスク）関連 API

| エンドポイント | メソッド | 説明 | 認証 |
|:---|:---|:---|:---|
| `/api/projects/[projectId]/tasks` | GET | 課題一覧取得（フィルタ・ソート対応）| 必須 |
| `/api/projects/[projectId]/tasks` | POST | 課題作成 | 必須 |
| `/api/tasks/[id]` | GET | 課題詳細取得（子課題含む）| 必須 |
| `/api/tasks/[id]` | PATCH | 課題更新 | 必須 |
| `/api/tasks/[id]` | DELETE | 課題削除 | 必須 |
| `/api/tasks/[id]/children` | GET | 子課題一覧取得 | 必須 |

**Query Parameters（GET `/api/projects/[projectId]/tasks`）:**
```typescript
{
  status?: 'todo' | 'in_progress' | 'in_review' | 'done',
  priority?: 'low' | 'medium' | 'high' | 'urgent',
  assignee_id?: string,
  parent_id?: string | 'null', // 'null'で親課題のみ取得
  search?: string, // タイトル・説明での検索
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority',
  sort_order?: 'asc' | 'desc',
  page?: number,
  per_page?: number // デフォルト: 50, 最大: 100
}
```

**Request Body例（POST `/api/projects/[projectId]/tasks`）:**
```json
{
  "title": "ログイン機能の実装",
  "description": "# 概要\nユーザー認証機能を実装する",
  "status": "todo",
  "priority": "high",
  "assignee_id": "uuid",
  "start_date": "2025-11-15",
  "due_date": "2025-12-31",
  "parent_id": null
}
```

**Response例:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "issue_number": 42,
  "issue_key": "MYAPP-42",
  "title": "ログイン機能の実装",
  "description": "# 概要\nユーザー認証機能を実装する",
  "status": "todo",
  "priority": "high",
  "assignee_id": "uuid",
  "assignee": {
    "id": "uuid",
    "username": "yamada_taro",
    "avatar_url": "https://..."
  },
  "parent_id": null,
  "children_count": 0,
  "start_date": "2025-11-15",
  "due_date": "2025-12-31",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**一覧取得レスポンス例（ページネーション対応）:**
```json
{
  "data": [
    { /* 課題オブジェクト */ },
    { /* 課題オブジェクト */ }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 50,
    "total_pages": 3
  }
}
```

#### 6.3.3 コメント関連 API

| エンドポイント | メソッド | 説明 | 認証 |
|:---|:---|:---|:---|
| `/api/tasks/[taskId]/comments` | GET | コメント一覧取得 | 必須 |
| `/api/tasks/[taskId]/comments` | POST | コメント作成 | 必須 |
| `/api/comments/[id]` | PATCH | コメント更新 | 必須（投稿者のみ）|
| `/api/comments/[id]` | DELETE | コメント削除 | 必須（投稿者のみ）|

**Request Body例（POST `/api/tasks/[taskId]/comments`）:**
```json
{
  "content": "レビューしました。LGTMです！"
}
```

**Response例:**
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "user_id": "uuid",
  "user": {
    "id": "uuid",
    "username": "yamada_taro",
    "avatar_url": "https://..."
  },
  "content": "レビューしました。LGTMです！",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### 6.3.4 作業時間記録 API

|| エンドポイント | メソッド | 説明 | 認証 |
||:---|:---|:---|:---|
|| `/api/tasks/[taskId]/time-entries` | GET | 作業時間記録一覧取得 | 必須 |
|| `/api/tasks/[taskId]/time-entries` | POST | 作業時間記録作成 | 必須 |
|| `/api/time-entries/[id]` | PATCH | 作業時間記録更新 | 必須（記録者のみ）|
|| `/api/time-entries/[id]` | DELETE | 作業時間記録削除 | 必須（記録者のみ）|

**Request Body例（POST `/api/tasks/[taskId]/time-entries`）:**
```json
{
  "work_date": "2025-11-15",
  "hours": 2.5,
  "description": "ログイン画面のUIを実装"
}
```

**Response例:**
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "user_id": "uuid",
  "user": {
    "id": "uuid",
    "username": "yamada_taro",
    "avatar_url": "https://..."
  },
  "work_date": "2025-11-15",
  "hours": 2.5,
  "description": "ログイン画面のUIを実装",
  "created_at": "2025-11-15T10:00:00Z",
  "updated_at": "2025-11-15T10:00:00Z"
}
```

#### 6.3.5 時間分析 API

|| エンドポイント | メソッド | 説明 | 認証 |
||:---|:---|:---|:---|
|| `/api/analytics/summary` | GET | 全体サマリー取得 | 必須 |
|| `/api/analytics/by-project` | GET | プロジェクト別集計 | 必須 |
|| `/api/analytics/by-task` | GET | 課題別集計 | 必須 |
|| `/api/analytics/by-status` | GET | ステータス別集計 | 必須 |
|| `/api/analytics/by-priority` | GET | 優先度別集計 | 必須 |
|| `/api/analytics/timeline` | GET | 時系列推移データ | 必須 |
|| `/api/projects/[projectId]/analytics` | GET | プロジェクト別分析 | 必須 |

**Query Parameters（共通）:**
```typescript
{
  start_date: string,  // YYYY-MM-DD形式、必須
  end_date: string,    // YYYY-MM-DD形式、必須
  user_id?: string,    // 特定ユーザーのみ取得（オプション）
  project_id?: string  // 特定プロジェクトのみ取得（オプション）
}
```

**Response例（GET `/api/analytics/summary`）:**
```json
{
  "period": {
    "start_date": "2025-11-11",
    "end_date": "2025-11-17"
  },
  "summary": {
    "total_hours": 42.5,
    "average_hours_per_day": 6.07,
    "completed_tasks": 8,
    "in_progress_tasks": 5,
    "top_tasks": [
      {
        "task_id": "uuid",
        "task_title": "ログイン機能の実装",
        "issue_key": "MYAPP-42",
        "total_hours": 12.5
      },
      {
        "task_id": "uuid",
        "task_title": "データベース設計",
        "issue_key": "MYAPP-15",
        "total_hours": 8.0
      }
    ],
    "top_project": {
      "project_id": "uuid",
      "project_name": "マイアプリケーション",
      "total_hours": 35.0
    }
  }
}
```

**Response例（GET `/api/analytics/by-project`）:**
```json
{
  "data": [
    {
      "project_id": "uuid",
      "project_name": "マイアプリケーション",
      "total_hours": 35.0,
      "percentage": 82.4
    },
    {
      "project_id": "uuid",
      "project_name": "テストプロジェクト",
      "total_hours": 7.5,
      "percentage": 17.6
    }
  ],
  "total_hours": 42.5
}
```

**Response例（GET `/api/analytics/timeline`）:**
```json
{
  "timeline": [
    {
      "date": "2025-11-11",
      "hours": 5.5,
      "tasks_count": 3
    },
    {
      "date": "2025-11-12",
      "hours": 7.0,
      "tasks_count": 4
    },
    {
      "date": "2025-11-13",
      "hours": 6.5,
      "tasks_count": 2
    }
  ]
}
```

### 6.4 エラーレスポンス

統一されたエラーレスポンス形式を使用：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "title",
        "message": "タイトルは必須です"
      }
    ]
  }
}
```

#### エラーコード一覧

| HTTPステータス | エラーコード | 説明 |
|:---|:---|:---|
| 400 | `VALIDATION_ERROR` | バリデーションエラー |
| 401 | `UNAUTHORIZED` | 認証エラー |
| 403 | `FORBIDDEN` | 権限不足 |
| 404 | `NOT_FOUND` | リソースが見つからない |
| 409 | `CONFLICT` | リソースの競合（例: プロジェクトキー重複）|
| 422 | `UNPROCESSABLE_ENTITY` | ビジネスロジックエラー（例: 孫課題作成不可）|
| 429 | `RATE_LIMIT_EXCEEDED` | レート制限超過 |
| 500 | `INTERNAL_SERVER_ERROR` | サーバーエラー |

### 6.5 バリデーションルール

#### プロジェクト
  - `key`: 2-10文字、英大文字のみ、ユニーク必須
  - `name`: 1-100文字、必須

#### 課題
  - `title`: 1-200文字、必須
  - `description`: 0-10000文字
  - `status`: 列挙型（'todo', 'in_progress', 'in_review', 'done'）
  - `priority`: 列挙型（'low', 'medium', 'high', 'urgent'）
  - `start_date`: 日付形式（YYYY-MM-DD）、オプショナル
  - `due_date`: 日付形式（YYYY-MM-DD）、オプショナル
    - `start_date`が指定されている場合、`due_date`は`start_date`以降である必要あり
  - `parent_id`: 
    - 指定する場合、同一プロジェクト内の課題である必要あり
    - 親課題自身が子課題でないこと（2階層まで）
    - 自己参照不可

#### コメント
  - `content`: 1-5000文字、必須

### 6.6 レート制限

  * **認証済みユーザー**: 100リクエスト/分
  * **未認証**: 10リクエスト/分（ログイン・サインアップのみ）

レスポンスヘッダーで制限情報を返却：
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### 6.7 リアルタイム更新（Supabase Realtime）

以下のテーブル変更をリアルタイムで配信：

  * `tasks`: INSERT, UPDATE, DELETE
  * `comments`: INSERT, UPDATE, DELETE

クライアント側で Supabase Realtime Subscriptions を使用して購読。

**購読例（概念）:**
```typescript
supabase
  .channel('project:uuid')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks', filter: 'project_id=eq.uuid' },
    (payload) => { /* UI更新 */ }
  )
  .subscribe()
```

## 7\. Row Level Security (RLS) ポリシー設計

Supabase Authの最大の利点であるRLSを活用し、データベースレベルでセキュリティを確保。

### 7.1 `profiles` テーブル

```sql
-- ユーザーは自分のプロファイルのみ閲覧・更新可能
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- プロファイルの作成はトリガーで自動実行（サインアップ時）
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 7.2 `projects` テーブル

```sql
-- プロジェクトメンバーのみプロジェクトを閲覧可能
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

-- オーナーのみプロジェクトを作成可能
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- オーナーのみプロジェクトを更新・削除可能
CREATE POLICY "Owners can update projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);
```

### 7.3 `tasks` テーブル

```sql
-- プロジェクトメンバーのみ課題を閲覧可能
CREATE POLICY "Project members can view tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- プロジェクトメンバーは課題を作成可能
CREATE POLICY "Project members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- プロジェクトメンバーは課題を更新・削除可能
CREATE POLICY "Project members can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project members can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );
```

### 7.4 `comments` テーブル

```sql
-- プロジェクトメンバーのみコメントを閲覧可能
CREATE POLICY "Project members can view comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = comments.task_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- プロジェクトメンバーはコメントを作成可能
CREATE POLICY "Project members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = comments.task_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- コメント投稿者のみ更新・削除可能
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

### 7.4 `time_entries` テーブル

```sql
-- プロジェクトメンバーは作業時間記録を閲覧可能
CREATE POLICY "Project members can view time entries"
  ON time_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = time_entries.task_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- プロジェクトメンバーは作業時間記録を作成可能
CREATE POLICY "Project members can create time entries"
  ON time_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = time_entries.task_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- 記録者のみ更新・削除可能
CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries"
  ON time_entries FOR DELETE
  USING (auth.uid() = user_id);
```

### 7.5 Database Triggers & Functions

#### プロファイル自動作成

ユーザーサインアップ時に自動的にプロファイルを作成：

```sql
-- サインアップ時にプロファイルを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### updated_at自動更新

```sql
-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 7.6 パフォーマンス最適化

RLSポリシーのパフォーマンスを最適化するため、以下のインデックスを作成：

```sql
-- project_members テーブルのインデックス
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_composite ON project_members(project_id, user_id);

-- tasks テーブルのインデックス
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- comments テーブルのインデックス
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- time_entries テーブルのインデックス
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_work_date ON time_entries(work_date);
CREATE INDEX idx_time_entries_composite ON time_entries(task_id, user_id, work_date);
```

## 8\. ガントチャート実装ガイド

### 8.1 実装アプローチの選択

ガントチャート機能は以下の2つのアプローチから選択可能：

#### オプション1: カスタム実装（推奨）⭐

**メリット:**
- Tailwind CSSとの完全な統合
- 完全なカスタマイズ性
- 軽量なバンドルサイズ
- プロジェクト固有の要件に柔軟に対応

**技術構成:**
```tsx
// 使用技術
- Tailwind CSS: スタイリング
- dnd-kit: ドラッグ&ドロップ
- date-fns: 日付計算
- React: コンポーネント実装
```

**実装例の概要:**
```tsx
// components/gantt/gantt-chart.tsx
'use client';

import { useDndMonitor, DndContext } from '@dnd-kit/core';
import { format, differenceInDays } from 'date-fns';

export function GanttChart({ tasks, dateRange }) {
  // タイムスケールの計算
  const days = differenceInDays(dateRange.end, dateRange.start);
  
  return (
    <div className="flex flex-col">
      {/* ヘッダー: 日付軸 */}
      <GanttHeader dateRange={dateRange} />
      
      {/* ボディ: タスクバー */}
      <DndContext onDragEnd={handleDateChange}>
        {tasks.map(task => (
          <GanttRow
            key={task.id}
            task={task}
            dateRange={dateRange}
          />
        ))}
      </DndContext>
    </div>
  );
}
```

#### オプション2: ライブラリ使用

**使用ライブラリ候補:**
- `gantt-task-react`: React向けガントチャートライブラリ
- ⚠️ 注意: Tailwind CSSとのスタイル統合に工夫が必要

**メリット:**
- 実装速度が速い
- 標準的なガントチャート機能がすぐに使える

**デメリット:**
- カスタマイズに制限
- Tailwind CSSとのスタイル衝突の可能性
- バンドルサイズの増加

### 8.2 必要な機能要件

#### 基本表示機能
- ✅ 横軸：時間（日付）
- ✅ 縦軸：課題リスト
- ✅ タスクバー：開始日〜期限日の視覚化
- ✅ 今日の日付ライン

#### タイムスケール切り替え
```tsx
type TimeScale = 'day' | 'week' | 'month';

// 日次表示: 1日単位で表示
// 週次表示: 週の開始日を表示
// 月次表示: 月単位で表示
```

#### インタラクティブ機能
- ✅ タスクバーをドラッグして日付変更
- ✅ タスクバーの端をリサイズして期間変更
- ✅ タスククリックで詳細モーダル表示
- ✅ ツールチップ表示（ホバー時）

#### 階層表示
```tsx
// 親子課題の表示
<GanttRow task={parentTask} level={0}>
  <GanttRow task={childTask1} level={1} />
  <GanttRow task={childTask2} level={1} />
</GanttRow>
```

### 8.3 データ構造

```typescript
interface GanttTask {
  id: string;
  title: string;
  start_date: string | null; // ISO 8601 date
  due_date: string | null;    // ISO 8601 date
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  parent_id: string | null;
  children?: GanttTask[];
}

interface DateRange {
  start: Date;
  end: Date;
}
```

### 8.4 UI/UXガイドライン

#### カラースキーム
```tsx
// Tailwind CSSクラス例
const statusColors = {
  todo: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-yellow-500',
  done: 'bg-green-500',
};

const priorityBorders = {
  low: 'border-l-4 border-l-gray-300',
  medium: 'border-l-4 border-l-blue-400',
  high: 'border-l-4 border-l-orange-500',
  urgent: 'border-l-4 border-l-red-600',
};
```

#### レスポンシブ対応
- デスクトップ: フル機能
- タブレット: 横スクロール対応
- モバイル: ガントチャート表示は推奨しない（リストビューに誘導）

#### パフォーマンス考慮事項
```tsx
// 仮想スクロール実装（タスクが100件以上の場合）
import { useVirtualizer } from '@tanstack/react-virtual';

// 日付のない課題の扱い
// - start_dateがnull: 表示しない、または今日から開始として扱う
// - due_dateがnull: 開始日から1日として扱う
```

### 8.5 実装の優先順位

#### MVP (Minimum Viable Product)
1. 基本的なタスクバー表示（start_date 〜 due_date）
2. 日次・週次・月次の切り替え
3. 今日の日付ライン
4. タスククリックで詳細表示

#### Phase 2
5. ドラッグ&ドロップによる日付変更
6. 親子課題の階層表示
7. ツールチップ表示

#### Phase 3 (Optional)
8. タスクバーのリサイズ（期間変更）
9. マイルストーン機能
10. 進捗率の視覚化

## 9\. コーディング規約

### 8.1 スタイリング規約

#### 必須ルール ✅

1. **Tailwind CSSを使用する**
   ```tsx
   // ✅ Good: Tailwind CSSのユーティリティクラスを使用
   <div className="flex items-center gap-4 rounded-lg border p-4">
     <h2 className="text-xl font-bold">タイトル</h2>
   </div>
   ```

2. **shadcn/uiコンポーネントを活用する**
   ```tsx
   // ✅ Good: shadcn/uiのコンポーネントを使用
   import { Button } from "@/components/ui/button";
   import { Card, CardContent, CardHeader } from "@/components/ui/card";
   
   <Card>
     <CardHeader>ヘッダー</CardHeader>
     <CardContent>
       <Button variant="outline">ボタン</Button>
     </CardContent>
   </Card>
   ```

3. **clsxまたはcnヘルパーで条件付きスタイルを管理**
   ```tsx
   // ✅ Good: cn関数で条件付きクラスを管理
   import { cn } from "@/lib/utils";
   
   <div className={cn(
     "rounded-lg border p-4",
     isActive && "bg-blue-50 border-blue-500",
     isDisabled && "opacity-50 cursor-not-allowed"
   )}>
   ```

#### 禁止事項 ❌

1. **Material-UI (MUI)の使用禁止**
   ```tsx
   // ❌ Bad: MUIコンポーネントは使用しない
   import { Button } from "@mui/material";
   import Box from "@mui/material/Box";
   ```

2. **CSS-in-JSライブラリの使用禁止**
   ```tsx
   // ❌ Bad: styled-components、Emotion等は使用しない
   import styled from "styled-components";
   import { css } from "@emotion/react";
   
   const StyledDiv = styled.div`
     padding: 1rem;
   `;
   ```

3. **インラインスタイルの原則禁止**
   ```tsx
   // ❌ Bad: styleプロパティは原則使用しない
   <div style={{ padding: "16px", color: "blue" }}>
   
   // ✅ Good: Tailwind CSSを使用
   <div className="p-4 text-blue-600">
   ```
   
   ※ただし、動的な値（座標、計算値など）が必要な場合は例外的に許可

4. **グローバルCSSファイルの濫用禁止**
   ```css
   /* ❌ Bad: カスタムCSSクラスを大量に定義しない */
   .my-custom-button {
     padding: 12px 24px;
     border-radius: 8px;
   }
   ```
   
   ※ただし、Tailwind CSSでは実現できない特殊なアニメーションやレイアウトは例外

### 8.2 コンポーネント設計規約

1. **Server Componentsを優先**
   ```tsx
   // ✅ Good: デフォルトはServer Component
   export default async function TaskList() {
     const tasks = await getTasks();
     return <div>...</div>;
   }
   
   // ❌ Bad: 不要な'use client'ディレクティブ
   'use client';
   export default function TaskList() {
     return <div>...</div>;
   }
   ```

2. **コンポーネントの責務を明確に分離**
   - **Server Components**: データ取得、重い計算処理
   - **Client Components**: インタラクション、状態管理、イベントハンドリング

3. **shadcn/uiコンポーネントのカスタマイズ**
   ```tsx
   // ✅ Good: variantsを活用してカスタマイズ
   import { Button } from "@/components/ui/button";
   
   // /components/ui/button.tsxを直接編集してvariantを追加
   const buttonVariants = cva(
     "base-styles",
     {
       variants: {
         variant: {
           default: "...",
           custom: "bg-purple-500 hover:bg-purple-600" // 追加
         }
       }
     }
   );
   ```

### 8.3 TypeScript規約

1. **anyの使用は禁止**
2. **PropsとStateの型定義を明確にする**
3. **Zodスキーマからの型推論を活用**

### 8.4 ファイル命名規約

```
components/
├── ui/              # shadcn/uiコンポーネント（自動生成）
│   ├── button.tsx
│   └── card.tsx
├── features/        # 機能別コンポーネント
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-list.tsx
│   │   └── task-form.tsx
│   └── projects/
└── layouts/         # レイアウトコンポーネント
```

## 9\. 依存関係管理

### 9.1 必須パッケージ

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    
    // Supabase
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "^2.38.0",
    
    // Styling
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    
    // UI Components (shadcn/ui dependencies)
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.294.0",
    
    // Forms
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    
    // Drag and Drop
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0",
    
    // Date/Time
    "date-fns": "^3.0.0",
    
    // Charts & Data Visualization
    "recharts": "^2.10.0",
    
    // Gantt Chart (オプション：カスタム実装を選択する場合は不要)
    "gantt-task-react": "^0.3.9" // または自作実装
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### 9.2 インストール禁止パッケージ ❌

以下のパッケージは**プロジェクトにインストールしてはならない**:

```json
{
  // ❌ Material-UI関連
  "@mui/material": "禁止",
  "@mui/icons-material": "禁止",
  "@mui/system": "禁止",
  "@mui/styled-engine": "禁止",
  "@mui/x-data-grid": "禁止",
  
  // ❌ CSS-in-JSライブラリ
  "@emotion/react": "禁止",
  "@emotion/styled": "禁止",
  "styled-components": "禁止",
  "styled-jsx": "禁止（Next.js組み込み版は除く）",
  
  // ❌ 他のUIライブラリ（競合防止）
  "@chakra-ui/react": "禁止",
  "@mantine/core": "禁止",
  "antd": "禁止"
}
```

### 9.3 パッケージ追加時のレビュー基準

新しいパッケージを追加する際は、以下を確認すること:

1. **Tailwind CSSとの互換性**: スタイリング方針と矛盾しないか
2. **バンドルサイズ**: 不必要に大きなライブラリではないか
3. **Next.js App Router対応**: Server Componentsで使用できるか
4. **TypeScript対応**: 型定義が提供されているか
5. **メンテナンス状況**: アクティブに開発されているか

## 10\. 個人開発向けロードマップ

### 🎯 開発の基本方針

**個人開発での成功のポイント:**
1. **小さく始めて、早くリリース** - 完璧を目指さず、動くものを早く作る
2. **自分が使いたい機能から作る** - モチベーション維持が重要
3. **1機能ずつ完成させる** - 中途半端な実装を増やさない
4. **実際に使いながら改善** - 使用感を確認してから次に進む
5. **技術的な学びを楽しむ** - 新しい技術の習得も目的の一つ

---

## 📅 ステップバイステップ実装計画

### **Step 0: 環境構築（1-2日）** 🔧

**目標:** 開発環境を整え、動くスケルトンを作る

**実装内容:**
```bash
# プロジェクトセットアップ
- Next.js 14 (App Router) プロジェクト作成
- TypeScript設定
- Tailwind CSS設定
- ESLint / Prettier設定
- Git リポジトリ初期化
```

**成果物:**
- `npm run dev` で起動する空のNext.jsアプリ
- Tailwind CSSが適用されたシンプルなページ

**学習ポイント:**
- Next.js App Routerの基本構造
- Tailwind CSSの基本的な使い方

---

### **Step 1: 認証基盤（2-3日）** 🔐

**目標:** ユーザー登録・ログインができる状態

**実装内容:**
1. Supabaseプロジェクト作成
2. Supabase Auth設定
3. ログイン/サインアップページ
4. セッション管理（`@supabase/ssr`）
5. ログアウト機能

**必要なファイル:**
```typescript
// app/(auth)/login/page.tsx
// app/(auth)/signup/page.tsx
// lib/supabase/client.ts
// lib/supabase/server.ts
```

**データベース:**
- `profiles` テーブル作成
- 自動プロファイル作成トリガー

**成果物:**
- メールアドレスとパスワードでログインできる
- ログイン後、ダッシュボードにリダイレクト

**チェックポイント:**
✅ サインアップできる  
✅ ログインできる  
✅ ログアウトできる  
✅ ログイン状態が保持される

---

### **Step 2: プロジェクト管理（2-3日）** 📁

**目標:** プロジェクトを作成・表示できる

**実装内容:**
1. `projects` テーブル作成
2. プロジェクト一覧ページ
3. プロジェクト作成フォーム
4. プロジェクト詳細ページ（スケルトン）
5. 基本的なRLSポリシー設定

**必要なページ:**
```
/dashboard - プロジェクト一覧
/projects/new - 新規プロジェクト作成
/projects/[projectId] - プロジェクト詳細
```

**UI実装:**
- shadcn/ui の Button, Card, Input をインストール
- プロジェクト作成フォーム（React Hook Form + Zod）

**成果物:**
- プロジェクトを作成できる
- 自分のプロジェクト一覧を見れる
- プロジェクトをクリックして詳細に移動できる

**チェックポイント:**
✅ プロジェクトを作成できる  
✅ プロジェクトキー（PROJ等）を設定できる  
✅ 自分のプロジェクトのみ表示される（RLS）

---

### **Step 3: 課題の基本CRUD（3-5日）** 📝

**目標:** 課題を作成・表示・編集・削除できる

**実装内容:**
1. `tasks` テーブル作成（シンプル版）
   - 必須フィールドのみ: id, title, description, status, project_id
2. 課題一覧ページ（シンプルなリスト）
3. 課題作成フォーム
4. 課題詳細ページ
5. 課題編集機能
6. 課題削除機能
7. 課題キー自動採番（PROJ-1形式）

**必要なページ:**
```
/projects/[projectId]/list - 課題一覧
/projects/[projectId]/issues/new - 新規課題作成
/projects/[projectId]/issues/[issueId] - 課題詳細
```

**UI実装:**
- shadcn/ui の Badge, Dialog, Select 追加
- ステータスバッジ（未対応、処理中、完了）
- 優先度選択

**成果物:**
- 課題を作成できる
- 課題一覧を見れる
- 課題詳細を見れる
- 課題を編集・削除できる

**チェックポイント:**
✅ 課題を作成できる  
✅ 課題キーが自動採番される（PROJ-1, PROJ-2...）  
✅ ステータスを変更できる  
✅ 課題を削除できる

**🎉 ここまでで最小限のMVP完成！実際に使ってみる**

---

### **Step 4: リストビューの充実（2-3日）** 📊

**目標:** 課題を見やすく、探しやすくする

**実装内容:**
1. テーブル形式の課題一覧
2. ステータスでのフィルタリング
3. 担当者でのフィルタリング
4. 優先度でのソート
5. 検索機能（件名での検索）
6. ページネーション

**UI実装:**
- shadcn/ui の Table コンポーネント
- フィルタリングUI

**成果物:**
- 見やすい表形式の課題一覧
- フィルタリング・ソートが使える
- 課題が多くなっても快適に操作できる

---

### **Step 5: 担当者とコメント（2-3日）** 💬

**目標:** チーム開発の準備（一人でも複数プロジェクトで便利）

**実装内容:**
1. `project_members` テーブル作成
2. 課題への担当者割り当て
3. `comments` テーブル作成
4. コメント投稿機能
5. コメント一覧表示

**成果物:**
- 課題に担当者を設定できる
- 課題にコメントできる
- コメント履歴が見れる

**🎉 ここまでで基本的なタスク管理が完成！**

---

### **Step 6: カンバンボード（3-5日）** 🎴

**目標:** ビジュアルでわかりやすいタスク管理

**実装内容:**
1. カンバンボードUI実装
2. dnd-kit でドラッグ&ドロップ
3. ステータス変更がD&Dで可能に
4. レーンごとの課題カード表示

**必要なページ:**
```
/projects/[projectId]/board - カンバンボード
```

**成果物:**
- ドラッグ&ドロップでステータス変更
- 直感的な課題管理
- リストビューとカンバンビューを切り替えられる

---

### **Step 7: 作業時間記録（2-3日）** ⏱️

**目標:** 何にどれだけ時間を使ったか記録する

**実装内容:**
1. `time_entries` テーブル作成
2. 課題詳細から時間記録を追加
3. 記録した時間の一覧表示
4. 簡単な集計表示（今週の合計時間）

**成果物:**
- 課題ごとに作業時間を記録できる
- 今週の作業時間が見れる

---

### **Step 8: 時間分析ダッシュボード（3-5日）** 📈

**目標:** 時間の使い方を可視化する

**実装内容:**
1. Recharts導入
2. 今週/今月の時間集計API
3. プロジェクト別円グラフ
4. 日別棒グラフ
5. サマリーカード（総時間、平均時間等）

**必要なページ:**
```
/analytics - 全体分析
/projects/[projectId]/analytics - プロジェクト別分析
```

**成果物:**
- 今週/今月の時間使用状況が一目でわかる
- グラフで視覚的に確認できる

**🎉 個人での時間管理に十分な機能が完成！**

---

### **Step 9: ガントチャート（5-7日）** 📅

**目標:** スケジュール管理を強化

**実装内容:**
1. `start_date`, `due_date` フィールド追加
2. ガントチャートビューの実装
3. タイムスケール切り替え（日/週/月）
4. 基本的な表示のみ（D&D は後回し）

**必要なページ:**
```
/projects/[projectId]/gantt - ガントチャート
```

**成果物:**
- 課題のスケジュールが可視化される
- 期限管理がしやすくなる

---

### **Step 10: スプリント管理（5-7日）** 🏃

**目標:** スクラム開発に対応

**実装内容:**
1. `sprints` テーブル作成
2. `sprint_snapshots` テーブル作成
3. スプリント作成・管理機能
4. スプリントボード
5. バーンダウンチャート
6. ストーリーポイント設定

**必要なページ:**
```
/projects/[projectId]/sprints - スプリント一覧
/projects/[projectId]/sprints/[sprintId] - スプリント詳細
/projects/[projectId]/backlog - バックログ
```

**成果物:**
- スプリントを計画できる
- バーンダウンチャートで進捗確認
- ベロシティが見れる

**🎉 フル機能のアジャイル開発ツールが完成！**

---

### **Step 11+: 拡張機能（各2-3日）** ✨

優先順位は低いが、あると便利な機能：

- **親子課題の実装** - タスクの階層管理
- **リアルタイム更新** - Supabase Realtime
- **タイマー機能** - 作業時間の自動記録
- **エクスポート機能** - CSV/PDF出力
- **モバイル対応** - レスポンシブ改善
- **通知機能** - メール通知

---

## 📊 推奨開発スケジュール（個人開発）

### **最速MVP（2-3週間）**
- Step 0-3: 認証 + プロジェクト + 課題CRUD
- 目標: 自分で使える最小限のタスク管理ツール

### **実用レベル（1-2ヶ月）**
- Step 0-6: MVP + リスト充実 + コメント + カンバン
- 目標: チームでも使えるタスク管理ツール

### **高機能版（2-3ヶ月）**
- Step 0-8: 実用レベル + 時間管理 + 分析
- 目標: 時間管理もできる生産性ツール

### **フル機能版（3-6ヶ月）**
- Step 0-10: すべて実装
- 目標: Backlog並みの多機能ツール

---

## 🎯 各Stepでの学習目標

| Step | 主な学習内容 |
|:---|:---|
| Step 0 | Next.js App Router, Tailwind CSS |
| Step 1 | Supabase Auth, Cookie管理, RLS基礎 |
| Step 2 | Server Actions, Form管理, Zod |
| Step 3 | データベース設計, CRUD操作, トリガー |
| Step 4 | フィルタリング, ソート, ページネーション |
| Step 5 | リレーション, JOIN, コメントシステム |
| Step 6 | dnd-kit, 状態管理, アニメーション |
| Step 7 | 集計クエリ, date-fns, 時間計算 |
| Step 8 | Recharts, データ可視化, 分析API |
| Step 9 | Canvas/SVG, カスタムコンポーネント |
| Step 10 | 複雑なビジネスロジック, スナップショット |

---

## 💡 開発のコツ

### 1. 各Stepで必ず動作確認
```bash
# 各Step完了時のチェックリスト
□ 機能が動く
□ エラーハンドリングができている
□ RLSで権限制御されている
□ UIがレスポンシブ
□ コードをGitにコミット
```

### 2. 早めにデプロイ
```bash
# Step 3（MVP）完了時点でVercelにデプロイ推奨
- 本番環境での動作確認
- 友人に使ってもらってフィードバック
```

### 3. リファクタリングは後回し
```
完璧なコードを目指さず、動くコードを書く
→ リファクタリングは全体が動いてから
```

### 4. 困ったらシンプルに
```
実装が難しいと感じたら：
- より簡単な方法を探す
- 機能を削る勇気を持つ
- 後で追加することを前提に
```

---

## 🚀 次のアクション

**まず始めるべきこと:**

1. **Step 0を完了させる（今日中）**
   ```bash
   npx create-next-app@latest backlog-like-app
   cd backlog-like-app
   npm install -D tailwindcss
   # Git初期化
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Supabaseアカウント作成（今日中）**
   - https://supabase.com でアカウント作成
   - 新規プロジェクト作成
   - 接続情報をメモ

3. **Step 1に着手（明日から）**
   - 認証ページの実装開始

**このロードマップで3ヶ月後には、Backlogライクなフル機能のタスク管理アプリが完成します！** 🎉