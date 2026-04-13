import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Loader2, 
  RotateCcw,
  X,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIAssistant = ({ onClose }) => {
  const [messages, setLogs] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your AI Business Assistant. How can I help you analyze your business today?",
      id: 1
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, id: Date.now() };
    setLogs(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/query', { question: userMessage.content });
      const aiMessage = { 
        role: 'assistant', 
        content: response.data.response, 
        id: Date.now() + 1 
      };
      setLogs(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please check your connection.", 
        id: Date.now() + 1,
        isError: true
      };
      setLogs(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center">
            <Bot size={14} />
          </div>
          <span className="text-sm font-bold text-slate-700">AI Assistant</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : msg.isError 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {msg.role === 'assistant' && !msg.isError ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full text-left border-collapse text-xs" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                    th: ({node, ...props}) => <th className="px-3 py-2 border border-slate-200 font-bold text-slate-800" {...props} />,
                    td: ({node, ...props}) => <td className="px-3 py-2 border border-slate-200 text-slate-700" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="font-bold text-slate-900 mt-3 mb-1" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text"
            placeholder="Type a message..."
            className="admin-input pr-10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
