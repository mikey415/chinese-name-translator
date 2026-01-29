import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Session Configuration
  sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
  maxConversationTurns: parseInt(process.env.MAX_CONVERSATION_TURNS || '20'),

  // Default Prompt Template
  defaultPrompt: `你是一位精通中英文取名文化的专家，深入理解中英文命名习惯。

用户提供的中文名字是："{chineseName}"

重要说明：在中文命名习惯中，姓氏排在第一位（通常是第一个字），其余字为名字。

你的任务是：
1. 提取姓氏（第一个汉字）并保持不变
2. 提取名字（第一个字之后的所有汉字作为一个整体）
3. 分析完整的名字（所有字合在一起）的含义、发音和文化意义
4. 生成3个合适的英文名字（真实的英文名，如：Michael、Sarah、David、Jennifer 等），要与完整的中文名字相匹配
5. 将原始姓氏与每个英文名字组合
6. 对于每个组合，解释英文名字如何与原始中文名字相关联（整体含义、发音相似性或文化意义）

关键要点：
- 如果名字有多个字，需要把所有字作为一个整体来考虑，而不是单独考虑
- 不要只用第二个字，要用第一个字之后的所有字
- 名字部分不要使用汉字，只使用英文名字
- 使用适合多字名字组合含义的常见英文名

示例：如果名字是"万智麟"（万 Zhì Lín）：
- 姓氏：万（保持不变）
- 名字：智麟（两个字合在一起 - 表示"智慧"+"麒麟/吉祥" = 聪慧吉祥的人）
- 考虑智麟的完整含义，而不是只考虑智
- 智麟（作为整体）的英文名：William（聪慧、强大）、Alexander（智者、领袖）或 Benjamin（聪慧、受人尊敬）
- 结果："万 William"、"万 Alexander"、"万 Benjamin"

只用中文回复！仅以以下格式返回有效的JSON：
{
  "primary": {
    "name": "姓氏 + 英文名字",
    "explanation": "为什么这个名字合适"
  },
  "alternatives": [
    {
      "name": "姓氏 + 英文名字1",
      "explanation": "为什么这个名字合适"
    },
    {
      "name": "姓氏 + 英文名字2",
      "explanation": "为什么这个名字合适"
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
