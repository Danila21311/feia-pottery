import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser } from '@/app/api/_lib/auth';
import { listOrdersByUser } from '@/lib/repositories/orders';

export async function GET() {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Не авторизован', 401);

    const orders = await listOrdersByUser(user.id);
    return apiOk(orders);
  } catch (error) {
    return apiServerError(error);
  }
}
