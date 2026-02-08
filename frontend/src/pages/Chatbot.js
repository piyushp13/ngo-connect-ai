import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getUserRole } from '../utils/auth';
import { PaperAirplaneIcon } from '@heroicons/react/solid';
import { SparklesIcon } from '@heroicons/react/outline';

const SUGGESTED_QUESTIONS = [
  'How do I donate to a campaign and get a receipt?',
  'Why is my certificate not available yet?',
  'How do I volunteer for a campaign and share onboarding details?',
  'How do volunteer opportunities and certificates work?',
  'How can I message an NGO from the platform?'
];

const BotAvatar = () => (
  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
    <SparklesIcon className="w-6 h-6" />
  </div>
);

const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
);

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Welcome! I'm NGO Connect Bot.\n\nAsk me anything about using the platform: donations, volunteering, certificates, dashboards, and messages." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const role = getUserRole() || 'guest';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const send = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .slice(-12)
        .map((m) => ({
          role: m.from === 'bot' ? 'assistant' : 'user',
          content: m.text
        }));

      const res = await api.post('/ai/chat', {
        message: input,
        history,
        clientContext: {
          role,
          path: window.location.pathname
        }
      });
      const botMessage = { from: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { from: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="bg-indigo-600 text-white p-4 flex items-center shadow-md">
        <BotAvatar />
        <div className="ml-4">
          <h2 className="text-xl font-bold">NGO Connect Bot</h2>
          <p className="text-sm opacity-80">Your platform assistant {role !== 'guest' ? `(${role})` : ''}</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => {
                setInput(q);
                inputRef.current?.focus();
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
            >
              {q}
            </button>
          ))}
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-3 animate-fade-in-up ${m.from === 'bot' ? '' : 'flex-row-reverse'}`}>
            {m.from === 'bot' ? <BotAvatar /> : <UserAvatar />}
            <div className={`max-w-md p-4 rounded-2xl ${m.from === 'bot' ? 'bg-indigo-100 text-gray-800 rounded-bl-none' : 'bg-blue-500 text-white rounded-br-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-3">
            <BotAvatar />
            <div className="max-w-md p-4 rounded-2xl bg-indigo-100 text-gray-800 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={send} className="p-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 p-3 border rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={loading}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-400 transition transform hover:scale-110"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PaperAirplaneIcon className="w-6 h-6 transform rotate-45" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Add this to your tailwind.config.js or a global CSS file
/*
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
*/
