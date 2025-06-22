# API Gateway セットアップガイド（認証なし）

Meeting AppのCloud RunサービスにAPI Gatewayを設置するためのセットアップガイドです。  
**このセットアップは認証なしの設定になっています。**

## ⚠️ セキュリティ注意事項

**この設定では API キーや認証が不要です。**
- ✅ 開発・テスト環境に適しています
- ❌ 本番環境では推奨されません
- ❌ 誰でもAPIにアクセス可能です
- ❌ 悪用される可能性があります

## 前提条件

1. Google Cloudプロジェクトが作成済み
2. gcloud CLIがインストール・認証済み
3. Cloud RunにMeeting Appがデプロイ済み
4. 適切な権限を持つサービスアカウントが作成済み

## 必要なファイル

- `openapi-spec.yaml` - OpenAPI 2.0仕様書（認証なし）
- `deploy-api-gateway.sh` - デプロイ自動化スクリプト
- `API_GATEWAY_SETUP.md` - この手順書

## セットアップ手順

### 1. 環境変数の設定

```bash
# Google Cloudプロジェクト設定
export PROJECT_ID="mac-sdo-hackathon"
export GCP_REGION="asia-northeast1"

# API Gateway設定
export API_ID="meeting-app-api"
export CONFIG_ID="meeting-app-config"
export GATEWAY_ID="meeting-app-gateway"

# Cloud Run設定
export CLOUD_RUN_SERVICE_URL="https://meeting-app-387251040101.asia-northeast1.run.app"

# サービスアカウント
export SERVICE_ACCOUNT="meeting-app-api-gateway@mac-sdo-hackathon.iam.gserviceaccount.com"
```

### 2. サービスアカウントの権限確認

```bash
# サービスアカウントが存在することを確認
gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID

# Cloud Run Invoker権限があることを確認
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:$SERVICE_ACCOUNT"
```

### 3. 自動デプロイの実行

```bash
# functionsディレクトリに移動
cd /path/to/functions

# デプロイスクリプトを実行
./deploy-api-gateway.sh
```

## デプロイ後の確認

### Gateway URLの取得

```bash
# Gateway URLを取得
GATEWAY_URL=$(gcloud api-gateway gateways describe $GATEWAY_ID \
    --location=$GCP_REGION \
    --project=$PROJECT_ID \
    --format="value(defaultHostname)")

echo "Gateway URL: https://$GATEWAY_URL"
```

### 動作確認（認証なし）

```bash
# ヘルスチェック
curl https://$GATEWAY_URL/health

# 会議要約API
curl -X POST https://$GATEWAY_URL/summarize-meeting \
    -H "Content-Type: application/json" \
    -d '{"content": "テスト会議の内容です"}'

# 記念日API
curl https://$GATEWAY_URL/anniversary/today
```

## 利用可能なエンドポイント

すべてのエンドポイントが**認証なし**でアクセス可能です：

### ヘルスチェック
- `GET /` - ルートエンドポイント
- `GET /health` - 基本ヘルスチェック
- `GET /health/detailed` - 詳細ヘルスチェック

### 会議関連
- `POST /summarize-meeting` - 会議要約
- `POST /action-item-meeting` - アクションアイテム抽出
- `POST /dispute-argument-meeting` - 争い検出・仲裁
- `POST /tangent-topic-meeting` - 脱線検出
- `POST /visualize-mermaid-meeting` - Mermaid図可視化

### 音声関連
- `POST /recording-meeting` - 音声文字起こし（バイナリ送信）
- `POST /upload-audio` - 音声アップロード（バイナリ送信）
- `GET /audio/formats` - サポート音声形式取得

### 記念日関連
- `POST /get-anniversary` - 記念日取得とアイスブレイク生成
- `GET /anniversary/today` - 今日の記念日取得
- `GET /anniversary/all` - すべての記念日取得
- `GET /anniversary/random` - ランダム記念日取得
- `GET /anniversary/statistics` - 記念日統計情報取得

## API使用例

