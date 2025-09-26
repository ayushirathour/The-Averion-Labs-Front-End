import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useLLMAssistant } from '@/hooks/useLLMAssistant';
import { useAuth } from '../contexts/AuthContext';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [responseMode, setResponseMode] = useState<'casual' | 'medical' | 'comprehensive'>('casual');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    loading,
    conversationHistory,
    callLLM,
    deleteConversationHistory
  } = useLLMAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    await callLLM(query, responseMode, false);
  };

  const handleDeleteHistory = async () => {
    if (window.confirm('Are you sure you want to delete your entire conversation history? This cannot be undone.')) {
      await deleteConversationHistory();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium">AI Assistant</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={responseMode}
                onChange={(e) => setResponseMode(e.target.value as any)}
                className="text-xs bg-blue-700 text-white rounded px-2 py-1 border-none"
              >
                <option value="casual">Casual</option>
                <option value="medical">Medical</option>
                <option value="comprehensive">Detailed</option>
              </select>

              {conversationHistory.length > 0 && (
                <button
                  onClick={handleDeleteHistory}
                  className="text-white hover:text-gray-200 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors ml-2"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Hi! I'm your AI assistant.</p>
                <p className="text-xs">Ask me anything about your medical results or just chat!</p>
              </div>
            ) : (
              conversationHistory.map((message, index) => (
                <div key={index} className={`flex space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
