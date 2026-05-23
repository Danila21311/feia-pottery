import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { deleteWorkshopBooking, updateBookingPaymentStatus } from '@/lib/repositories/workshopBookings';
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

    const booking = await updateBookingPaymentStatus(id, body.paymentStatus);
    if (!booking) return apiError('Запись не найдена', 404);

    return apiOk(booking);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const deleted = await deleteWorkshopBooking(id);
    if (!deleted) return apiError('Запись не найдена', 404);
    return apiOk({ message: 'Deleted' });
  } catch (error) {
    return apiServerError(error);
  }
}
