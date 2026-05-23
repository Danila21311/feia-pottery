import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { getSessionUser } from '@/app/api/_lib/auth';
import { createFeedback } from '@/lib/repositories/feedbackRequests';

interface FeedbackPayload {
  name: string;
  email: string;
  message: string;
  source?: string;
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const body = (await request.json()) as FeedbackPayload;

    if (!body.name || !body.email || !body.message) {
      return apiError('Заполните обязательные поля', 400);
    }

    const feedback = await createFeedback({
      user_id: sessionUser?.id ?? null,
      name: body.name,
      email: body.email,
      message: body.message,
      source: body.source ?? 'contacts_form',
    });

    return apiOk(feedback);
  } catch (error) {
    return apiServerError(error);
  }
}
