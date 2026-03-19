'use client';

import { useState, useRef, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sendChatMessage, Message } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

const TOPICS = [
  { id: '', label: 'General GCSE CS' },
  { id: 'components-of-computer-systems', label: 'Computer Systems' },
  { id: 'software-and-development', label: 'Software & Development' },
  { id: 'exchanging-data', label: 'Exchanging Data' },
  { id: 'data-types-structures-algorithms', label: 'Data & Algorithms' },
  { id: 'the-internet', label: 'The Internet' },
  { id: 'implications', label: 'Digital Implications' },
  { id: 'programming', label: 'Programming' },
  { id: 'algorithms', label: 'Algorithms' },
];

const STARTERS = [
  'Explain the fetch-decode-execute cycle',
  'What is the difference between RAM and ROM?',
  'How does binary search work?',
  'What are the advantages of using a compiler vs interpreter?',
  'Explain what a SQL JOIN does',
  'What is the difference between lossy and lossless compression?',
];

function ChatContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const initialTopic = searchParams.get('topic') || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend(e?: FormEvent, overrideInput?: string) {
    e?.preventDefault();
    const text = (overrideInput ?? input).trim();
    if (!text || !token || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const data = await sendChatMessage(token, newMessages, topic || undefined);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get a response');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🤖 AI Tutor</h1>
          <p className="text-gray-500 text-sm">Ask anything about GCSE OCR Computer Science</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="topic-select" className="text-sm text-gray-500 hidden sm:block">Topic:</label>
          <select
            id="topic-select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError(''); }}
              className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="text-5xl mb-4">🎓</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your GCSE CS AI Tutor</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Ask me anything about OCR GCSE Computer Science. I can explain concepts, help with exam questions, and give you feedback on answers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => handleSend(undefined, starter)}
                  className="text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm text-gray-600 hover:text-indigo-700 transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="flex gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your GCSE CS question... (Enter to send, Shift+Enter for new line)"
          rows={2}
          disabled={isLoading}
          className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm disabled:opacity-60 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-md self-end"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
