const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Secrets Manager からGemini API キーを取得
async function getGeminiApiKey() {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  console.log(projectId)
  const secretName = `projects/${projectId}/secrets/gemini-api-key/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({
      name: secretName,
    });

    return version.payload.data.toString();
  } catch (error) {
    console.error('Error accessing secret:', error);
    throw error;
  }
}

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

module.exports = {
  config,
  getGeminiApiKey
};
