import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser } from '@/app/api/_lib/auth';
import { listGiftOrdersByUser } from '@/lib/repositories/giftCertificateOrders';

export async function GET() {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Не авторизован', 401);

    const orders = await listGiftOrdersByUser(user.id);
    return apiOk(orders);
  } catch (error) {
    return apiServerError(error);
  }
}
