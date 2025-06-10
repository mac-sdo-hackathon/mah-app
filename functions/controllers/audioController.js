/**
 * 音声関連のコントローラー
 */

const OpenAIService = require('../services/openaiService');
const { base64ToBuffer } = require('../utils/audioUtils');

class AudioController {
  constructor() {
    this.openaiService = new OpenAIService();
  }

  /**
   * 音声文字起こし
   */
  async transcribeAudio(req, res) {
    try {
      const { audioBase64 } = req.body;

      // 入力検証
      if (!audioBase64) {
        return res.status(400).json({
          status: 'failed',
          error: 'audioBase64 は必須項目です',
          details: 'Base64エンコードされた音声データを送信してください',
        });
      }

      if (typeof audioBase64 !== 'string') {
        return res.status(400).json({
          status: 'failed',
          error: 'audioBase64 は文字列である必要があります',
        });
      }

      // Base64データの妥当性チェック
      try {
        // Base64文字列の基本的な妥当性チェック
        if (!audioBase64.match(/^[A-Za-z0-9+/]+=*$/)) {
          throw new Error('Invalid base64 format');
        }
      } catch (error) {
        return res.status(400).json({
          status: 'failed',
          error: '無効なBase64形式です',
          details: '正しいBase64エンコードされた音声データを送信してください',
        });
      }

      // Base64をBufferに変換
      const audioBuffer = base64ToBuffer(audioBase64);

      // 音声データのサイズチェック（25MB制限）
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (audioBuffer.length > maxSize) {
        return res.status(400).json({
          status: 'failed',
          error: '音声ファイルが大きすぎます',
          details: 'ファイルサイズは25MB以下にしてください',
        });
      }

      // OpenAI APIで文字起こし実行
      const transcription = await this.openaiService.audioTranscription(audioBuffer, 'ja');

      console.log('Transcription result:', transcription);
      res.json({ content: transcription });

    } catch (error) {
      console.error('Error in recording-meeting:', error);
      
      // エラーの種類に応じてレスポンスを分岐
      if (error.message.includes('OpenAI')) {
        res.status(503).json({
          status: 'failed',
          error: 'OpenAI APIエラー',
          details: '音声認識サービスで問題が発生しました。しばらく待ってから再試行してください。',
        });
      } else {
        res.status(500).json({
          status: 'failed',
          error: error.message,
          details: '音声の文字起こし中にエラーが発生しました。音声ファイルの形式やサイズを確認してください。',
        });
      }
    }
  }

  /**
   * 音声アップロード（将来的にファイルアップロードに対応する場合）
   */
  async uploadAudio(req, res) {
    try {
      // 将来的にマルチパートファイルアップロードに対応
      res.status(501).json({
        status: 'not_implemented',
        message: 'ファイルアップロード機能は未実装です',
        details: 'Base64エンコードでの音声送信をご利用ください',
      });
    } catch (error) {
      console.error('Error in upload-audio:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
      });
    }
  }

  /**
   * サポートされている音声形式の情報取得
   */
  getSupportedFormats(req, res) {
    try {
      res.json({
        supportedFormats: [
          'mp3',
          'mp4',
          'mpeg',
          'mpga',
          'm4a',
          'wav',
          'webm',
        ],
        maxFileSize: '25MB',
        recommendedFormat: 'webm',
        encoding: 'base64',
        note: 'Base64エンコードされた音声データを audioBase64 フィールドで送信してください',
      });
    } catch (error) {
      console.error('Error in get-supported-formats:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
      });
    }
  }
}

module.exports = AudioController;
