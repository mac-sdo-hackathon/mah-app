# Cloud Build → Cloud Run デプロイガイド

## 🚀 Meeting App デプロイ手順

### **1. 権限設定の実行**
```bash
# 実行権限を付与
chmod +x /Users/matsushitatetsuya/Program/mah-app/functions/setup-permissions.sh

# 権限設定スクリプトを実行
./functions/setup-permissions.sh
```

### **2. OpenAI API キーの設定**
```bash
# Secret Managerにキーを保存
echo 'your-actual-openai-api-key' | gcloud secrets create OPENAI_API_KEY --data-file=-

# または既存のシークレットを更新
echo 'your-actual-openai-api-key' | gcloud secrets versions add OPENAI_API_KEY --data-file=-
```

### **3. デプロイ実行**
```bash
# プロジェクト設定確認
gcloud config set project mac-sdo-hackathon

# Cloud Buildでデプロイ実行
cd /Users/matsushitatetsuya/Program/mah-app
gcloud builds submit --config=functions/cloudbuild.yaml
```

## 🔧 権限問題の解決

### **主な権限問題とその解決策**

| 問題 | 解決策 |
|------|--------|
| **Cloud Run デプロイ失敗** | `setup-permissions.sh`でCloud Build SAに`roles/run.admin`権限を付与 |
| **Secret Manager アクセス失敗** | Cloud Build SAと Cloud Run SAに`roles/secretmanager.secretAccessor`権限を付与 |
| **Artifact Registry プッシュ失敗** | Cloud Build SAに`roles/artifactregistry.writer`権限を付与 |
| **サービスアカウント権限不足** | Cloud Build SAに`roles/iam.serviceAccountUser`権限を付与 |

### **権限確認コマンド**
```bash
# Cloud Build サービスアカウントの権限確認
PROJECT_NUMBER=$(gcloud projects describe mac-sdo-hackathon --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects get-iam-policy mac-sdo-hackathon \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$CLOUD_BUILD_SA"
```

## 🏃 デプロイ後の確認

### **1. サービス状態確認**
```bash
# Cloud Runサービス一覧
gcloud run services list --region=asia-northeast1

# 特定サービスの詳細
gcloud run services describe meeting-app --region=asia-northeast1
```

### **2. ヘルスチェック**
```bash
# サービスURLを取得
SERVICE_URL=$(gcloud run services describe meeting-app \
  --region=asia-northeast1 \
  --format='value(status.url)')

# ヘルスチェック実行
curl $SERVICE_URL/health

# 詳細ヘルスチェック
curl $SERVICE_URL/health/detailed
```

### **3. API機能テスト**
```bash
# 会議要約テスト
curl -X POST $SERVICE_URL/summarize-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "agenda": "プロジェクト進捗確認",
    "goal": "現状把握と次ステップ決定", 
    "content": "各チームから進捗報告があり、来週までのタスクを確認しました"
  }'

# 記念日取得テスト
curl -X POST $SERVICE_URL/get-anniversary \
  -H "Content-Type: application/json" \
  -d '{"month": 6, "date": 15}'
```

## 🔍 トラブルシューティング

### **よくある問題と解決方法**

#### **1. "Permission denied" エラー**
```bash
# 権限設定スクリプトを再実行
./functions/setup-permissions.sh

# IAM権限の伝播待ち（最大10分）
sleep 600
```

#### **2. "Secret not found" エラー**
```bash
# シークレットの存在確認
gcloud secrets list | grep OPENAI_API_KEY

# シークレットの作成（存在しない場合）
echo 'your-openai-api-key' | gcloud secrets create OPENAI_API_KEY --data-file=-
```

#### **3. "Image not found" エラー**
```bash
# Artifact Registryの確認
gcloud artifacts repositories list --location=asia-northeast1

# リポジトリが存在しない場合は作成
gcloud artifacts repositories create functions \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Meeting App container repository"
```

#### **4. デプロイは成功するがアプリが起動しない**
```bash
# Cloud Runのログ確認
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=meeting-app" \
  --project=mac-sdo-hackathon \
  --limit=50

# コンテナの環境変数確認
gcloud run services describe meeting-app \
  --region=asia-northeast1 \
  --format="export"
```

## 📊 モニタリング

### **継続的な監視**
- **Cloud Console**: [Cloud Run Console](https://console.cloud.google.com/run)
- **ログ**: Cloud Logging でリアルタイム監視
- **メトリクス**: CPU使用率、メモリ使用量、リクエスト数
- **アラート**: 異常検知時の自動通知設定

### **運用推奨事項**
- 定期的なヘルスチェック実行
- ログの定期確認
- リソース使用量の監視
- セキュリティアップデートの適用

## 🎯 成功の確認

デプロイが成功すると、以下のメッセージが表示されます：

```
✅ ヘルスチェック成功 (HTTP 200)
🚀 Meeting App デプロイ完了: https://meeting-app-xxx-an.a.run.app

📋 利用可能なエンドポイント:
  - ヘルスチェック: https://meeting-app-xxx-an.a.run.app/health
  - 詳細ヘルスチェック: https://meeting-app-xxx-an.a.run.app/health/detailed
  - 会議要約: https://meeting-app-xxx-an.a.run.app/summarize-meeting
  - 音声文字起こし: https://meeting-app-xxx-an.a.run.app/recording-meeting
  - 記念日取得: https://meeting-app-xxx-an.a.run.app/get-anniversary
```

これでMeeting AppがCloud Runで正常に動作しています！🎉
