import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listProducts } from '@/lib/repositories/products';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const products = await listProducts({ publishedOnly: false });
    return apiOk(products);
  } catch (error) {
    return apiServerError(error);
  }
}
