import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

function stripMarkdownFences(text) {
  return text
    .replace(/```(?:\w+)?\n?/g, '') 
    .replace(/\n?```/g, '');
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
 
    try {
      const response = await fetch('https://x2pwa5y235.execute-api.us-east-1.amazonaws.com/Prod/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw response:', data);
      
      const botMessage = {
        id: Date.now() + 1,
        text: stripMarkdownFences(data.completion),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error:', error);
      setIsConnected(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server",
        isBot: true,
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      <div className="chat-wrapper">
        
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="header-left">
              <div className="bot-avatar">
                <Bot className="bot-icon" />
              </div>
              <div className="header-info">
                <h1 className="chat-title">AI Assistant</h1>
                <div className="status-indicator">
                  <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
                  <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            </div>
            <div className="powered-by">
              Powered by Amazon Nova
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
            >
              {message.isBot && (
                <div className="message-avatar bot-avatar-small">
                  <Bot className="avatar-icon" />
                </div>
              )}
              
              <div className="message-content">
                <div className={`message-bubble ${message.isBot ? (message.isError ? 'error-bubble' : 'bot-bubble') : 'user-bubble'}`}>
                    <ReactMarkdown className="message-text">{message.text}</ReactMarkdown>
                </div>
                <div className="message-timestamp">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {!message.isBot && (
                <div className="message-avatar user-avatar-small">
                  <User className="avatar-icon" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar bot-avatar-small">
                <Bot className="avatar-icon" />
              </div>
              <div className="message-content">
                <div className="message-bubble bot-bubble loading-bubble">
                  <div className="loading-content">
                    <Loader2 className="loading-spinner" />
                    <span className="loading-text">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Loader2 className="button-icon spinning" />
              ) : (
                <Send className="button-icon" />
              )}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}