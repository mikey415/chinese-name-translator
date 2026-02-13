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
Create SHORT Chinese names with REAL CHINESE SURNAMES that sound similar to the original name.

REQUIREMENTS:
1. STRUCTURE: Must have a proper Chinese name structure
   - Use an ACTUAL Chinese surname: 李(Li), 王(Wang), 张(Zhang), 刘(Liu), 陈(Chen), 杨(Yang), 黄(Huang), 赵(Zhao), 吴(Wu), 周(Zhou), 徐(Xu), 孙(Sun), 马(Ma), 朱(Zhu), 胡(Hu), 郭(Guo), 何(He), 高(Gao), 林(Lin), 罗(Luo)
   - Surname: 1 character
   - Given name: 1-2 characters that phonetically match the original name
   - Total: 2-3 characters

2. SURNAME SELECTION:
   - If the original name's first sound matches a common surname, use it (e.g., "Li-" → 李Li, "Wang" → 王Wang)
   - Otherwise, pick a common surname that sounds close or natural
   - Common surnames are preferred

3. GIVEN NAME (SOUND SIMILARITY):
   - Match the pronunciation of the original name (or key syllables)
   - Use transliteration characters: 杰(jie), 克(ke), 尔(er), 文(wen), 丽(li), 莎(sha), 斯(si), 特(te), 森(sen), 逊(xun), 伦(lun), 米(mi), 卡(ka), 娜(na), 拉(la), 维(wei), 德(de), 安(an), 伯(bo), 瑞(rui), etc.

4. COMPACTNESS:
   - Keep it short and memorable
   - Focus on the most distinctive sounds

EXAMPLES (FOLLOW THIS STYLE):
- "Michael Jackson" → 麦杰逊 (Mài Jié Xùn) or 李杰逊 (Lǐ Jié Xùn) - real surname + phonetic match
- "David Smith" → 王大卫 (Wáng Dà Wèi) or 戴维 (Dài Wéi) - with real surname
- "Sarah" → 莎拉 (Shā Lā) or 李莎拉 (Lǐ Shā Lā) - can work as given name or add surname
- "Kevin" → 凯文 (Kǎi Wén) or 李凯文 (Lǐ Kǎi Wén) - with real surname
- "Lisa Brown" → 李莎 (Lǐ Shā) or 丽莎 (Lì Shā) - natural transliteration
- "Tom Wilson" → 汤姆 (Tāng Mǔ) - surname sounds like Tom
- "Amy" → 王艾米 (Wáng Ài Mǐ) or 艾米 (Ài Mǐ)

WHAT TO DO:
- Always include a real Chinese surname when creating full names
- Match the sound/phonetics of the original name in the given name portion
- Keep it 2-3 characters total
- Make it natural and pronounceable

WHAT NOT TO DO:
- DO NOT create 4+ character names
- DO NOT make up fake surnames
- DO NOT ignore phonetic similarity
- DO NOT make overly complex transliterations

Return valid JSON in the following format only:
{
  "primary": {
    "name": "2-3 Character Chinese Name with Real Surname",
    "explanation": "Pinyin (pronunciation) and brief note on the surname choice and how the given name matches the original sound"
  },
  "alternatives": [
    {
      "name": "2-3 Character Chinese Name",
      "explanation": "Pinyin and explanation of surname and sound matching"
    },
    {
      "name": "2-3 Character Chinese Name",
      "explanation": "Pinyin and explanation of surname and sound matching"
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
