import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../services/llmService.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start a new naming session
 * POST /api/sessions
 * Body: { chineseName: string, customPrompt?: string }
 */
router.post('/sessions', async (req, res) => {
  try {
    const { chineseName, customPrompt } = req.body;

    // Validation
    if (!chineseName || typeof chineseName !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'chineseName is required and must be a string',
      });
    }

    if (chineseName.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'chineseName cannot be empty',
      });
    }

    if (chineseName.length > 50) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'chineseName is too long (max 50 characters)',
      });
    }

    const sessionId = uuidv4();
    const result = await LLMService.startSession(
      sessionId,
      chineseName.trim(),
      customPrompt
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in POST /sessions:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message,
    });
  }
});

/**
 * Continue a conversation in an existing session
 * POST /api/sessions/:sessionId/messages
 * Body: { message: string }
 */
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'message is required and must be a string',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'message cannot be empty',
      });
    }

    const result = await LLMService.continueSession(sessionId, message.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in POST /sessions/:sessionId/messages:', error);

    if (error.message.includes('Session not found')) {
      return res.status(404).json({
        error: 'Session not found',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to process request',
      message: error.message,
    });
  }
});

/**
 * Get session history
 * GET /api/sessions/:sessionId
 */
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = LLMService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested session does not exist or has expired.',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        chineseName: session.chineseName,
        createdAt: session.createdAt,
        turnCount: session.turnCount,
        messageCount: session.messages.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /sessions/:sessionId:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      message: error.message,
    });
  }
});

/**
 * Clear a session
 * DELETE /api/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    LLMService.clearSession(sessionId);

    res.json({
      success: true,
      message: 'Session cleared successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /sessions/:sessionId:', error);
    res.status(500).json({
      error: 'Failed to clear session',
      message: error.message,
    });
  }
});

/**
 * Get default prompt
 * GET /api/prompt
 */
router.get('/prompt', (req, res) => {
  try {
    const prompt = LLMService.getDefaultPrompt();
    res.json({
      success: true,
      data: { prompt },
    });
  } catch (error) {
    console.error('Error in GET /prompt:', error);
    res.status(500).json({
      error: 'Failed to retrieve prompt',
      message: error.message,
    });
  }
});

/**
 * Update default prompt
 * POST /api/prompt
 * Body: { prompt: string }
 */
router.post('/prompt', (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'prompt is required and must be a string',
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'prompt cannot be empty',
      });
    }

    LLMService.updateDefaultPrompt(prompt.trim());

    res.json({
      success: true,
      message: 'Prompt updated successfully',
      data: { prompt: prompt.trim() },
    });
  } catch (error) {
    console.error('Error in POST /prompt:', error);
    res.status(500).json({
      error: 'Failed to update prompt',
      message: error.message,
    });
  }
});

export default router;
