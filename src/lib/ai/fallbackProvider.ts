import type { AIAnswerRequest, AIAnswerResult, AIProvider } from './provider';
import type { Lang } from '@/lib/i18n/dictionary';

const NO_CONTEXT: Record<Lang, string> = {
  en: 'Live information is currently unavailable for that. Try asking about toilets, medical facilities, crowd conditions, routes, or events.',
  hi: 'इसके लिए लाइव जानकारी अभी उपलब्ध नहीं है. शौचालय, चिकित्सा सुविधाओं, भीड़ की स्थिति, मार्गों, या कार्यक्रमों के बारे में पूछने का प्रयास करें.',
  mr: 'यासाठी लाइव्ह माहिती सध्या उपलब्ध नाही. शौचालये, वैद्यकीय सुविधा, गर्दीची स्थिती, मार्ग, किंवा कार्यक्रमांबद्दल विचारून पहा.'
};

/**
 * Used whenever no AI backend is configured, or the configured one fails or
 * times out. Never invents anything — it just surfaces the retrieved,
 * structured context directly. This guarantees the assistant remains useful
 * even with zero external dependencies, per the "demo must work offline"
 * requirement.
 */
export class FallbackAIProvider implements AIProvider {
  async answer({ contextText, lang = 'en' }: AIAnswerRequest): Promise<AIAnswerResult> {
    if (!contextText.trim()) {
      return { answer: NO_CONTEXT[lang], usedAi: false };
    }
    return { answer: contextText, usedAi: false };
  }
}
