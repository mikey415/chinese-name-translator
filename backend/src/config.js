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

CRITICAL INSTRUCTIONS:
Your task is to create AUTHENTIC CHINESE NAMES that sound natural to native Chinese speakers - NOT phonetic translations or transliterations of the original name.

Approach:
1. Understand the MEANING, PERSONALITY, or CULTURAL SIGNIFICANCE of the original name (not just the sound)
2. Choose a common Chinese surname (e.g., 李, 王, 张, 刘, 陈, 杨, 黄, 赵, 吴, 周)
3. Create a given name using characters with POSITIVE MEANINGS and good cultural connotations
4. The name should sound like it belongs to a real Chinese person, not like a foreign name converted to Chinese

What to DO:
- Use popular, modern Chinese character combinations
- Choose characters with beautiful meanings (e.g., 美-beauty, 文-cultured, 雅-elegant, 俊-handsome, 浩-vast, 婷-graceful)
- Make it sound harmonious and natural when pronounced
- Use common naming patterns Chinese parents actually use
- If the original name has a clear meaning (like "Grace", "Victor"), incorporate that meaning with appropriate Chinese characters

What NOT to do:
- DO NOT create phonetic translations (e.g., "Michael" → "迈克尔")
- DO NOT try to match the sound of the original name
- DO NOT use uncommon or archaic characters
- DO NOT create names that sound foreign or unnatural

Examples of GOOD Chinese names: 李雅文, 王俊杰, 张美玲, 刘浩然, 陈思婷
Examples of BAD names (avoid these): 迈克尔, 约翰逊, 玛丽亚

Return valid JSON in the following format only:
{
  "primary": {
    "name": "Chinese Name",
    "explanation": "Brief explanation in English including: the pinyin, meaning of each character, and why this name was chosen"
  },
  "alternatives": [
    {
      "name": "Chinese Name 1",
      "explanation": "Brief explanation in English including pinyin and meaning"
    },
    {
      "name": "Chinese Name 2",
      "explanation": "Brief explanation in English including pinyin and meaning"
    }
  ]
}

Output ONLY valid JSON, no other text.`
};

// Validate required configuration
if (!config.openaiApiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set. Please create a .env file with your OpenAI API key.');
  process.exit(1);
}
