export interface AIAnswerRequest {
  question: string;
  contextText: string;
}

export interface AIAnswerResult {
  answer: string;
  usedAi: boolean;
}

export interface AIProvider {
  answer(request: AIAnswerRequest): Promise<AIAnswerResult>;
}
