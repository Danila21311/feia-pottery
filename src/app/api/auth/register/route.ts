import { signIn } from '@/auth';
import { createUser, emailIsTaken, getUserProfile } from '@/lib/repositories/users';
import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { sessionUserToApi } from '@/app/api/_lib/auth';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim();
    const password = body.password;
    const name = body.name?.trim() ?? '';

    if (!email || !password) {
      return apiError('Укажите email и пароль', 400);
    }
    if (password.length < 6) {
      return apiError('Пароль должен быть не короче 6 символов', 400);
    }

    if (await emailIsTaken(email)) {
      return apiError(
        'Пользователь с таким email уже зарегистрирован. Войдите в аккаунт или восстановите пароль.',
        409,
      );
    }

    const profile = await createUser(email, password, name);

    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult && typeof signInResult === 'object' && 'error' in signInResult && signInResult.error) {
      return apiOk({ user: sessionUserToApi(profile) });
    }

    const fresh = (await getUserProfile(profile.id)) ?? profile;
    return apiOk({ user: sessionUserToApi(fresh) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    if (message.includes('users_email_unique')) {
      return apiError(
        'Пользователь с таким email уже зарегистрирован. Войдите в аккаунт или восстановите пароль.',
        409,
      );
    }
    return apiServerError(error);
  }
}
