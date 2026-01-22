import React, { useState, useRef, useEffect } from 'react';
import { translationAPI } from './api/client';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [chineseName, setChineseName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load prompt on mount
  useEffect(() => {
    loadPrompt();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPrompt = async () => {
    try {
      const prompt = await translationAPI.getPrompt();
      setCurrentPrompt(prompt);
    } catch (err) {
      console.error('Failed to load prompt:', err);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!chineseName.trim()) {
      setError('Please enter a Chinese name');
      return;
    }

    setLoading(true);
    setError('');
    setMessages([]);

    try {
      const result = await translationAPI.startSession(chineseName.trim());
      setSessionId(result.sessionId);

      // Add initial response to messages
      setMessages([
        {
          role: 'assistant',
          content: result,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to translate name');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: userMsg,
          timestamp: new Date(),
        },
      ]);

      const result = await translationAPI.continueSession(sessionId, userMsg);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    if (sessionId) {
      translationAPI.clearSession(sessionId).catch(console.error);
    }
    setSessionId(null);
    setChineseName('');
    setMessages([]);
    setInputMessage('');
    setError('');
  };

  const handleSavePrompt = async () => {
    if (!currentPrompt.trim()) {
      setError('Prompt cannot be empty');
      return;
    }

    setPromptLoading(true);
    try {
      await translationAPI.updatePrompt(currentPrompt.trim());
      setShowPromptEditor(false);
      setError('');
    } catch (err) {
      setError('Failed to save prompt: ' + (err.response?.data?.message || err.message));
    } finally {
      setPromptLoading(false);
    }
  };

  const renderContent = (content) => {
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }

    if (typeof content === 'object' && content.primary) {
      return (
        <div className="translation-result">
          <div className="primary-result">
            <h3>Primary Name:</h3>
            <div className="name-box">
              <div className="name">{content.primary.name}</div>
              <div className="explanation">{content.primary.explanation}</div>
            </div>
          </div>

          {content.alternatives && content.alternatives.length > 0 && (
            <div className="alternatives">
              <h3>Alternative Names:</h3>
              <div className="alternatives-grid">
                {content.alternatives.map((alt, idx) => (
                  <div key={idx} className="alt-name-box">
                    <div className="name">{alt.name}</div>
                    <div className="explanation">{alt.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return <p>{JSON.stringify(content)}</p>;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🌏 Chinese Name to English Name Translator</h1>
          <p>Convert Chinese names to suitable English names using AI</p>
        </div>
      </header>

      <main className="main-container">
        {/* Sidebar - Prompt Editor */}
        <aside className="sidebar">
          <div className="sidebar-content">
            <h3>Settings</h3>
            <button
              className="prompt-button"
              onClick={() => setShowPromptEditor(!showPromptEditor)}
            >
              {showPromptEditor ? '✕ Close Editor' : '⚙️ Edit Prompt'}
            </button>

            {showPromptEditor && (
              <div className="prompt-editor">
                <h4>Customize AI Prompt</h4>
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="Enter your custom prompt here..."
                  rows={12}
                  className="prompt-textarea"
                />
                <button
                  onClick={handleSavePrompt}
                  disabled={promptLoading}
                  className="save-button"
                >
                  {promptLoading ? 'Saving...' : 'Save Prompt'}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="content">
          {!sessionId ? (
            // Initial Form
            <div className="form-container">
              <form onSubmit={handleStartSession}>
                <div className="form-group">
                  <label htmlFor="chineseName">Enter Chinese Name:</label>
                  <input
                    id="chineseName"
                    type="text"
                    value={chineseName}
                    onChange={(e) => setChineseName(e.target.value)}
                    placeholder="e.g., 王小明 (Wáng Xiǎomíng)"
                    disabled={loading}
                    autoFocus
                    className="input-field"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? '⏳ Processing...' : '🚀 Generate English Name'}
                </button>
              </form>

              <div className="info-box">
                <h3>How it works:</h3>
                <ol>
                  <li>Enter your Chinese name</li>
                  <li>AI will generate suitable English names</li>
                  <li>You can ask follow-up questions to refine the suggestions</li>
                  <li>Start a new session to translate another name</li>
                </ol>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="chat-container">
              <div className="chat-header">
                <h2>Translating: {messages[0]?.sessionId ? '📝' : ''} {chineseName}</h2>
                <button onClick={handleResetSession} className="reset-button">
                  🔄 New Translation
                </button>
              </div>

              <div className="messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message message-${msg.role}`}>
                    <div className="message-content">
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        renderContent(msg.content)
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message message-assistant">
                    <div className="message-content">
                      <div className="loading-spinner">⏳ Processing your request...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSendMessage} className="input-form">
                <div className="input-group">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask for more names, shorter names, feminine names, etc..."
                    disabled={loading}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSendMessage(e);
                      }
                    }}
                    className="message-input"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="send-button"
                  >
                    {loading ? '⏳' : '📤'} Send
                  </button>
                </div>
                <small>Tip: Press Ctrl+Enter to send quickly</small>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Powered by OpenAI GPT | Built with React + Node.js | Easy to deploy &
          maintain
        </p>
      </footer>
    </div>
  );
}

export default App;
