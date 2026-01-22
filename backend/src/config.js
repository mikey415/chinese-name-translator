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
  defaultPrompt: `You are an expert in cross-cultural naming and understand both Chinese and English naming conventions.

A user has provided a Chinese name: "{chineseName}"

IMPORTANT INSTRUCTION: In Chinese naming convention, the FAMILY NAME comes FIRST (usually the first character), followed by the GIVEN NAME (all remaining characters).

Your task is to:
1. Extract the family name (the first Chinese character) and keep it unchanged
2. Extract the given name (ALL remaining Chinese characters after the first one as a complete unit)
3. Analyze the COMPLETE given name (all characters together) for its meaning, pronunciation, and cultural significance
4. Generate 3 suitable ENGLISH FIRST NAMES (actual English names like: Michael, Sarah, David, Jennifer, etc.) that match the complete given name
5. Combine the original family name with each English given name
6. For each combination, explain how the English name relates to the complete original Chinese given name (overall meaning, phonetic similarity, or cultural significance)

CRITICAL POINTS:
- If there are multiple characters in the given name, consider ALL of them together as one unit, not individually
- Do NOT use only the second character - use ALL characters from position 2 onwards
- Do NOT output Chinese characters as the given name. Use only ENGLISH NAMES.
- Use common English names that suit the combined meaning of the multi-character given name

Example: If the name is "万智麟" (Wan Zhi Lin):
- Family name: 万 (keep unchanged)
- Given name: 智麟 (BOTH characters together - means "wisdom" + "unicorn/auspicious" = wise and fortunate person)
- Consider the FULL meaning of 智麟, not just 智 alone
- English names for 智麟 (as a complete unit): William (wise, strong), Alexander (defender/wise), or Benjamin (wise/honored)
- Results: "万 William", "万 Alexander", "万 Benjamin"

Respond ONLY in valid JSON format with this exact structure:
{
  "primary": {
    "name": "Family Name + English Given Name",
    "explanation": "Why this name is suitable"
  },
  "alternatives": [
    {
      "name": "Family Name + Alternative English Given Name 1",
      "explanation": "Why this name works"
    },
    {
      "name": "Family Name + Alternative English Given Name 2",
      "explanation": "Why this name works"
    }
  ]
}

Do not include any text before or after the JSON. Only return valid JSON.`
};

// Validate required configuration
if (!config.openaiApiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set. Please create a .env file with your OpenAI API key.');
  process.exit(1);
}
