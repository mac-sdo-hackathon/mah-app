/**
 * 会議関連のコントローラー
 */

const OpenAIService = require('../services/openaiService');
const { prompts, systemMessages } = require('../utils/prompts');

class MeetingController {
  constructor() {
    this.openaiService = new OpenAIService();
  }

  /**
   * 入力データの検証
   * @param {Object} body - リクエストボディ
   * @returns {Object} - 検証結果 {isValid, errors, data}
   */
  validateMeetingInput(body) {
    const { agenda, goal, content } = body;
    const errors = [];

    if (!agenda || typeof agenda !== 'string') {
      errors.push('agenda は必須の文字列項目です');
    }

    if (!goal || typeof goal !== 'string') {
      errors.push('goal は必須の文字列項目です');
    }

    if (!content || typeof content !== 'string') {
      errors.push('content は必須の文字列項目です');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: { agenda, goal, content },
    };
  }

  /**
   * 会議要約
   */
  async summarizeMeeting(req, res) {
    try {
      const validation = this.validateMeetingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'failed',
          error: 'バリデーションエラー',
          details: validation.errors,
        });
      }

      const { agenda, goal, content } = validation.data;
      const prompt = prompts.summarizeMeeting(agenda, goal, content);
      const result = await this.openaiService.chatCompletion(prompt, systemMessages.meetingExpert);

      res.json({ content: result });
    } catch (error) {
      console.error('Error in summarize-meeting:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '会議要約の処理中にエラーが発生しました',
      });
    }
  }

  /**
   * アクションアイテム抽出
   */
  async extractActionItems(req, res) {
    try {
      const validation = this.validateMeetingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'failed',
          error: 'バリデーションエラー',
          details: validation.errors,
        });
      }

      const { agenda, goal, content } = validation.data;
      const prompt = prompts.extractActionItems(agenda, goal, content);
      const result = await this.openaiService.chatCompletion(prompt, systemMessages.meetingExpert);

      res.json({ content: result });
    } catch (error) {
      console.error('Error in action-item-meeting:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: 'アクションアイテム抽出の処理中にエラーが発生しました',
      });
    }
  }

  /**
   * 争い検出・仲裁
   */
  async detectDispute(req, res) {
    try {
      const validation = this.validateMeetingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'failed',
          error: 'バリデーションエラー',
          details: validation.errors,
        });
      }

      const { agenda, goal, content } = validation.data;
      const prompt = prompts.detectDispute(agenda, goal, content);
      const result = await this.openaiService.chatCompletion(prompt, systemMessages.meetingExpert);

      res.json({ content: result });
    } catch (error) {
      console.error('Error in dispute-argument-meeting:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '争い検出・仲裁の処理中にエラーが発生しました',
      });
    }
  }

  /**
   * 脱線検出
   */
  async detectTangent(req, res) {
    try {
      const validation = this.validateMeetingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'failed',
          error: 'バリデーションエラー',
          details: validation.errors,
        });
      }

      const { agenda, goal, content } = validation.data;
      const prompt = prompts.detectTangent(agenda, goal, content);
      const result = await this.openaiService.chatCompletion(prompt, systemMessages.meetingExpert);

      res.json({ content: result });
    } catch (error) {
      console.error('Error in tangent-topic-meeting:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '脱線検出の処理中にエラーが発生しました',
      });
    }
  }

  /**
   * Mermaid図可視化
   */
  async visualizeMermaid(req, res) {
    try {
      const validation = this.validateMeetingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'failed',
          error: 'バリデーションエラー',
          details: validation.errors,
        });
      }

      const { agenda, goal, content } = validation.data;
      const prompt = prompts.visualizeMermaid(agenda, goal, content);
      const result = await this.openaiService.chatCompletion(prompt, systemMessages.meetingExpert);

      res.json({ content: result });
    } catch (error) {
      console.error('Error in visualize-mermaid-meeting:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: 'Mermaid図可視化の処理中にエラーが発生しました',
      });
    }
  }
}

module.exports = MeetingController;
