/**
 * 音声関連のルート定義
 */

const express = require('express');
const AudioController = require('../controllers/audioController');

const router = express.Router();
const audioController = new AudioController();

// 音声文字起こし
router.post('/recording-meeting', (req, res) => {
  audioController.transcribeAudio(req, res);
});

// 音声アップロード（将来拡張用）
router.post('/upload-audio', (req, res) => {
  audioController.uploadAudio(req, res);
});

// サポートされている音声形式の情報取得
router.get('/audio/formats', (req, res) => {
  audioController.getSupportedFormats(req, res);
});

module.exports = router;
