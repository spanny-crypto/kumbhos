'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/useVoice';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  usedAi?: boolean;
}

const SUGGESTION_KEYS: DictionaryKey[] = ['chatSuggestion1', 'chatSuggestion2', 'chatSuggestion3', 'chatSuggestion4', 'chatSuggestion5'];
const VOICE_REPLY_STORAGE_KEY = 'kumbhos-voice-replies';

// Voice input/output for the AI Assistant — for a user who can't read
// comfortably, tap the mic instead of typing, and hear the answer instead
// of reading it. Both directions use the browser's built-in Web Speech API
// only (see hooks/useVoice.ts) — no external service, no cost.
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceRepliesOn, setVoiceRepliesOn] = useState(true);
  const { t, lang } = useLanguage();
  const recognition = useSpeechRecognition(lang);
  const synthesis = useSpeechSynthesis();
  const lastSpokenIndex = useRef(-1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_REPLY_STORAGE_KEY);
      if (saved !== null) setVoiceRepliesOn(saved === 'true');
    } catch {
      // Private browsing / storage blocked — keep the default (on).
    }
  }, []);

  function toggleVoiceReplies() {
    setVoiceRepliesOn((v) => {
      const next = !v;
      try {
        localStorage.setItem(VOICE_REPLY_STORAGE_KEY, String(next));
      } catch {
        // Non-fatal — just won't persist.
      }
      if (!next) synthesis.cancel();
      return next;
    });
  }

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

  // Auto-speak new assistant answers when voice replies are on — this is
  // the accessibility default (not an opt-in), since a user who can't read
  // well also can't necessarily read "tap here to hear this" instructions.
  useEffect(() => {
    if (!voiceRepliesOn) return;
    const last = messages[messages.length - 1];
    const lastIndex = messages.length - 1;
    if (last?.role === 'assistant' && lastIndex !== lastSpokenIndex.current) {
      lastSpokenIndex.current = lastIndex;
      synthesis.speak(last.text, lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceRepliesOn]);

  function handleMic() {
    if (recognition.listening) {
      recognition.stop();
      return;
    }
    synthesis.cancel();
    recognition.start((transcript) => send(transcript));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end border-b border-paper-border px-3 py-2">
        {synthesis.supported && (
          <button
            onClick={toggleVoiceReplies}
            className="flex items-center gap-1.5 rounded-full border border-paper-border px-2.5 py-1 text-xs text-paper-muted transition hover:bg-paper-bg"
            title={voiceRepliesOn ? t('chatVoiceOn') : t('chatVoiceOff')}
          >
            {voiceRepliesOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span aria-hidden="true">🔊</span>
          </button>
        )}
      </div>
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
            {recognition.supported && <p className="text-xs text-paper-faint">🎤 {t('chatTapToSpeak')}</p>}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-brand-500 text-white' : 'bg-paper-bg text-paper-text'}`}>
            <div className="flex items-start gap-2">
              <span className="flex-1">{m.text}</span>
              {m.role === 'assistant' && synthesis.supported && (
                <button
                  onClick={() => synthesis.speak(m.text, lang)}
                  aria-label={t('chatReadAloud')}
                  title={t('chatReadAloud')}
                  className="shrink-0 rounded-full p-1 text-paper-muted hover:bg-paper-border"
                >
                  <span aria-hidden="true">🔊</span>
                </button>
              )}
            </div>
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
        {recognition.supported && (
          <button
            type="button"
            onClick={handleMic}
            aria-label={recognition.listening ? t('chatListening') : t('chatTapToSpeak')}
            title={recognition.listening ? t('chatListening') : t('chatTapToSpeak')}
            className={`fast-transition flex shrink-0 items-center justify-center rounded-full px-3 text-lg ${
              recognition.listening ? 'animate-blink bg-risk-intervention text-white' : 'border border-paper-border text-paper-muted hover:bg-paper-bg'
            }`}
          >
            {recognition.listening ? <Square size={16} /> : <Mic size={16} />}
            <span aria-hidden="true" className="ml-1">🎤</span>
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={recognition.listening ? t('chatListening') : t('chatPlaceholder')}
          className="flex-1 rounded-md border border-paper-border bg-paper-surface px-3 py-2 text-sm text-paper-text"
        />
        <button type="submit" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
          {t('chatSend')}
        </button>
      </form>
    </div>
  );
}
