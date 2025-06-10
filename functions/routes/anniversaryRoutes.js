/**
 * 記念日関連のルート定義
 */

const express = require('express');
const AnniversaryController = require('../controllers/anniversaryController');

const router = express.Router();
const anniversaryController = new AnniversaryController();

// 記念日取得とアイスブレイク生成
router.post('/get-anniversary', (req, res) => {
  anniversaryController.getAnniversary(req, res);
});

// 今日の記念日取得
router.get('/anniversary/today', (req, res) => {
  anniversaryController.getTodayAnniversary(req, res);
});

// 指定日のすべての記念日を取得
router.get('/anniversary/all', (req, res) => {
  anniversaryController.getAllAnniversaries(req, res);
});

// ランダムな記念日を取得
router.get('/anniversary/random', (req, res) => {
  anniversaryController.getRandomAnniversary(req, res);
});

// 記念日データの統計情報を取得
router.get('/anniversary/statistics', (req, res) => {
  anniversaryController.getStatistics(req, res);
});

module.exports = router;
