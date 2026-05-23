import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { deleteGiftCertificateOrder, updateGiftOrderPaymentStatus } from '@/lib/repositories/giftCertificateOrders';
import { VALID_PAYMENT_STATUSES } from '@/lib/applicationStatusLabels';

interface UpdateBody {
  paymentStatus: string;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const body = (await request.json()) as UpdateBody;

    if (!body.paymentStatus || !VALID_PAYMENT_STATUSES.has(body.paymentStatus)) {
      return apiError('Некорректный статус', 400);
    }

    const order = await updateGiftOrderPaymentStatus(id, body.paymentStatus);
    if (!order) return apiError('Заявка не найдена', 404);

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
    const deleted = await deleteGiftCertificateOrder(id);
    if (!deleted) return apiError('Заявка не найдена', 404);
    return apiOk({ message: 'Deleted' });
  } catch (error) {
    return apiServerError(error);
  }
}
