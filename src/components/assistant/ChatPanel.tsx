'use client';

import { useState } from 'react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  usedAi?: boolean;
}

const SUGGESTIONS = [
  'Where is the nearest toilet?',
  'Which sector currently has the lowest crowd pressure?',
  'Where is the nearest medical facility?',
  'My grandmother is walking slowly, which route should we take?',
  'What events are happening today?'
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function send(question: string) {
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setStatus('sending');
    setErrorMessage(null);
    try {
      const result = await fetchJSON<{ answer: string; usedAi: boolean }>('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      setMessages((m) => [...m, { role: 'assistant', text: result.answer, usedAi: result.usedAi }]);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof FetchClientError ? err.message : 'The assistant is temporarily unavailable.');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-paper-muted">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-paper-border px-3 py-1.5 text-xs text-paper-muted transition hover:bg-paper-bg">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-brand-500 text-white' : 'bg-paper-bg text-paper-text'}`}>
            {m.text}
            {m.role === 'assistant' && !m.usedAi && <p className="mt-1 text-[10px] uppercase tracking-wide text-paper-faint">grounded answer · no AI backend configured</p>}
          </div>
        ))}
        {status === 'sending' && <div className="text-sm text-paper-muted">Thinking…</div>}
        {status === 'error' && (
          <div className="rounded-lg border border-risk-critical/30 bg-risk-critical/5 px-3 py-2 text-sm text-paper-text">
            {errorMessage}{' '}
            <button className="underline" onClick={() => send(messages[messages.length - 1]?.text ?? '')}>
              Retry
            </button>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-paper-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about facilities, crowd conditions, routes…"
          className="flex-1 rounded-md border border-paper-border bg-paper-surface px-3 py-2 text-sm text-paper-text"
        />
        <button type="submit" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
          Send
        </button>
      </form>
    </div>
  );
}
