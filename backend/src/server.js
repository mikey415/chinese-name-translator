import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import apiRoutes from './routes/api.js';
import { LLMService } from './services/llmService.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl.split(',').map(url => url.trim()),
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Cleanup old sessions every 10 minutes
setInterval(() => {
  LLMService.cleanupOldSessions();
}, 10 * 60 * 1000);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║  Chinese Name to English Translator - Backend     ║
╚════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Frontend URL: ${config.frontendUrl}
Environment: ${config.nodeEnv}
OpenAI Model: ${config.openaiModel}

API Endpoints:
  POST   /api/sessions                    - Start new naming session
  POST   /api/sessions/:id/messages       - Continue conversation
  GET    /api/sessions/:id                - Get session info
  DELETE /api/sessions/:id                - Clear session
  GET    /api/prompt                      - Get current prompt
  POST   /api/prompt                      - Update prompt
  GET    /api/health                      - Health check
  `);
});
