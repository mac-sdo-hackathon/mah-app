// OpenAI API設定
const config = {
  openai: {
    chatEndpoint: "https://api.openai.com/v1/chat/completions",
    audioEndpoint: "https://api.openai.com/v1/audio/transcriptions",
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  },
  server: {
    port: process.env.PORT || 8080,
    environment: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://mac-sdo-hackathon.web.app/', 'https://mac-sdo-hackathon.firebaseapp.com/']
      : '*'
  },
};

module.exports = config;
