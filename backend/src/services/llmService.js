import { OpenAI } from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Store conversation sessions in memory (can be replaced with database)
const conversationSessions = new Map();

export class LLMService {
  /**
   * Start a new naming session for a Chinese name
   */
  static async startSession(sessionId, chineseName, customPrompt = null) {
    const prompt = customPrompt || config.defaultPrompt;
    const finalPrompt = prompt.replace('{chineseName}', chineseName);

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
        chineseName: chineseName,
        messages: [
          { role: 'user', content: finalPrompt },
          { role: 'assistant', content: assistantMessage },
        ],
        turnCount: 1,
      });

      // Parse and return the response
      const parsedResponse = this._parseResponse(assistantMessage);
      return {
        sessionId,
        chineseName,
        ...parsedResponse,
      };
    } catch (error) {
      throw new Error(`Failed to generate English names: ${error.message}`);
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

      // Update session history
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
      session.turnCount += 1;
      session.lastActivityAt = Date.now();

      // Parse the response to extract structured data
      const parsedResponse = this._parseResponse(assistantMessage);
      
      return {
        sessionId,
        chineseName: session.chineseName,
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
