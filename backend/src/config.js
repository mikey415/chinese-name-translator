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
  defaultPrompt: `You are an expert in Chinese name transliteration and phonetic adaptation.

The user's provided name is: "{inputName}"
The user's default language/region is: "{locale}"

CRITICAL INSTRUCTIONS:
Create SHORT, PHONETICALLY SIMILAR Chinese transliterations that sound like the original name.

REQUIREMENTS:
1. LENGTH: Must be 2-3 Chinese characters TOTAL (including both surname and given name if applicable)
   - For single names: 2-3 characters
   - For full names: Use 2-3 characters total (e.g., 1 char surname + 1-2 char given name)

2. SOUND SIMILARITY (HIGHEST PRIORITY): 
   - Match the pronunciation of the original name as closely as possible
   - Break down the name into syllables and find Chinese characters with matching sounds
   - The pinyin should sound very similar to the original pronunciation
   
3. NATURAL CHARACTER SELECTION:
   - Use characters commonly seen in transliterations (e.g., 杰-jie, 克-ke, 尔-er, 文-wen, 丽-li, 莎-sha, 斯-si, 特-te, 森-sen, 逊-xun)
   - Prefer characters with positive or neutral meanings
   - Avoid awkward combinations

4. COMPACTNESS:
   - Condense the name intelligently - don't try to match every syllable
   - Focus on the most distinctive sounds
   - Make it memorable and pronounceable

EXAMPLES (FOLLOW THIS STYLE):
- "Michael Jackson" → 麦杰逊 (Mài Jié Xùn) - 3 chars, sounds like Mi-chael Jack-son
- "David" → 大卫 (Dà Wèi) - 2 chars, sounds like Da-vid
- "Sarah" → 莎拉 (Shā Lā) - 2 chars, sounds like Sa-rah
- "Emma Stone" → 艾玛 (Ài Mǎ) - 2 chars, sounds like Em-ma
- "Kevin" → 凯文 (Kǎi Wén) - 2 chars, sounds like Ke-vin
- "Lisa" → 丽莎 (Lì Shā) - 2 chars, sounds like Li-sa
- "Tom" → 汤姆 (Tāng Mǔ) - 2 chars, sounds like Tom

WHAT TO DO:
- Create compact 2-3 character transliterations
- Match the sound/phonetics closely
- Use established transliteration characters
- Make it flow naturally in Chinese

WHAT NOT TO DO:
- DO NOT create 4+ character names
- DO NOT ignore the original pronunciation
- DO NOT use traditional Chinese surnames like 李, 王, 张 unless they phonetically match
- DO NOT create meaning-based names that sound completely different

Return valid JSON in the following format only:
{
  "primary": {
    "name": "2-3 Character Chinese Name",
    "explanation": "Pinyin (pronunciation) and brief note on how it matches the original sound"
  },
  "alternatives": [
    {
      "name": "2-3 Character Chinese Name",
      "explanation": "Pinyin and sound matching explanation"
    },
    {
      "name": "2-3 Character Chinese Name",
      "explanation": "Pinyin and sound matching explanation"
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
