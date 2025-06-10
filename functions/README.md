# 機能

- **会議要約**: 会議内容から議事録を生成
- **アクションアイテム抽出**: 会議から次のアクションを抽出
- **争い検出・仲裁**: 会議での争いを検出し、仲裁案を提案
- **脱線検出**: アジェンダから脱線していないかをチェック
- **Mermaid図可視化**: 会議内容をマーメード図で可視化
- **音声文字起こし**: 音声をテキストに変換
- **記念日取得**: 指定日の記念日を使ったアイスブレイク

# API エンドポイント

## 会議関連
- `POST /summarize-meeting` - 会議要約
- `POST /action-item-meeting` - アクションアイテム抽出
- `POST /dispute-argument-meeting` - 争い検出・仲裁
- `POST /tangent-topic-meeting` - 脱線検出
- `POST /visualize-mermaid-meeting` - マーメード図可視化
- `POST /recording-meeting` - 音声文字起こし
- `POST /get-anniversary` - 記念日取得

## ヘルスチェック
- `GET /` - サービス状態確認
- `GET /health` - ヘルスチェック

# API使用例

## 会議要約
\`\`\`bash
curl -X POST https://YOUR_SERVICE_URL/summarize-meeting \\
  -H "Content-Type: application/json" \\
  -d '{
    "agenda": "プロジェクトの進捗確認",
    "goal": "現状把握と次のステップの決定",
    "content": "各チームから進捗報告があり、来週までのタスクを確認しました"
  }'
\`\`\`

## 音声文字起こし
\`\`\`bash
curl -X POST https://YOUR_SERVICE_URL/recording-meeting \\
  -H "Content-Type: application/json" \\
  -d '{
    "audioBase64": "base64_encoded_audio_data"
  }'
\`\`\`

## 記念日取得
\`\`\`bash
curl -X POST https://YOUR_SERVICE_URL/get-anniversary \\
  -H "Content-Type: application/json" \\
  -d '{
    "month": 6,
    "date": 9
  }'
\`\`\`
