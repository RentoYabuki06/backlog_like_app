# タスク管理アプリ 要件定義書

## 1. プロジェクト概要

### 1.1 目的
個人用のタスク管理アプリを開発し、Googleカレンダーと連携することで、プロジェクト別の時間使用状況を可視化・分析できるシステムを構築する。

### 1.2 参考アプリ
ClickUpをベースとしたタスク管理機能を実装

### 1.3 デプロイ先
Vercel（ホスティング費用の最適化）

---

## 2. 主要機能

### 2.1 タスク管理機能
- **プロジェクト管理**
  - プロジェクトの作成・編集・削除
  - プロジェクトごとの色分け・ラベル設定
  - プロジェクトの状態管理（アクティブ/アーカイブ）

- **タスク管理（親タスク）**
  - タスクの作成・編集・削除
  - タスクの基本情報
    - タスク名
    - 説明文
    - 優先度（高/中/低）
    - ステータス（未着手/進行中/完了/保留）
    - 期限（開始日・終了日）
    - タグ
    - 見積もり時間
    - 実績時間（自動集計）
  - プロジェクトへの紐付け

- **サブタスク管理（子タスク）**
  - 親タスクに対して1階層のみの子タスクを複数作成可能
  - 子タスクの基本情報
    - タスク名
    - ステータス（チェックボックス形式）
    - 期限
    - 見積もり時間
    - 実績時間
  - 親タスクの進捗率を子タスクの完了状況から自動計算

### 2.2 Googleカレンダー連携機能
- **OAuth2.0認証**
  - Googleアカウントでのログイン
  - カレンダーへのアクセス権限取得

- **カレンダー予定の読み込み**
  - Googleカレンダーの予定を表示
  - タスクと紐付けられた予定の識別
  - 複数カレンダーの統合表示

- **カレンダー予定の作成・編集**
  - アプリからGoogleカレンダーの予定を作成
  - 既存の予定の編集・削除
  - タスクとカレンダー予定の紐付け
    - 予定のタイトルまたは説明欄にタスクIDを記録
    - カスタムフィールドでプロジェクト情報を保存

- **時間トラッキング**
  - カレンダーの予定時間をタスクの実績時間として自動集計
  - 手動での時間記録も可能

### 2.3 分析・ダッシュボード機能
- **時間分析**
  - プロジェクト別の時間使用状況（週次・月次）
  - グラフ表示（円グラフ、棒グラフ、折れ線グラフ）
  - 時間の推移トレンド分析

- **表示項目**
  - プロジェクト別の合計時間
  - プロジェクト別の割合（％）
  - タスク別の時間内訳
  - 見積もり vs 実績の比較
  - 期間指定（今週/今月/先週/先月/カスタム期間）

- **レポート機能**
  - 週次レポート（週の振り返り）
  - 月次レポート（月次サマリー）
  - プロジェクト別レポート
  - CSVエクスポート機能

---

## 3. 技術スタック

### 3.1 フロントエンド
- **フレームワーク**: Next.js 14（App Router）
- **言語**: TypeScript
- **UIライブラリ**: 
  - Tailwind CSS
  - Shadcn/ui または Radix UI
- **状態管理**: Zustand または Jotai
- **カレンダーUI**: FullCalendar または React Big Calendar
- **グラフ表示**: Recharts または Chart.js

### 3.2 バックエンド
- **API**: Next.js API Routes
- **認証**: NextAuth.js（Google OAuth2.0）
- **外部API**: Google Calendar API

### 3.3 データベース
- **DB**: PostgreSQL（Vercel Postgres または Supabase）
- **ORM**: Prisma または Drizzle ORM

### 3.4 デプロイ・ホスティング
- **ホスティング**: Vercel
- **ドメイン**: Vercelの無料ドメインまたは独自ドメイン

---

## 4. データモデル

### 4.1 ER図概要

```
User (ユーザー)
  ↓ 1:N
Project (プロジェクト)
  ↓ 1:N
Task (親タスク)
  ↓ 1:N
SubTask (子タスク)

Task ←→ N:N → CalendarEvent (カレンダー予定)
```

