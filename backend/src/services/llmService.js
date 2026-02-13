import { OpenAI } from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Store conversation sessions in memory (can be replaced with database)
const conversationSessions = new Map();

// Utility function to estimate tokens
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Utility function to calculate cost
function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000) * config.tokenCost.inputTokenPrice;
  const outputCost = (outputTokens / 1000) * config.tokenCost.outputTokenPrice;
  return inputCost + outputCost;
}

export class LLMService {
  /**
   * Start a new naming session for a Chinese name
   */
  static async startSession(sessionId, inputName, locale = 'en', customPrompt = null) {
    const prompt = customPrompt || config.defaultPrompt;
    const finalPrompt = prompt
      .replace('{inputName}', inputName)
      .replace('{locale}', locale || 'en');

    const messages = [
      {
        role: 'user',
        content: finalPrompt,
      },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: config.openaiModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = response.choices[0].message.content;

      // Store conversation history
      conversationSessions.set(sessionId, {
        createdAt: Date.now(),
        inputName: inputName,
        locale: locale || 'en',
        messages: [
          { role: 'user', content: finalPrompt },
          { role: 'assistant', content: assistantMessage },
        ],
        turnCount: 1,
        totalTokensUsed: estimateTokens(finalPrompt) + estimateTokens(assistantMessage),
        totalCost: calculateCost(
          estimateTokens(finalPrompt),
          estimateTokens(assistantMessage)
        ),
      });

      // Parse and return the response
      const parsedResponse = this._parseResponse(assistantMessage);
      const session = conversationSessions.get(sessionId);
      return {
        sessionId,
        inputName,
        locale: locale || 'en',
        tokensUsed: session.totalTokensUsed,
        estimatedCost: session.totalCost.toFixed(6),
        ...parsedResponse,
      };
    } catch (error) {
      throw new Error(`Failed to generate Chinese names: ${error.message}`);
    }
  }

  /**
   * Continue a conversation session with a follow-up request
   */
  static async continueSession(sessionId, userMessage) {
    const session = conversationSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found. Please start a new session.');
    }

    // Check conversation limit
    if (session.turnCount >= config.maxConversationTurns) {
      throw new Error('Maximum conversation turns reached. Please start a new session.');
    }

    // Check session message count
    if (session.messages.length / 2 >= config.rateLimit.maxSessionMessages) {
      throw new Error(`Message limit reached (max ${config.rateLimit.maxSessionMessages} messages). Please start a new session.`);
    }

    // Estimate cost before making the request
    const estimatedInputTokens = estimateTokens(userMessage);
    const estimatedOutputTokens = 300; // Average response size
    const estimatedAddCost = calculateCost(estimatedInputTokens, estimatedOutputTokens);
    const totalEstimatedCost = session.totalCost + estimatedAddCost;

    if (totalEstimatedCost > config.tokenCost.costThresholdUSD) {
      throw new Error(`Cost is approaching the limit. Current cost: $${session.totalCost.toFixed(4)}. Please start a new session.`);
    }

    // Add user message to history
    session.messages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const response = await openai.chat.completions.create({
        model: config.openaiModel,
        messages: session.messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = response.choices[0].message.content;

      // Calculate actual token usage from response
      const inputTokensUsed = response.usage?.prompt_tokens || estimatedInputTokens;
      const outputTokensUsed = response.usage?.completion_tokens || estimateTokens(assistantMessage);
      const costAdded = calculateCost(inputTokensUsed, outputTokensUsed);

      // Update session history
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
      session.turnCount += 1;
      session.totalTokensUsed += inputTokensUsed + outputTokensUsed;
      session.totalCost += costAdded;
      session.lastActivityAt = Date.now();

      // Parse the response to extract structured data
      const parsedResponse = this._parseResponse(assistantMessage);
      
      return {
        sessionId,
        inputName: session.inputName,
        locale: session.locale || 'en',
        tokensUsed: session.totalTokensUsed,
        estimatedCost: session.totalCost.toFixed(6),
        ...parsedResponse,
      };
    } catch (error) {
      // Remove the user message if API call failed
      session.messages.pop();
      throw new Error(`Failed to process request: ${error.message}`);
    }
  }

  /**
   * Get session history
   */
  static getSession(sessionId) {
    return conversationSessions.get(sessionId);
  }

  /**
   * Clear session (cleanup)
   */
  static clearSession(sessionId) {
    conversationSessions.delete(sessionId);
  }

  /**
   * Parse LLM response to extract structured data
   */
  static _parseResponse(content) {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        primary: parsed.primary,
        alternatives: parsed.alternatives || [],
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Return raw response if parsing fails
      return {
        primary: {
          name: 'Unable to parse',
          explanation: content,
        },
        alternatives: [],
      };
    }
  }

  /**
   * Update the default prompt (useful for configuration changes)
   */
  static updateDefaultPrompt(newPrompt) {
    config.defaultPrompt = newPrompt;
  }

  /**
   * Get current default prompt
   */
  static getDefaultPrompt() {
    return config.defaultPrompt;
  }

  /**
   * Cleanup old sessions (called periodically)
   */
  static cleanupOldSessions() {
    const now = Date.now();
    const timeoutMs = config.sessionTimeoutMinutes * 60 * 1000;

    for (const [sessionId, session] of conversationSessions.entries()) {
      const lastActivity = session.lastActivityAt || session.createdAt;
      if (now - lastActivity > timeoutMs) {
        conversationSessions.delete(sessionId);
      }
    }
  }
}
