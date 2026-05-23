import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listAllOrders } from '@/lib/repositories/orders';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const orders = await listAllOrders();
    return apiOk(orders);
  } catch (error) {
    return apiServerError(error);
  }
}