### JavaScript (fetch)
```javascript
// ヘルスチェック
const response = await fetch('https://YOUR_GATEWAY_URL/health');
const data = await response.json();

// 会議要約
const summary = await fetch('https://YOUR_GATEWAY_URL/summarize-meeting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '会議の内容...' })
});
```

### Python (requests)
```python
import requests

# ヘルスチェック
response = requests.get('https://YOUR_GATEWAY_URL/health')
print(response.json())

# 会議要約
summary = requests.post('https://YOUR_GATEWAY_URL/summarize-meeting', 
    json={'content': '会議の内容...'})
print(summary.json())
```

### curl
```bash
# ヘルスチェック
curl https://YOUR_GATEWAY_URL/health

# 会議要約
curl -X POST https://YOUR_GATEWAY_URL/summarize-meeting \
    -H "Content-Type: application/json" \
    -d '{"content": "会議の内容..."}'
```

## トラブルシューティング

### よくある問題

1. **権限エラー**
   - サービスアカウントに`roles/run.invoker`権限が付与されているか確認

2. **API有効化エラー**
   - 必要なAPIが有効化されているか確認
   - 課金が有効になっているか確認

3. **デプロイエラー**
   - OpenAPI仕様ファイルの構文をチェック
   - Cloud Run URLが正しく設定されているか確認

4. **404エラー**
   - API Gatewayのデプロイが完了しているか確認（数分かかる場合があります）

### ログの確認

```bash
# API Gateway ログの確認
gcloud logging read "resource.type=api_gateway" --limit=50 --project=$PROJECT_ID

# Cloud Run ログの確認
gcloud logging read "resource.type=cloud_run_revision" --limit=50 --project=$PROJECT_ID
```

## 音声ファイルのアップロード

音声関連エンドポイントはバイナリデータを受け付けます：

```bash
# 音声ファイルの文字起こし
curl -X POST https://YOUR_GATEWAY_URL/recording-meeting \
    -H "Content-Type: application/octet-stream" \
    --data-binary @audio_file.wav
```

## 更新とメンテナンス

### API設定の更新

```bash
# 新しい設定バージョンを作成
gcloud api-gateway api-configs create $CONFIG_ID-v2 \
    --api=$API_ID \
    --openapi-spec=openapi-spec.yaml \
    --project=$PROJECT_ID \
    --backend-auth-service-account=$SERVICE_ACCOUNT

# Gatewayの設定を更新
gcloud api-gateway gateways update $GATEWAY_ID \
    --api-config=$CONFIG_ID-v2 \
    --location=$GCP_REGION \
    --project=$PROJECT_ID
```

### リソースの削除

```bash
# Gateway削除
gcloud api-gateway gateways delete $GATEWAY_ID --location=$GCP_REGION --project=$PROJECT_ID

# API設定削除
gcloud api-gateway api-configs delete $CONFIG_ID --api=$API_ID --project=$PROJECT_ID

# API削除
gcloud api-gateway apis delete $API_ID --project=$PROJECT_ID
```

## セキュリティ強化

### 認証を有効にする場合

```yaml
# openapi-spec.yamlに追加
securityDefinitions:
  api_key:
    type: apiKey
    name: key
    in: query

# 各エンドポイントに追加
security:
  - api_key: []
```

### IP制限を追加する場合

Cloud Armorの使用を検討してください：

```bash
# Cloud Armorセキュリティポリシー作成
gcloud compute security-policies create meeting-app-policy \
    --description="Meeting App Security Policy"

# IP許可ルール追加
gcloud compute security-policies rules create 1000 \
    --security-policy=meeting-app-policy \
    --expression="origin.ip == 'YOUR_ALLOWED_IP'" \
    --action=allow
```

## パフォーマンス

- **Cold Start**: 初回リクエストは数秒かかる場合があります
- **レート制限**: Cloud Run側で実装済み（1000リクエスト/15分）
- **タイムアウト**: API Gateway: 60秒、Cloud Run: 60秒

## 参考資料

- [Google Cloud API Gateway ドキュメント](https://cloud.google.com/api-gateway/docs)
- [OpenAPI 2.0 仕様](https://swagger.io/specification/v2/)
- [Cloud Run との連携](https://cloud.google.com/api-gateway/docs/get-started-cloud-run)