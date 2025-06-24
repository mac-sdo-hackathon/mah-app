/**
 * 記念日関連のコントローラー
 */

const OpenAIService = require('../services/openaiService');
const GoogleService = require('../services/googleService');
const AnniversaryService = require('../services/anniversaryService');
const { prompts, systemMessages } = require('../utils/prompts');

class AnniversaryController {
  constructor() {
    this.openaiService = new OpenAIService();
    this.googleService = new GoogleService();
    this.anniversaryService = new AnniversaryService();
  }

  /**
   * 記念日取得とアイスブレイク生成
   */
  async getAnniversary(req, res) {
    try {
      const { month, date } = req.body;

      // 入力検証
      if (month === undefined || date === undefined) {
        return res.status(400).json({
          status: 'failed',
          error: 'month と date は必須項目です',
          details: 'month (1-12) と date (1-31) を指定してください',
        });
      }

      if (!this.anniversaryService.isValidDate(month, date)) {
        return res.status(400).json({
          status: 'failed',
          error: '無効な日付です',
          details: 'month (1-12) と date (1-31) を正しく指定してください',
        });
      }

      // 記念日を取得
      const selectedAnniversary = this.anniversaryService.getRandomAnniversary(month, date);

      if (!selectedAnniversary) {
        return res.json({
          content: `${month}/${date} の記念日は見つかりませんでした。`,
          date: `${month}/${date}`,
          anniversary: null,
        });
      }

      // アイスブレイク生成
      const dateString = `${month}/${date}`;
      const prompt = prompts.generateIcebreaker(dateString, selectedAnniversary);
      // const icebreaker = await this.openaiService.chatCompletion(prompt, systemMessages.icebreakerExpert);
      const icebreaker = await this.googleService.chatCompletion(prompt, systemMessages.icebreakerExpert);

      res.json({
        content: icebreaker,
        date: dateString,
        anniversary: selectedAnniversary,
      });

    } catch (error) {
      console.error('Error in get-anniversary:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '記念日取得の処理中にエラーが発生しました',
      });
    }
  }

  /**
   * 今日の記念日取得
   */
  async getTodayAnniversary(req, res) {
    try {
      const today = this.anniversaryService.getTodayDate();
      
      // 今日の日付で記念日取得
      req.body = today;
      await this.getAnniversary(req, res);

    } catch (error) {
      console.error('Error in get-today-anniversary:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '今日の記念日取得中にエラーが発生しました',
      });
    }
  }

  /**
   * 指定日のすべての記念日を取得
   */
  async getAllAnniversaries(req, res) {
    try {
      const { month, date } = req.query;

      // クエリパラメータを数値に変換
      const monthNum = parseInt(month, 10);
      const dateNum = parseInt(date, 10);

      if (!this.anniversaryService.isValidDate(monthNum, dateNum)) {
        return res.status(400).json({
          status: 'failed',
          error: '無効な日付です',
          details: 'month (1-12) と date (1-31) を正しく指定してください',
        });
      }

      const anniversaries = this.anniversaryService.getAnniversaries(monthNum, dateNum);

      res.json({
        date: `${monthNum}/${dateNum}`,
        count: anniversaries.length,
        anniversaries: anniversaries,
      });

    } catch (error) {
      console.error('Error in get-all-anniversaries:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '記念日一覧取得中にエラーが発生しました',
      });
    }
  }

  /**
   * 記念日データの統計情報を取得
   */
  async getStatistics(req, res) {
    try {
      const stats = this.anniversaryService.getStatistics();
      
      res.json({
        statistics: stats,
        description: {
          totalMonths: '記録されている月数',
          totalDates: '記念日が設定されている日付数',
          totalAnniversaries: '総記念日数',
          averagePerDate: '1日あたりの平均記念日数',
        },
      });

    } catch (error) {
      console.error('Error in get-statistics:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: '統計情報取得中にエラーが発生しました',
      });
    }
  }

  /**
   * ランダムな記念日を取得（日付を指定しない場合）
   */
  async getRandomAnniversary(req, res) {
    try {
      // ランダムな日付を生成
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDate = Math.floor(Math.random() * 28) + 1; // 28日以内で安全

      req.body = { month: randomMonth, date: randomDate };
      await this.getAnniversary(req, res);

    } catch (error) {
      console.error('Error in get-random-anniversary:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
        details: 'ランダム記念日取得中にエラーが発生しました',
      });
    }
  }
}

module.exports = AnniversaryController;
