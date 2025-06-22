#!/bin/bash

# Cloud Build - Cloud Run 権限設定スクリプト
# Meeting App デプロイ用

set -e

# プロジェクト設定
PROJECT_ID="mac-sdo-hackathon"
REGION="asia-northeast1"

# 5. Cloud Run サービスアカウントを作成（必要に応じて）
echo ""
echo "🏃 Cloud Run サービスアカウントを設定中..."

# Cloud Run用のカスタムサービスアカウントを作成
CLOUD_RUN_SA="meeting-app-runner"
CLOUD_RUN_SA_EMAIL="${CLOUD_RUN_SA}@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $CLOUD_RUN_SA_EMAIL --project=$PROJECT_ID >/dev/null 2>&1; then
  echo "Cloud Run用サービスアカウントを作成中..."
  gcloud iam service-accounts create $CLOUD_RUN_SA \
    --display-name="Meeting App Cloud Run Service Account" \
    --description="Service account for Meeting App Cloud Run service" \
    --project=$PROJECT_ID
else
  echo "Cloud Run用サービスアカウントは既に存在します"
fi

# Cloud Run SAに必要な権限を付与
echo "Cloud Run SAに権限を付与中..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_RUN_SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# 6. 権限確認
echo ""
echo "🔍 設定された権限を確認中..."
echo "Cloud Build サービスアカウントの権限:"
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$CLOUD_BUILD_SA"

echo ""
echo "✅ 権限設定が完了しました！"
