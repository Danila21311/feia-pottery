import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { getSessionUser, sessionUserToApi } from '@/app/api/_lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Не авторизован', 401);
    return apiOk({ user: sessionUserToApi(user) });
  } catch (error) {
    return apiServerError(error);
  }
}
