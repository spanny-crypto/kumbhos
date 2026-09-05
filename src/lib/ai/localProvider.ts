import { env } from '@/lib/config/env';
import type { AIAnswerRequest, AIAnswerResult, AIProvider } from './provider';
import type { Lang } from '@/lib/i18n/dictionary';

const LANGUAGE_NAME: Record<Lang, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

function systemPrompt(lang: Lang): string {
  return `You are the KumbhOS Assistant, embedded in a crowd-safety and infrastructure platform for a large gathering.
Answer ONLY using the CONTEXT block provided in the user message. Never invent facility locations, emergency numbers,
live crowd conditions, official government instructions, or medical advice. If the answer is not in the context, say
"Live information is currently unavailable for that." (translated into ${LANGUAGE_NAME[lang]} if that is not English).
Keep answers under 4 sentences and practical. Respond in ${LANGUAGE_NAME[lang]}, regardless of what language the
CONTEXT block is written in — translate the facts, don't just repeat the source language.`;
}

/**
 * Calls an OpenAI-compatible chat completions endpoint (works with Ollama,
 * vLLM, or a compatible hosted provider) configured via AI_BASE_URL /
 * AI_MODEL / AI_API_KEY. Never called from the client — this module is only
 * imported from src/app/api/assistant/route.ts.
 */
export class LocalAIProvider implements AIProvider {
  async answer({ question, contextText, lang = 'en' }: AIAnswerRequest): Promise<AIAnswerResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${env.ai.baseUrl!.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.ai.apiKey ? { Authorization: `Bearer ${env.ai.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: env.ai.model,
          messages: [
            { role: 'system', content: systemPrompt(lang) },
            { role: 'user', content: `CONTEXT:\n${contextText}\n\nQUESTION: ${question}` }
          ],
          temperature: 0.2,
          max_tokens: 300
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`AI backend returned ${res.status}`);
      const json = await res.json();
      const content: string | undefined = json?.choices?.[0]?.message?.content;
      if (!content) throw new Error('AI backend returned an empty response');
      return { answer: content.trim(), usedAi: true };
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
}
