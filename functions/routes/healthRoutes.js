/**
 * ヘルスチェック・システム情報関連のルート定義
 */

const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();
const healthController = new HealthController();

// ルートエンドポイント
router.get('/', (req, res) => {
  healthController.getRoot(req, res);
});

// 基本ヘルスチェック
router.get('/health', (req, res) => {
  healthController.getHealth(req, res);
});

// 詳細ヘルスチェック
router.get('/health/detailed', (req, res) => {
  healthController.getDetailedHealth(req, res);
});

module.exports = router;
