'use client';

import { useState } from 'react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  usedAi?: boolean;
}

const SUGGESTION_KEYS: DictionaryKey[] = ['chatSuggestion1', 'chatSuggestion2', 'chatSuggestion3', 'chatSuggestion4', 'chatSuggestion5'];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t, lang } = useLanguage();

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
        body: JSON.stringify({ question, lang })
      });
      setMessages((m) => [...m, { role: 'assistant', text: result.answer, usedAi: result.usedAi }]);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof FetchClientError ? err.message : t('chatUnavailable'));
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-paper-muted">{t('chatTryAsking')}</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_KEYS.map((key) => (
                <button key={key} onClick={() => send(t(key))} className="rounded-full border border-paper-border px-3 py-1.5 text-xs text-paper-muted transition hover:bg-paper-bg">
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-brand-500 text-white' : 'bg-paper-bg text-paper-text'}`}>
            {m.text}
            {m.role === 'assistant' && !m.usedAi && <p className="mt-1 text-[10px] uppercase tracking-wide text-paper-faint">{t('chatGroundedAnswer')}</p>}
          </div>
        ))}
        {status === 'sending' && <div className="text-sm text-paper-muted">{t('chatThinking')}</div>}
        {status === 'error' && (
          <div className="rounded-lg border border-risk-critical/30 bg-risk-critical/5 px-3 py-2 text-sm text-paper-text">
            {errorMessage}{' '}
            <button className="underline" onClick={() => send(messages[messages.length - 1]?.text ?? '')}>
              {t('chatRetry')}
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
          placeholder={t('chatPlaceholder')}
          className="flex-1 rounded-md border border-paper-border bg-paper-surface px-3 py-2 text-sm text-paper-text"
        />
        <button type="submit" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
          {t('chatSend')}
        </button>
      </form>
    </div>
  );
}
