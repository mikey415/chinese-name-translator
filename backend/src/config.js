import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // For production, set FRONTEND_URL to your Vercel URL: https://your-app.vercel.app
  // Can include multiple URLs separated by commas
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173',

  // Session Configuration
  sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
  maxConversationTurns: parseInt(process.env.MAX_CONVERSATION_TURNS || '20'),

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '30'), // 30 requests per window
    maxSessionMessages: parseInt(process.env.MAX_SESSION_MESSAGES || '10'), // 10 messages per session
  },

  // Token Cost Configuration (estimate for gpt-4o-mini)
  tokenCost: {
    inputTokenPrice: 0.00015, // per 1K tokens
    outputTokenPrice: 0.0006, // per 1K tokens
    maxTokensPerSession: parseInt(process.env.MAX_TOKENS_PER_SESSION || '5000'), // ~$0.75
    costThresholdUSD: parseFloat(process.env.COST_THRESHOLD_USD || '1.0'), // Stop at $1 per session
  },

  // Default Prompt Template
  defaultPrompt: `You are an expert in Chinese naming culture and cross-cultural naming practices.

The user's provided name is: "{inputName}"
The user's default language/region is: "{locale}"

Your task is:
1. Based on the user's default language/region and name background, understand its meaning and cultural context (don't translate literally)
2. Generate 3 suitable, natural, commonly-used Chinese names (simplified Chinese characters) that real Chinese people would use
3. Prioritize frequently-used, modern, and easy-to-write character combinations that sound like authentic Chinese names
4. If the original name clearly has a full name/surname structure, prioritize providing a Chinese "surname + given name" structure
5. Provide a brief explanation in English (or the user's locale language if not English), including pinyin pronunciation

Key points:
- Both surname and given name should be in Chinese characters
- Names should not exceed 4 characters (commonly 2-3 characters)
- Aim for "authentic, commonly-used, natural" as the primary goal, avoiding forced phonetic translations
- Avoid rare, difficult-to-write characters or those with negative meanings
- Output only valid JSON, no additional text

Return valid JSON in the following format only:
{
  "primary": {
    "name": "Chinese Name",
    "explanation": "Brief explanation in English (or locale language), including pinyin"
  },
  "alternatives": [
    {
      "name": "Chinese Name 1",
      "explanation": "Brief explanation in English (or locale language), including pinyin"
    },
    {
      "name": "Chinese Name 2",
      "explanation": "Brief explanation in English (or locale language), including pinyin"
    }
  ]
}

Do not add any other text before or after the JSON. Return only valid JSON.`
};

// Validate required configuration
if (!config.openaiApiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set. Please create a .env file with your OpenAI API key.');
  process.exit(1);
}
