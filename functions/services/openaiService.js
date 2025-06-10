/**
 * OpenAI API呼び出しサービス
 */

const config = require('../config');

class OpenAIService {
  constructor() {
    this.chatEndpoint = config.openai.chatEndpoint;
    this.audioEndpoint = config.openai.audioEndpoint;
    this.model = config.openai.model;
    this.apiKey = config.openai.apiKey;
  }

  /**
   * チャット補完APIを呼び出し
   * @param {string} prompt - プロンプト
   * @param {string} systemMessage - システムメッセージ
   * @returns {Promise<string>} - API応答
   */
  async chatCompletion(prompt, systemMessage) {
    try {
      const response = await fetch(this.chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Chat API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Chat API error:', error);
      throw error;
    }
  }

  /**
   * 音声文字起こしAPIを呼び出し
   * @param {Buffer} audioBuffer - 音声データのBuffer
   * @param {string} language - 言語コード (デフォルト: 'ja')
   * @returns {Promise<string>} - 文字起こし結果
   */
  async audioTranscription(audioBuffer, language = 'ja') {
    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", language);
      formData.append('response_format', 'text');

      const response = await fetch(this.audioEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI Audio API error: ${response.status} ${response.statusText}`);
      }

      const transcription = await response.text();
      return transcription;
    } catch (error) {
      console.error('OpenAI Audio API error:', error);
      throw error;
    }
  }

  /**
   * API設定の検証
   * @returns {boolean} - API設定が有効かどうか
   */
  isConfigValid() {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }
}

module.exports = OpenAIService;
