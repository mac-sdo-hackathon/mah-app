/**
 * Meeting App - Express.js Application
 * リファクタリング後のメインアプリケーションファイル
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');

// ミドルウェア
const { requestLogger, securityHeaders, apiUsageTracker, simpleRateLimit } = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// ルート
const meetingRoutes = require('./routes/meetingRoutes');
const audioRoutes = require('./routes/audioRoutes');
const anniversaryRoutes = require('./routes/anniversaryRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Express アプリケーション初期化
const app = express();

// 基本ミドルウェア設定
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'audio/*', limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// セキュリティとログミドルウェア
app.use(securityHeaders);
app.use(requestLogger);
app.use(apiUsageTracker);

// レート制限（本番環境のみ）
if (config.server.environment === 'production') {
  app.use(simpleRateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 1000, // 1000リクエスト/15分
    message: 'API利用制限に達しました。しばらく待ってから再試行してください。',
  }));
}

// ルート設定
app.use('/', healthRoutes);           // ヘルスチェック・システム情報
app.use('/', meetingRoutes);          // 会議関連API
app.use('/', audioRoutes);            // 音声関連API
app.use('/', anniversaryRoutes);      // 記念日関連API

// API使用量統計エンドポイント（開発環境のみ）
if (config.server.environment === 'development') {
  const { getApiUsageStats } = require('./middleware/logger');
  app.get('/stats/usage', (req, res) => {
    res.json({
      usage: getApiUsageStats(),
      note: 'この統計は開発環境でのみ利用可能です',
    });
  });
}

// 404ハンドラー
app.use(notFoundHandler);

// グローバルエラーハンドラー
app.use(errorHandler);

// サーバー起動
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// 未処理の例外をキャッチ
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
