import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser } from '@/app/api/_lib/auth';
import { listBookingsByUser } from '@/lib/repositories/workshopBookings';

export async function GET() {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Не авторизован', 401);

    const bookings = await listBookingsByUser(user.id);
    return apiOk(bookings);
  } catch (error) {
    return apiServerError(error);
  }
}
