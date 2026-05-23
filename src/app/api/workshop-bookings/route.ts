import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser, requireAdminUser } from '@/app/api/_lib/auth';
import { createWorkshopBooking } from '@/lib/repositories/workshopBookings';

interface BookingPayload {
  workshopId: string;
  selectedFormat: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  comment?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Необходимо войти в аккаунт для записи', 401);

    const body = (await request.json()) as BookingPayload;
    if (
      !body?.workshopId ||
      !body?.selectedFormat ||
      !body?.customerName ||
      !body?.customerPhone ||
      !body?.customerEmail
    ) {
      return apiError('Заполните обязательные поля', 400);
    }

    try {
      const booking = await createWorkshopBooking(user.id, {
        workshopId: body.workshopId,
        selectedFormat: body.selectedFormat,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        comment: body.comment ?? null,
      });
      return apiOk(booking);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'WORKSHOP_NOT_FOUND') return apiError('Мастер-класс не найден', 404);
      if (message === 'NO_SPOTS') return apiError('Свободных мест не осталось', 409);
      throw err;
    }
  } catch (error) {
    return apiServerError(error);
  }
}
