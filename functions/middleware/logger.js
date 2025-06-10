/**
 * ログ記録ミドルウェア
 */

/**
 * リクエスト/レスポンスログミドルウェア
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // リクエスト情報をログ出力
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // レスポンス終了時にログ出力
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const responseTimestamp = new Date().toISOString();
    
    console.log(`[${responseTimestamp}] Response: ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    });
  });

  next();
}

/**
 * セキュリティヘッダー設定ミドルウェア
 */
function securityHeaders(req, res, next) {
  // セキュリティヘッダーを設定
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 開発環境以外ではHTTPS強制
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * API使用量追跡ミドルウェア
 */
function apiUsageTracker(req, res, next) {
  // 簡易的なAPI使用量追跡（本格的にはRedisなどを使用）
  const endpoint = req.originalUrl;
  const method = req.method;
  const timestamp = new Date().toISOString();

  // メモリ内に使用量を記録（実際の本番環境では永続化が必要）
  if (!global.apiUsage) {
    global.apiUsage = {};
  }

  const key = `${method} ${endpoint}`;
  if (!global.apiUsage[key]) {
    global.apiUsage[key] = {
      count: 0,
      firstAccess: timestamp,
      lastAccess: timestamp,
    };
  }

  global.apiUsage[key].count++;
  global.apiUsage[key].lastAccess = timestamp;

  // 使用量をヘッダーに含める（デバッグ用）
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-API-Usage-Count', global.apiUsage[key].count);
  }

  next();
}

/**
 * レート制限ミドルウェア（簡易版）
 */
function simpleRateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15分
    maxRequests = 100, // 最大リクエスト数
    message = 'リクエスト数が制限を超えました',
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 古いリクエスト記録を削除
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        status: 'rate_limit_exceeded',
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        details: `1分間に${maxRequests}回までのリクエストが可能です`,
      });
    }

    // 現在のリクエストを記録
    userRequests.push(now);
    requests.set(key, userRequests);

    // レート制限情報をヘッダーに含める
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - userRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
}

/**
 * API使用量統計取得
 */
function getApiUsageStats() {
  return global.apiUsage || {};
}

module.exports = {
  requestLogger,
  securityHeaders,
  apiUsageTracker,
  simpleRateLimit,
  getApiUsageStats,
};
