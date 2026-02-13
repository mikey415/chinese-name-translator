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
  defaultPrompt: `你是一位精通中文取名文化与跨文化命名的专家。

用户提供的名字是："{inputName}"
用户默认语言/地区是："{locale}"

你的任务是：
1. 根据用户的默认语言/地区和名字背景，理解其发音、含义与文化语境
2. 生成3个合适的中文名字（简体中文），可以包含常见姓氏与名字的组合
3. 名字应尽量兼顾：发音相近、含义贴近或文化气质相符
4. 如果原名明显是全名/姓名结构，请优先给出“姓 + 名”的中文结构
5. 在解释中给出简短的含义说明，可包含拼音

关键要点：
- 姓氏与名字都应为中文汉字
- 名字不要超过4个汉字
- 避免生僻、难写或含义不佳的字
- 仅输出有效JSON，不要任何额外文本

仅以以下格式返回有效的JSON：
{
  "primary": {
    "name": "中文姓名",
    "explanation": "简短中文解释，可含拼音"
  },
  "alternatives": [
    {
      "name": "中文姓名1",
      "explanation": "简短中文解释，可含拼音"
    },
    {
      "name": "中文姓名2",
      "explanation": "简短中文解释，可含拼音"
    }
  ]
}

不要在JSON前后添加任何其他文本。只返回有效的JSON。`
};

// Validate required configuration
if (!config.openaiApiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set. Please create a .env file with your OpenAI API key.');
  process.exit(1);
}