### 4.2 テーブル設計

#### Users（ユーザー）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| email | String | メールアドレス |
| name | String | ユーザー名 |
| googleId | String | Google ID |
| googleAccessToken | String | アクセストークン（暗号化） |
| googleRefreshToken | String | リフレッシュトークン（暗号化） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### Projects（プロジェクト）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| userId | UUID | ユーザーID（外部キー） |
| name | String | プロジェクト名 |
| description | Text | 説明 |
| color | String | 識別色（HEX） |
| status | Enum | ステータス（active/archived） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### Tasks（親タスク）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| projectId | UUID | プロジェクトID（外部キー） |
| title | String | タスク名 |
| description | Text | 説明 |
| status | Enum | ステータス（todo/in_progress/done/on_hold） |
| priority | Enum | 優先度（high/medium/low） |
| startDate | DateTime | 開始日 |
| dueDate | DateTime | 期限 |
| estimatedHours | Float | 見積もり時間 |
| actualHours | Float | 実績時間（自動計算） |
| tags | String[] | タグ配列 |
| order | Int | 表示順序 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### SubTasks（子タスク）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| taskId | UUID | 親タスクID（外部キー） |
| title | String | サブタスク名 |
| isCompleted | Boolean | 完了フラグ |
| dueDate | DateTime | 期限 |
| estimatedHours | Float | 見積もり時間 |
| actualHours | Float | 実績時間 |
| order | Int | 表示順序 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### CalendarEvents（カレンダー予定）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| userId | UUID | ユーザーID（外部キー） |
| googleEventId | String | Google EventのID |
| taskId | UUID | タスクID（外部キー、NULL可） |
| projectId | UUID | プロジェクトID（外部キー、NULL可） |
| title | String | 予定のタイトル |
| description | Text | 説明 |
| startTime | DateTime | 開始時刻 |
| endTime | DateTime | 終了時刻 |
| duration | Float | 時間（時間単位） |
| calendarId | String | GoogleカレンダーID |
| isTracked | Boolean | 時間計測対象フラグ |
| syncedAt | DateTime | 同期日時 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### TimeEntries（手動時間記録）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| taskId | UUID | タスクID（外部キー、NULL可） |
| subTaskId | UUID | サブタスクID（外部キー、NULL可） |
| projectId | UUID | プロジェクトID（外部キー） |
| userId | UUID | ユーザーID（外部キー） |
| hours | Float | 時間 |
| description | Text | 作業内容 |
| date | Date | 作業日 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

---

## 5. 画面構成

### 5.1 認証画面
- ログイン画面（Googleログインボタン）
- OAuth2.0同意画面（Googleカレンダーアクセス許可）

### 5.2 ダッシュボード画面
- **ヘッダー**
  - ロゴ
  - ナビゲーションメニュー
  - ユーザーアイコン・ログアウト

- **メインエリア**
  - 時間分析グラフ（プロジェクト別）
  - 期間選択（週次/月次/カスタム）
  - サマリーカード
    - 今週の合計作業時間
    - 進行中のタスク数
    - 今週完了したタスク数
    - 期限切れタスク数

- **最近の活動**
  - 最近更新されたタスク一覧

### 5.3 プロジェクト一覧画面
- プロジェクトカード表示（グリッドまたはリスト）
- プロジェクト作成ボタン
- 各プロジェクトのサマリー（タスク数、進捗率）

### 5.4 プロジェクト詳細画面
- プロジェクト情報表示・編集
- タスク一覧（親タスク）
  - フィルター機能（ステータス、優先度、タグ）
  - ソート機能
  - ビュー切替（リスト/カンバン/カレンダー）
- タスク作成ボタン

### 5.5 タスク詳細画面（モーダルまたはサイドパネル）
- タスク情報の表示・編集
- サブタスク一覧
  - サブタスク追加フォーム
  - チェックボックスで完了管理
- 関連するカレンダー予定一覧
- 時間記録
  - 見積もり vs 実績の比較
  - 手動時間記録の追加

