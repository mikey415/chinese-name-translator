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
Create SHORT Chinese names where BOTH the surname AND given name phonetically match the original name.

REQUIREMENTS:
1. STRUCTURE: Must have a proper Chinese name structure
   - Surname: 1 character (from actual Chinese surnames)
   - Given name: 1-2 characters
   - Total: 2-3 characters

2. SURNAME SELECTION (PHONETIC MATCHING PRIORITY):
   - The surname MUST match the sound of the first syllable(s) of the original name
   - Use these phonetically-matched Chinese surnames:
     * Li/Lee sounds → 李(Lǐ), 黎(Lí)
     * Ma/Mo sounds → 马(Mǎ), 莫(Mò)
     * Wang/Wong sounds → 王(Wáng)
     * Zhang/Zha sounds → 张(Zhāng)
     * Chen/Chan sounds → 陈(Chén)
     * Liu/Lu sounds → 刘(Liú), 卢(Lú)
     * Wu sounds → 吴(Wú)
     * Zhou/Jo sounds → 周(Zhōu)
     * Xu/Shu sounds → 徐(Xú)
     * Sun sounds → 孙(Sūn)
     * Gao/Go sounds → 高(Gāo)
     * Lin sounds → 林(Lín)
     * He/Ho sounds → 何(Hé)
     * Luo/Lo/Ro sounds → 罗(Luó)
     * Mai/Mi sounds → 麦(Mài)
     * Tang/Tom sounds → 汤(Tāng)
     * Dai/Da sounds → 戴(Dài)
   - If no surname matches well, use a surname that sounds close to the beginning of the name

3. GIVEN NAME (SOUND SIMILARITY):
   - Match the remaining pronunciation of the original name
   - Use transliteration characters: 杰(jié), 克(kè), 尔(ěr), 文(wén), 丽(lì), 莎(shā), 斯(sī), 特(tè), 森(sēn), 逊(xùn), 伦(lún), 米(mǐ), 卡(kǎ), 娜(nà), 拉(lā), 维(wéi), 德(dé), 安(ān), 伯(bó), 瑞(ruì), 凯(kǎi), 艾(ài), 玛(mǎ), 娅(yà)

EXAMPLES (FOLLOW THIS STYLE):
- "Michael" → 麦克尔 (Mài Kè Ěr) - "Mai" matches "Mi-", "ke-er" matches "-chael"
- "Jackson" → 杰克逊 (Jié Kè Xùn) - given name only, or 周克逊 (Zhōu Kè Xùn) if full structure
- "David" → 戴维 (Dài Wéi) - "Dai" matches "Da-", "wei" matches "-vid"
- "Lisa" → 丽莎 (Lì Shā) - "Li" matches "Li-", "sha" matches "-sa"
- "Sarah" → 莎拉 (Shā Lā) - surname omitted since no good match, or add 孙莎拉 (Sūn Shā Lā)
- "Kevin" → 凯文 (Kǎi Wén) - sounds like "Ke-vin"
- "Tom" → 汤姆 (Tāng Mǔ) - "Tang" matches "Tom"
- "Monica" → 莫妮卡 (Mò Nī Kǎ) - "Mo" matches "Mo-"
- "William" → 威廉 (Wēi Lián) - surname omitted, or 吴廉 (Wú Lián)

WHAT TO DO:
- Match surname sound to the FIRST syllable(s) of the original name
- Match given name sound to the REMAINING syllables
- Keep it 2-3 characters total
- Make it natural and pronounceable

WHAT NOT TO DO:
- DO NOT pick random surnames unrelated to the sound
- DO NOT create 4+ character names
- DO NOT ignore phonetic similarity in the surname
- DO NOT make overly complex transliterations

Return valid JSON in the following format only:
{
  "primary": {
    "name": "2-3 Character Chinese Name",
    "explanation": "Pinyin and explanation of how BOTH surname and given name match the original sound"
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
