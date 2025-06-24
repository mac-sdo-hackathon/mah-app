// OpenAI API設定
const config = {
  openai: {
    chatEndpoint: "https://api.openai.com/v1/chat/completions",
    audioEndpoint: "https://api.openai.com/v1/audio/transcriptions",
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  },
  google: {
    audioEndpoint: "https://speech.googleapis.com/v1p1beta1/speech:recognize",
    geminiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-2.0-flash",
    // process.env.GOOGLE_APPLICATION_CREDENTIALS に設定しないと音声は使えない
    googleApiKey: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    geminiApiKey: process.env.GEMINI_API_KEY,
  },
  server: {
    port: process.env.PORT || 8080,
    environment: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

module.exports = config;