### 5.6 カレンダー画面
- 月表示/週表示/日表示の切り替え
- Googleカレンダーの予定表示
- タスクと紐付けられた予定の強調表示
- 予定のドラッグ&ドロップ編集
- 予定クリックで詳細表示・編集
- タスクとの紐付け機能

### 5.7 レポート画面
- 期間選択
- プロジェクト別時間レポート
- タスク別時間レポート
- 見積もり精度分析
- CSVエクスポート機能

### 5.8 設定画面
- ユーザープロフィール編集
- Googleカレンダー連携設定
- 同期対象カレンダーの選択
- 通知設定
- データエクスポート/インポート

---

## 6. ユーザーストーリー

### 6.1 認証・初期設定
- [ ] ユーザーとして、Googleアカウントでログインできる
- [ ] ユーザーとして、Googleカレンダーへのアクセスを許可できる
- [ ] ユーザーとして、同期対象のカレンダーを選択できる

### 6.2 プロジェクト管理
- [ ] ユーザーとして、新しいプロジェクトを作成できる
- [ ] ユーザーとして、プロジェクトに名前と色を設定できる
- [ ] ユーザーとして、プロジェクトを編集・削除できる
- [ ] ユーザーとして、プロジェクトをアーカイブできる

### 6.3 タスク管理
- [ ] ユーザーとして、プロジェクト内にタスクを作成できる
- [ ] ユーザーとして、タスクの詳細情報（期限、優先度、説明など）を設定できる
- [ ] ユーザーとして、タスクのステータスを変更できる
- [ ] ユーザーとして、タスクに複数のサブタスクを追加できる
- [ ] ユーザーとして、サブタスクを完了にするとチェックが付く
- [ ] ユーザーとして、親タスクの進捗率がサブタスクの完了状況で自動更新される
- [ ] ユーザーとして、タスクを削除できる

### 6.4 カレンダー連携
- [ ] ユーザーとして、アプリ内でGoogleカレンダーの予定を表示できる
- [ ] ユーザーとして、アプリから新しいカレンダー予定を作成できる
- [ ] ユーザーとして、カレンダー予定を編集・削除できる
- [ ] ユーザーとして、カレンダー予定をタスクに紐付けられる
- [ ] ユーザーとして、予定の時間が自動的にタスクの実績時間に反映される
- [ ] ユーザーとして、手動で時間記録を追加できる

### 6.5 分析・レポート
- [ ] ユーザーとして、ダッシュボードで今週の作業時間をプロジェクト別に確認できる
- [ ] ユーザーとして、月次の作業時間をプロジェクト別に確認できる
- [ ] ユーザーとして、カスタム期間を指定して分析できる
- [ ] ユーザーとして、グラフで時間配分を視覚的に理解できる
- [ ] ユーザーとして、見積もり時間と実績時間を比較できる
- [ ] ユーザーとして、レポートをCSV形式でエクスポートできる

---

## 7. Google Calendar API 連携の詳細

