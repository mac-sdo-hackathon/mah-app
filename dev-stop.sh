#!/bin/bash

# Meeting App ローカル開発環境 停止スクリプト

set -e

echo "🛑 Meeting App ローカル開発環境を停止します..."

# Docker Composeでサービス停止
docker compose down

echo "✅ すべてのサービスが停止しました。"
echo "🔄 再開する場合:"
echo "make start"
