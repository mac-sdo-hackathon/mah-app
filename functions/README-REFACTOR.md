# Meeting App - リファクタリング完了ドキュメント

## 📁 新しいフォルダ構造

Cloud Run Functions から Cloud Run へ移行に伴い、app.js を機能ごとに整理・リファクタリングしました。

```
functions/
├── app.js                      # メインアプリケーション
├── package.json                # 依存関係設定
├── Dockerfile                  # 本番用Dockerファイル
├── Dockerfile.dev              # 開発用Dockerファイル
├── year_anniversary.json       # 記念日データ
│
├── config/                     # 設定ファイル
│   └── index.js               # アプリケーション設定
│
├── controllers/               # コントローラー層（ルートハンドラー）
│   ├── meetingController.js   # 会議関連処理
│   ├── audioController.js     # 音声関連処理
│   ├── anniversaryController.js # 記念日関連処理
│   └── healthController.js    # ヘルスチェック・システム情報
│
├── services/                  # サービス層（ビジネスロジック）
│   ├── openaiService.js      # OpenAI API呼び出し
│   └── anniversaryService.js # 記念日データ処理
│
├── routes/                    # ルート定義
│   ├── meetingRoutes.js      # 会議関連ルート
│   ├── audioRoutes.js        # 音声関連ルート
│   ├── anniversaryRoutes.js  # 記念日関連ルート
│   └── healthRoutes.js       # ヘルス・システム情報ルート
│
├── middleware/               # ミドルウェア
│   ├── errorHandler.js      # エラーハンドリング
│   └── logger.js            # ログ記録・セキュリティ・レート制限
│
└── utils/                    # ユーティリティ関数
    ├── audioUtils.js        # 音声処理ユーティリティ
    └── prompts.js           # OpenAI プロンプトテンプレート
```

## 🏗️ アーキテクチャ設計

### MVC パターン採用

```
Request → Routes → Controllers → Services → Response
              ↓
        Middleware (Logging, Error Handling, Security)
```

### 責任分離

1. **Routes**: エンドポイント定義とリクエストルーティング
2. **Controllers**: リクエスト/レスポンス処理とバリデーション
3. **Services**: ビジネスロジックと外部API呼び出し
4. **Utils**: 共通機能とヘルパー関数
5. **Middleware**: 横断的機能（ログ、エラー、セキュリティ）
6. **Config**: 設定の一元管理

## 🔧 主な改善点

### ✨ コード品質向上

- **可読性**: 機能ごとの分離により理解しやすい構造
- **保守性**: 変更時の影響範囲を限定
- **再利用性**: 共通処理のモジュール化
- **テスタビリティ**: 各層が独立してテスト可能

### 🛡️ セキュリティ強化

- セキュリティヘッダーの自動設定
- レート制限機能（本番環境）
- 入力値バリデーション強化
- エラー情報の適切な制御

### 📊 運用監視機能

- 詳細なリクエスト/レスポンスログ
- API使用量トラッキング
- 包括的なヘルスチェック
- グレースフルシャットダウン

### 🔗 API エンドポイント

#### 会議関連
- `POST /summarize-meeting` - 会議要約
- `POST /action-item-meeting` - アクションアイテム抽出
- `POST /dispute-argument-meeting` - 争い検出・仲裁
- `POST /tangent-topic-meeting` - 脱線検出
- `POST /visualize-mermaid-meeting` - マーメード図可視化

#### 音声関連
- `POST /recording-meeting` - 音声文字起こし
- `POST /upload-audio` - 音声アップロード（未実装）
- `GET /audio/formats` - サポート音声形式情報

#### 記念日関連
- `POST /get-anniversary` - 記念日取得とアイスブレイク
- `GET /anniversary/today` - 今日の記念日
- `GET /anniversary/all` - 指定日のすべての記念日
- `GET /anniversary/random` - ランダムな記念日
- `GET /anniversary/statistics` - 記念日データ統計

#### システム関連
- `GET /` - サービス情報
- `GET /health` - 基本ヘルスチェック
- `GET /health/detailed` - 詳細ヘルスチェック
- `GET /health/readiness` - レディネスプローブ
- `GET /health/liveness` - ライブネスプローブ
- `GET /info` - サービス詳細情報
- `GET /stats/usage` - API使用量統計（開発環境のみ）

## 🚀 使用方法

### 開発環境での起動

```bash
# Docker Compose環境
make start
# または
./dev-start.sh

# 直接起動
cd functions
npm run dev
```

### エンドポイントテスト

```bash
# ヘルスチェック
curl http://localhost:8080/health

# 会議要約テスト
curl -X POST http://localhost:8080/summarize-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "agenda": "プロジェクト進捗確認",
    "goal": "現状把握と次ステップ決定",
    "content": "各チームから進捗報告があり、来週までのタスクを確認しました"
  }'

# 記念日取得テスト
curl -X POST http://localhost:8080/get-anniversary \
  -H "Content-Type: application/json" \
  -d '{"month": 6, "date": 9}'
```

## 🔄 移行の互換性

### API互換性

- **エンドポイントURL**: 変更なし
- **リクエスト形式**: 変更なし
- **レスポンス形式**: 基本的に変更なし（一部エラーレスポンス改善）

### 新機能

- 詳細なエラーハンドリング
- API使用量統計
- 包括的なヘルスチェック
- セキュリティヘッダー
- レート制限

## 🛠️ 開発・運用のベストプラクティス

### コード変更時

1. 適切な層でのみ変更を実施
2. バリデーション強化
3. エラーハンドリング追加
4. ログ出力の追加

### 新機能追加時

1. **Controller** でリクエスト処理追加
2. **Service** でビジネスロジック実装
3. **Routes** でエンドポイント定義
4. **Utils** で共通処理があれば追加

### 運用監視

- `/health/detailed` で依存サービス状態確認
- `/stats/usage` でAPI使用量確認
- ログでリクエスト処理状況確認

## 📈 今後の拡張予定

- [ ] データベース連携機能
- [ ] Redis キャッシュ機能
- [ ] JWT認証機能
- [ ] API文書自動生成
- [ ] 単体テスト・統合テスト
- [ ] Prometheus メトリクス対応
- [ ] OpenTelemetry 分散トレーシング