### 7.1 必要な権限スコープ
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
```

### 7.2 実装する機能
- **イベント一覧取得**: `calendar.events.list()`
- **イベント作成**: `calendar.events.insert()`
- **イベント更新**: `calendar.events.update()`
- **イベント削除**: `calendar.events.delete()`
- **イベント監視**: Webhook（Push通知）での自動同期

### 7.3 同期戦略
- **初回同期**: ログイン時に過去1ヶ月分の予定を取得
- **定期同期**: 
  - バックグラウンドでの定期ポーリング（15分毎）
  - または、Google Calendar Push Notificationの利用
- **手動同期**: ユーザーが手動で同期ボタンをクリック

### 7.4 タスクとカレンダー予定の紐付け方法
- **方法1**: イベントの`description`フィールドにタスクIDを埋め込む
  - 例: `[TaskID: xxx-xxx-xxx]`
- **方法2**: イベントの`extendedProperties`にカスタムフィールドを使用
  ```json
  {
    "private": {
      "taskId": "xxx-xxx-xxx",
      "projectId": "yyy-yyy-yyy"
    }
  }
  ```

---

## 8. 非機能要件

### 8.1 パフォーマンス
- ページ読み込み時間: 3秒以内
- APIレスポンス時間: 1秒以内
- 大量タスク（100件以上）でもスムーズな操作

### 8.2 セキュリティ
- OAuth2.0による安全な認証
- APIトークンの暗号化保存
- HTTPS通信の徹底
- CSRF対策
- XSS対策

### 8.3 可用性
- Vercelの99.9%稼働率を活用
- データベースの定期バックアップ

### 8.4 拡張性
- 将来的に他のカレンダーサービス（Outlook等）への対応を想定
- チーム機能の追加を見据えた設計

### 8.5 ユーザビリティ
- レスポンシブデザイン（モバイル対応）
- ダークモード対応
- キーボードショートカット
- ドラッグ&ドロップ操作

---

## 9. 開発フェーズ

### Phase 1: 基盤構築（MVP）
- [ ] プロジェクトセットアップ（Next.js + TypeScript）
- [ ] データベース設計・構築（Prisma + PostgreSQL）
- [ ] Google OAuth2.0認証実装
- [ ] 基本的なUI/UXデザイン

### Phase 2: タスク管理機能
- [ ] プロジェクトCRUD機能
- [ ] タスクCRUD機能
- [ ] サブタスク機能
- [ ] タスク一覧表示（リストビュー）

### Phase 3: カレンダー連携
- [ ] Google Calendar API統合
- [ ] カレンダー予定の表示
- [ ] カレンダー予定の作成・編集・削除
- [ ] タスクとカレンダー予定の紐付け
- [ ] 時間の自動集計機能

### Phase 4: 分析・ダッシュボード
- [ ] 時間分析ロジック実装
- [ ] グラフ表示実装
- [ ] 週次・月次レポート
- [ ] CSVエクスポート機能

### Phase 5: UI/UX改善
- [ ] カンバンビュー実装
- [ ] ドラッグ&ドロップ機能
- [ ] フィルター・検索機能強化
- [ ] レスポンシブ対応
- [ ] ダークモード実装

### Phase 6: デプロイ・運用
- [ ] Vercelへのデプロイ設定
- [ ] 環境変数の設定
- [ ] エラー監視（Sentry等）
- [ ] パフォーマンス最適化

---

## 10. Vercelデプロイに関する考慮事項

### 10.1 コスト最適化
- **Free Tier制限**
  - 商用プロジェクト: 1つまで無料
  - 帯域幅: 100GB/月
  - ビルド時間: 100時間/月
  - Serverless Function実行: 100GB-Hrs/月

- **推奨構成**
  - Vercel Postgres (Hobby plan): 無料
  - または、Supabase Free Tier
  - 画像はVercel Blob Storage（必要に応じて）

### 10.2 環境変数
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=
```

### 10.3 デプロイ設定
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`
- **Node.jsバージョン**: 18.x以上

---

## 11. 今後の拡張案

### 11.1 追加機能（優先度: 中）
- [ ] タスクテンプレート機能
- [ ] 繰り返しタスク
- [ ] タスクのコメント機能
- [ ] ファイル添付機能
- [ ] 通知機能（メール、プッシュ通知）
- [ ] タスクの依存関係設定
- [ ] ガントチャートビュー

### 11.2 追加機能（優先度: 低）
- [ ] チーム機能（複数ユーザー）
- [ ] 他のカレンダーサービス連携（Outlook、Apple Calendar）
- [ ] Slack、Discord連携
- [ ] AI による作業時間予測
- [ ] ポモドーロタイマー統合
- [ ] モバイルアプリ（React Native）

---

## 12. 参考資料

### 12.1 技術ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/docs)
- [Vercel Deployment](https://vercel.com/docs)

### 12.2 UIデザイン参考
- [ClickUp](https://clickup.com/)
- [Notion Calendar](https://www.notion.so/product/calendar)
- [Todoist](https://todoist.com/)
- [Asana](https://asana.com/)

---

## 13. 備考

- この要件定義は開発を進めながら随時更新・調整する
- ユーザーフィードバックを元に優先順位を柔軟に変更
- セキュリティとプライバシーを最優先に考慮
- 個人利用を前提としているため、スケーラビリティよりもシンプルさを重視

