import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { deleteOrder, updateOrderStatus } from '@/lib/repositories/orders';

import { VALID_ORDER_STATUSES } from '@/lib/applicationStatusLabels';

interface UpdateOrderBody {
  status: string;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const body = (await request.json()) as UpdateOrderBody;
    if (!body.status || !VALID_ORDER_STATUSES.has(body.status)) {
      return apiError('Некорректный статус заказа', 400);
    }

    const order = await updateOrderStatus(id, body.status);
    if (!order) return apiError('Заказ не найден', 404);
    return apiOk(order);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const deleted = await deleteOrder(id);
    if (!deleted) return apiError('Заказ не найден', 404);
    return apiOk({ message: 'Deleted' });
  } catch (error) {
    return apiServerError(error);
  }
}
