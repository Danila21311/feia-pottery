import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { listWorkshops } from '@/lib/repositories/workshops';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const workshops = await listWorkshops({ publishedOnly: false });
    return apiOk(workshops);
  } catch (error) {
    return apiServerError(error);
  }
}
