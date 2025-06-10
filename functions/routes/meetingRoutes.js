/**
 * 会議関連のルート定義
 */

const express = require('express');
const MeetingController = require('../controllers/meetingController');

const router = express.Router();
const meetingController = new MeetingController();

// 会議要約
router.post('/summarize-meeting', (req, res) => {
  meetingController.summarizeMeeting(req, res);
});

// アクションアイテム抽出
router.post('/action-item-meeting', (req, res) => {
  meetingController.extractActionItems(req, res);
});

// 争い検出・仲裁
router.post('/dispute-argument-meeting', (req, res) => {
  meetingController.detectDispute(req, res);
});

// 脱線検出
router.post('/tangent-topic-meeting', (req, res) => {
  meetingController.detectTangent(req, res);
});

// Mermaid図可視化
router.post('/visualize-mermaid-meeting', (req, res) => {
  meetingController.visualizeMermaid(req, res);
});

module.exports = router;
