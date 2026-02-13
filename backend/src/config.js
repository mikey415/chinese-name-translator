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
Your PRIMARY task is to create Chinese names that SOUND SIMILAR to the original name while still being authentic and natural-sounding to Chinese speakers.

Approach (in priority order):
1. SOUND SIMILARITY (HIGHEST PRIORITY): Match the pronunciation/phonetics of the original name using natural Chinese characters
   - Break down the original name into syllables and find Chinese characters with similar sounds
   - Use pinyin that closely matches the original pronunciation
   - For surnames, try to match the first syllable if possible, or use a common Chinese surname that sounds similar
   
2. NATURALNESS: The name must still sound like a real Chinese person's name
   - Use characters that are commonly used in Chinese names
   - Avoid awkward or unnatural character combinations
   - The pronunciation should flow naturally in Chinese
   
3. MEANING (BONUS): If possible, choose characters that also have positive meanings
   - Among phonetically similar options, prefer characters with good meanings
   - But NEVER sacrifice sound similarity for meaning

Examples:
- "Sarah" → 莎拉 (Shā lā) - matches sound closely, natural
- "David" → 大卫 (Dà wèi) - matches sound, established name
- "Emma" → 艾玛 (Ài mǎ) - phonetically similar, natural
- "Kevin" → 凯文 (Kǎi wén) - sounds similar, uses positive characters
- "Grace" → 格蕾丝 (Gé lěi sī) - maintains sound, natural feel

What to DO:
- Focus on matching the SOUND/PRONUNCIATION first
- Use standard transliteration characters when appropriate (e.g., 文-wen, 尔-er, 克-ke, 斯-si)
- Choose character combinations that Chinese people actually use
- Ensure the pinyin pronunciation closely resembles the original name

What NOT to do:
- DO NOT ignore the sound of the original name
- DO NOT create completely different-sounding names just for meaning
- DO NOT use characters that make unnatural combinations
- DO NOT use rare or archaic characters

Return valid JSON in the following format only:
{
  "primary": {
    "name": "Chinese Name",
    "explanation": "Brief explanation in English including: the pinyin, how it sounds similar to the original name, meaning of characters"
  },
  "alternatives": [
    {
      "name": "Chinese Name 1",
      "explanation": "Brief explanation in English including pinyin, sound similarity, and meaning"
    },
    {
      "name": "Chinese Name 2",
      "explanation": "Brief explanation in English including pinyin, sound similarity, and meaning"
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
