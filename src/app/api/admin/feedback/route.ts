import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listAllFeedback } from '@/lib/repositories/feedbackRequests';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const feedback = await listAllFeedback();
    return apiOk(feedback);
  } catch (error) {
    return apiServerError(error);
  }
}
