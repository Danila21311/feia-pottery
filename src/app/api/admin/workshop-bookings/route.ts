import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listAllBookings } from '@/lib/repositories/workshopBookings';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const bookings = await listAllBookings();
    return apiOk(bookings);
  } catch (error) {
    return apiServerError(error);
  }
}
