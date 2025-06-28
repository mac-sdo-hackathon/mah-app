/**
 * OpenAI API呼び出しサービス
 */

const { config } = require("../config");
const speech = require("@google-cloud/speech").v1p1beta1;
const { GoogleGenAI } = require("@google/genai");

class GoogleService {
  constructor() {
    this.chatEndpoint = config.google.geminiEndpoint;
    this.audioEndpoint = config.google.audioEndpoint;
    this.model = config.google.model;
    this.geminiApiKey = config.google.geminiApiKey;
    // this.googleApiKey = config.google.googleApiKey;
    this.client = new speech.SpeechClient();
    this.ai = new GoogleGenAI({ apiKey: this.geminiApiKey });
  }

  async chatCompletion(prompt, systemMessage) {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemMessage,
    });
    const text = response.text;
    return text;
  }

  async audioTranscription(audioBuffer, language = "ja-JP") {
    // https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig
    const audioConfig = {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: language,
      enableSpeakerDiarization: true,
      minSpeakerCount: 2,
      maxSpeakerCount: 5,
      model: "default"
    };
    const request = {
      config: audioConfig,
      audio: {
        content: audioBuffer
      }
    }
    const [response] = await this.client.recognize(request);
    const transcription = response.results.slice(0, -1)
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  }

  isConfigValid() {
    return !!this.geminiApiKey;
  }
}

module.exports = GoogleService;
