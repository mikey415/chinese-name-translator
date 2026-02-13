import React, { useState, useRef, useEffect } from 'react';
import { translationAPI } from './api/client';
import './App.css';

// Throttle function to prevent rapid API calls
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [inputName, setInputName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
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

  const getUserLocale = () => {
    if (navigator.languages && navigator.languages.length > 0) {
      return navigator.languages[0];
    }
    return navigator.language || 'en';
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);
    setError('');
    setMessages([]);
    setEstimatedCost(0);

    try {
      const locale = getUserLocale();
      const result = await translationAPI.startSession(inputName.trim(), locale);
      setSessionId(result.sessionId);
      setEstimatedCost(parseFloat(result.estimatedCost) || 0);

      // Add initial response to messages
      setMessages([
        {
          role: 'assistant',
          content: result,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate a Chinese name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId || loading) return;

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
      setEstimatedCost(parseFloat(result.estimatedCost) || estimatedCost);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send. Please try again.');
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
    setInputName('');
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
            <h3>Recommended Chinese Name:</h3>
            <div className="name-box">
              <div className="name">{content.primary.name}</div>
              <div className="explanation">{content.primary.explanation}</div>
            </div>
          </div>

          {content.alternatives && content.alternatives.length > 0 && (
            <div className="alternatives">
              <h3>Other Suggestions:</h3>
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
          <h1>🌏 Get Your Chinese Name</h1>
          <p>Generate a culturally appropriate Chinese name based on your language and name</p>
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
                <h4>Custom AI Prompt</h4>
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="Enter a custom prompt here..."
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
                  <label htmlFor="inputName">Enter your name:</label>
                  <input
                    id="inputName"
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g., Michael Johnson"
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
                  {loading ? '⏳ Generating...' : '🚀 Generate Chinese Name'}
                </button>
              </form>

              <div className="info-box">
                <h3>How it works:</h3>
                <ol>
                  <li>Enter your name in your preferred language</li>
                  <li>AI generates Chinese name suggestions</li>
                  <li>Ask follow-up questions to refine the result</li>
                  <li>Start a new session for another name</li>
                </ol>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="chat-container">
              <div className="chat-header">
                <div>
                  <h2>Generating for: {messages[0]?.sessionId ? '📝' : ''} {inputName}</h2>
                  {estimatedCost > 0 && (
                    <p className="cost-info">Estimated cost: ${estimatedCost.toFixed(4)} USD</p>
                  )}
                </div>
                <button onClick={handleResetSession} className="reset-button">
                  🔄 New Session
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
                    placeholder="Ask for more names, a shorter name, a feminine name, etc..."
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
          Powered by OpenAI | Built with React + Node.js | Easy to deploy and maintain
        </p>
      </footer>
    </div>
  );
}

export default App;
