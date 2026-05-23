import { signIn } from '@/auth';
import { mapAuthErrorMessage } from '@/lib/authMessages';
import { findUserByEmail, getUserProfile } from '@/lib/repositories/users';
import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { sessionUserToApi } from '@/app/api/_lib/auth';

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return apiError('Укажите email и пароль', 400);
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result && typeof result === 'object' && 'error' in result && result.error) {
      return apiError(mapAuthErrorMessage('Invalid login credentials'), 401);
    }

    const dbUser = await findUserByEmail(email);
    if (!dbUser) {
      return apiError(mapAuthErrorMessage('Invalid login credentials'), 401);
    }

    const user = await getUserProfile(dbUser.id);
    if (!user) {
      return apiError(mapAuthErrorMessage('Invalid login credentials'), 401);
    }

    return apiOk({ user: sessionUserToApi(user) });
  } catch (error) {
    return apiServerError(error);
  }
}
