# Meeting App Development Makefile

.PHONY: help setup start stop restart logs clean build test lint

# 環境セットアップ
setup: ## 初期環境セットアップ
	@echo "🔧 環境セットアップを開始..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "✅ .envファイルを作成しました。APIキーを設定してください。"; fi
	@echo "📝 .envファイルでOpenAI API Keyを設定してください:"
	@echo "   OPENAI_API_KEY=sk-your_api_key_here"

# 開発環境起動
start: ## 開発環境を起動
	@echo "🚀 開発環境を起動します..."
	@./dev-start.sh

# 開発環境停止
stop: ## 開発環境を停止
	@echo "🛑 開発環境を停止します..."
	@./dev-stop.sh

# サービス再起動
restart: ## サービスを再起動
	@echo "🔄 サービスを再起動します..."
	@docker compose restart

# フロントエンド再起動
restart-frontend: ## フロントエンドのみ再起動
	@echo "🔄 フロントエンドを再起動します..."
	@docker compose restart frontend

# バックエンド再起動
restart-backend: ## バックエンドのみ再起動
	@echo "🔄 バックエンドを再起動します..."
	@docker compose restart backend

# ログ確認
logs: ## 全サービスのログを表示
	@docker compose logs -f

# フロントエンドログ確認
logs-frontend: ## フロントエンドのログを表示
	@docker compose logs -f frontend

# バックエンドログ確認
logs-backend: ## バックエンドのログを表示
	@docker compose logs -f backend

# サービス状態確認
status: ## サービス状態を確認
	@echo "📊 サービス状態:"
	@docker compose ps
	@echo ""
	@echo "🌐 アクセスURL:"
	@echo "  フロントエンド: http://localhost:5173"
	@echo "  バックエンド:   http://localhost:8080"
	@echo "  ヘルスチェック: http://localhost:8080/health"

# 完全クリーンアップ
clean: ## コンテナとボリュームを完全削除
	@echo "🧹 完全クリーンアップを実行します..."
	@docker compose down --rmi all --volumes --remove-orphans
	@echo "✅ クリーンアップ完了"

# 再ビルド
build: ## コンテナを再ビルド
	@echo "🔨 コンテナを再ビルドします..."
	@docker compose build --no-cache

# 完全リセット
reset: clean build start ## 完全リセット（クリーンアップ→ビルド→起動）

# テスト実行
test: ## テストを実行
	@echo "🧪 テストを実行します..."
	@docker compose exec backend npm test || echo "バックエンドのテストがありません"
	@docker compose exec frontend npm run test 2>/dev/null || echo "フロントエンドのテストがありません"

# リント実行
lint: ## リントを実行
	@echo "🔍 リントを実行します..."
	@docker compose exec frontend npm run lint || echo "フロントエンドのリントを実行"

# コンテナにログイン
shell-frontend: ## フロントエンドコンテナにログイン
	@docker compose exec frontend sh

shell-backend: ## バックエンドコンテナにログイン
	@docker compose exec backend sh

# 依存関係インストール
install: ## 依存関係を再インストール
	@echo "📦 依存関係を再インストールします..."
	@docker compose exec frontend npm i
	@docker compose exec backend npm i
