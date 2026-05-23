import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser, sessionUserToApi } from '@/app/api/_lib/auth';
import { updateProfileName, getUserProfile } from '@/lib/repositories/users';

interface ProfileBody {
  name: string;
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Не авторизован', 401);

    const body = (await request.json()) as ProfileBody;
    await updateProfileName(user.id, body.name ?? '');

    const fresh = await getUserProfile(user.id);
    if (!fresh) return apiError('Профиль не найден', 404);

    return apiOk({ user: sessionUserToApi(fresh) });
  } catch (error) {
    return apiServerError(error);
  }
}
