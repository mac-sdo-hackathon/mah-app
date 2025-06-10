#!/bin/bash

# Meeting App ローカル開発環境 起動スクリプト

set -e

echo "🚀 Meeting App ローカル開発環境を起動します..."

# .envファイルの存在確認
if [ ! -f .env ]; then
    echo "⚠️  .envファイルが見つかりません。"
    echo "📝 .env.exampleをコピーして.envファイルを作成してください："
    echo "   cp .env.example .env"
    echo "   そして必要な環境変数を設定してください。"
    exit 1
fi

# OpenAI API Keyの確認
if ! grep -q "OPENAI_API_KEY=" .env 2>/dev/null; then
    echo "⚠️  OpenAI API Keyが設定されていません。"
    echo "📝 .envファイルにOpenAI API Keyを設定してください："
    echo "   OPENAI_API_KEY=sk-your_api_key_here"
    exit 1
fi

# Docker Composeでサービス起動
echo "🐳 Docker Composeでサービスを起動中..."
docker compose up --build -d

echo "✅ サービスが起動しました！"
echo ""
echo "📱 フロントエンド: http://localhost:5173"
echo "🔧 バックエンド API: http://localhost:8080"
echo "❤️  ヘルスチェック: http://localhost:8080/health"
echo ""
echo "🔍 ログを確認: make logs"
echo "🛑 停止: make stop"
