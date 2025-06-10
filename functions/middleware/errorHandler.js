/**
 * エラーハンドリングミドルウェア
 */

/**
 * 404エラーハンドラー
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'not_found',
    error: 'エンドポイントが見つかりません',
    details: `${req.method} ${req.originalUrl} は存在しません`,
    available_endpoints: [
      'POST /summarize-meeting',
      'POST /action-item-meeting',
      'POST /dispute-argument-meeting',
      'POST /tangent-topic-meeting',
      'POST /visualize-mermaid-meeting',
      'POST /recording-meeting',
      'POST /get-anniversary',
      'GET /health',
      'GET /',
    ],
  });
}

/**
 * グローバルエラーハンドラー
 */
function errorHandler(err, req, res, next) {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // レスポンスがすでに送信されている場合は何もしない
  if (res.headersSent) {
    return next(err);
  }

  // エラーの種類に応じてレスポンスを分岐
  let statusCode = 500;
  let errorResponse = {
    status: 'error',
    error: 'サーバー内部エラーが発生しました',
    timestamp: new Date().toISOString(),
  };

  // OpenAI APIエラー
  if (err.message.includes('OpenAI')) {
    statusCode = 503;
    errorResponse.error = 'AI サービスで問題が発生しました';
    errorResponse.details = 'しばらく待ってから再試行してください';
  }
  // バリデーションエラー
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = 'リクエストデータが無効です';
    errorResponse.details = err.message;
  }
  // JSON解析エラー
  else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorResponse.error = 'JSONデータの解析に失敗しました';
    errorResponse.details = 'リクエストボディが正しいJSON形式ではありません';
  }
  // ペイロードサイズエラー
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    errorResponse.error = 'リクエストサイズが大きすぎます';
    errorResponse.details = 'ファイルサイズを小さくして再試行してください';
  }
  // タイムアウトエラー
  else if (err.code === 'ETIMEDOUT') {
    statusCode = 504;
    errorResponse.error = 'リクエストがタイムアウトしました';
    errorResponse.details = 'しばらく待ってから再試行してください';
  }

  // 開発環境ではスタックトレースを含める
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.original_error = err.message;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 非同期エラーキャッチャー
 */
function asyncErrorCatcher(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncErrorCatcher,
};
