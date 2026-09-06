import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, HelpCircle, Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const HelpChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'help'>('help');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Hello! I am the Vitality AI Assistant. I can help you with understanding this dashboard, identifying supply shortages, or answering clinical doubts. How can I help you today?'
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        }]);
      } else {
        throw new Error(data.error || 'Failed to fetch response');
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered a network error while trying to connect to the Gemini API. Please make sure the server is running and the API key is valid.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-2xl transition hover:scale-105 z-50 flex items-center justify-center"
        title="Help & AI Support"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm sm:max-w-md h-[550px] bg-slate-50 border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">Vitality AI Support</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-slate-900 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white text-xs">
        <button
          onClick={() => setActiveTab('help')}
          className={`flex-1 py-2.5 font-semibold transition ${activeTab === 'help' ? 'text-amber-600 border-b-2 border-amber-400 bg-slate-50/50' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Quick Guide
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 font-semibold transition ${activeTab === 'chat' ? 'text-sky-600 border-b-2 border-sky-400 bg-slate-50/50' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> AI Chat
          </div>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
        {activeTab === 'help' ? (
          <div className="space-y-4 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 text-sm">Welcome to Vitality Command</h4>
            <p>This platform connects Primary Health Centres (PHC), District Medical Officers (DMO), and Government Hospitals to create a unified surveillance network.</p>
            
            <div className="space-y-2">
              <h5 className="font-bold text-amber-600">PHC Dashboard</h5>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use the <strong>Live Attendance</strong> button to verify identity via Geofenced Webcam.</li>
                <li>Upload stock registries using the <strong>AI Vision Extractor</strong>.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-bold text-sky-600">DMO Dashboard</h5>
              <ul className="list-disc pl-4 space-y-1">
                <li>View the <strong>Interactive GIS Map</strong> for live epidemic alerts (Red/Orange zones).</li>
                <li>Run <strong>Gemini Threat Analysis</strong> to auto-allocate medicines and ventilators.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-indigo-600">Hospital Dashboard</h5>
              <ul className="list-disc pl-4 space-y-1">
                <li>Track live ICU and Ventilator availability.</li>
                <li>Quickly admit patients and allocate beds in real-time.</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-slate-100 rounded-xl border border-slate-300">
              <p className="font-semibold text-slate-900 mb-1">Have more questions?</p>
              <p>Switch to the <strong>AI Chat</strong> tab to ask Gemini for help with platform usage, logistics, or clinical definitions.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 min-h-full justify-end">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-sky-600' : 'bg-slate-700'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-slate-900" /> : <Bot className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-sm' : 'bg-slate-100 border border-slate-300 text-slate-800 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 rounded-tl-sm flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span className="text-xs text-slate-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isTyping}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
