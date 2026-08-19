import type { AIAnswerRequest, AIAnswerResult, AIProvider } from './provider';

/**
 * Used whenever no AI backend is configured, or the configured one fails or
 * times out. Never invents anything — it just surfaces the retrieved,
 * structured context directly. This guarantees the assistant remains useful
 * even with zero external dependencies, per the "demo must work offline"
 * requirement.
 */
export class FallbackAIProvider implements AIProvider {
  async answer({ contextText }: AIAnswerRequest): Promise<AIAnswerResult> {
    if (!contextText.trim()) {
      return { answer: 'Live information is currently unavailable for that. Try asking about toilets, medical facilities, crowd conditions, routes, or events.', usedAi: false };
    }
    return { answer: contextText, usedAi: false };
  }
}
