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
      setError('请输入中文名字');
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
      setError(err.response?.data?.message || err.message || '翻译失败，请重试');
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
          content: result,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '发送失败，请重试');
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
      setError('提示词不能为空');
      return;
    }

    setPromptLoading(true);
    try {
      await translationAPI.updatePrompt(currentPrompt.trim());
      setShowPromptEditor(false);
      setError('');
    } catch (err) {
      setError('保存提示词失败: ' + (err.response?.data?.message || err.message));
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
            <h3>推荐英文名：</h3>
            <div className="name-box">
              <div className="name">{content.primary.name}</div>
              <div className="explanation">{content.primary.explanation}</div>
            </div>
          </div>

          {content.alternatives && content.alternatives.length > 0 && (
            <div className="alternatives">
              <h3>其他建议：</h3>
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
          <h1>🌏 中文名字转英文名</h1>
          <p>使用 AI 技术将您的中文名字转换为合适的英文名</p>
        </div>
      </header>

      <main className="main-container">
        {/* Sidebar - Prompt Editor */}
        <aside className="sidebar">
          <div className="sidebar-content">
            <h3>设置</h3>
            <button
              className="prompt-button"
              onClick={() => setShowPromptEditor(!showPromptEditor)}
            >
              {showPromptEditor ? '✕ 关闭编辑' : '⚙️ 编辑提示词'}
            </button>

            {showPromptEditor && (
              <div className="prompt-editor">
                <h4>自定义 AI 提示词</h4>
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="在此输入自定义提示词..."
                  rows={12}
                  className="prompt-textarea"
                />
                <button
                  onClick={handleSavePrompt}
                  disabled={promptLoading}
                  className="save-button"
                >
                  {promptLoading ? '保存中...' : '保存提示词'}
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
                  <label htmlFor="chineseName">请输入您的中文名字：</label>
                  <input
                    id="chineseName"
                    type="text"
                    value={chineseName}
                    onChange={(e) => setChineseName(e.target.value)}
                    placeholder="例如：王小明"
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
                  {loading ? '⏳ 处理中...' : '🚀 生成英文名'}
                </button>
              </form>

              <div className="info-box">
                <h3>如何使用：</h3>
                <ol>
                  <li>输入您的中文名字</li>
                  <li>AI 会为您生成合适的英文名建议</li>
                  <li>您可以提出后续问题来优化建议</li>
                  <li>开始新的翻译来转换其他名字</li>
                </ol>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="chat-container">
              <div className="chat-header">
                <h2>正在翻译： {messages[0]?.sessionId ? '📝' : ''} {chineseName}</h2>
                <button onClick={handleResetSession} className="reset-button">
                  🔄 新的翻译
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
                      <div className="loading-spinner">⏳ 正在处理您的请求...</div>
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
                    placeholder="要求更多名字、简短名字、女性名字等..."
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
                    {loading ? '⏳' : '📤'} 发送
                  </button>
                </div>
                <small>提示：按 Ctrl+Enter 快速发送</small>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          由 OpenAI GPT 驱动 | 使用 React + Node.js 构建 | 易于部署和维护
        </p>
      </footer>
    </div>
  );
}

export default App;
