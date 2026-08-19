import { answerAssistantQuestion } from '@/lib/ai';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

// Server-side only — this is the one place the AI key/base URL is ever
// touched. The browser only ever calls this route, never the AI backend
// directly.
export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = (await req.json().catch(() => null)) as { question?: string } | null;
    const question = body?.question?.trim();
    if (!question) return apiError('VALIDATION_ERROR', 'A question is required.');
    if (question.length > 500) return apiError('VALIDATION_ERROR', 'Question is too long.');

    const result = await answerAssistantQuestion(question);
    return apiSuccess(result);
  });
}
