import { signOut } from '@/auth';
import { apiOk, apiServerError } from '@/app/api/_lib/response';

export async function POST() {
  try {
    await signOut({ redirect: false });
    return apiOk({ message: 'ok' });
  } catch (error) {
    return apiServerError(error);
  }
}
