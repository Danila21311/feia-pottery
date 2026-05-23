import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listAllOrders } from '@/lib/repositories/orders';
import { listAllBookings } from '@/lib/repositories/workshopBookings';
import { listAllGiftOrders } from '@/lib/repositories/giftCertificateOrders';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const [orders, workshopBookings, giftCertificateOrders] = await Promise.all([
      listAllOrders(),
      listAllBookings(),
      listAllGiftOrders(),
    ]);

    return apiOk({
      orders,
      workshopBookings,
      giftCertificateOrders,
    });
  } catch (error) {
    return apiServerError(error);
  }
}
