import { isAiConfigured } from '@/lib/config/env';
import { getDataProvider } from '@/lib/data';
import type { GeoPoint } from '@/lib/data/types';
import { retrieveContext } from './retrieval';
import { FallbackAIProvider } from './fallbackProvider';

export interface AssistantAnswer {
  answer: string;
  usedAi: boolean;
  matchedTopics: string[];
}

/**
 * Orchestrates retrieval-then-answer: always retrieves structured app data
 * first, then hands it to the AI provider (or the deterministic fallback if
 * AI isn't configured or fails). The AI, when used, only ever phrases the
 * retrieved facts — it cannot introduce information outside the context.
 */
export async function answerAssistantQuestion(question: string, near?: GeoPoint): Promise<AssistantAnswer> {
  const data = getDataProvider();
  const { contextText, matchedTopics } = await retrieveContext(question, data, near);

  if (isAiConfigured()) {
    try {
      const { LocalAIProvider } = await import('./localProvider');
      const result = await new LocalAIProvider().answer({ question, contextText });
      return { ...result, matchedTopics };
    } catch (err) {
      console.error('[KumbhOS] AI provider failed, falling back to grounded context:', err instanceof Error ? err.message : err);
    }
  }

  const result = await new FallbackAIProvider().answer({ question, contextText });
  return { ...result, matchedTopics };
}
