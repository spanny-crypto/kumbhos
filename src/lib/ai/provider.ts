import type { Lang } from '@/lib/i18n/dictionary';

export interface AIAnswerRequest {
  question: string;
  contextText: string;
  lang?: Lang;
}

export interface AIAnswerResult {
  answer: string;
  usedAi: boolean;
}

export interface AIProvider {
  answer(request: AIAnswerRequest): Promise<AIAnswerResult>;
}
