import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return apiError('Cloudinary не настроен', 500);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string | null) ?? 'feia';

    if (!(file instanceof File)) {
      return apiError('Файл не передан', 400);
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', UPLOAD_PRESET);
    uploadData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const res = await fetch(uploadUrl, { method: 'POST', body: uploadData });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return apiError(err?.error?.message ?? 'Ошибка загрузки изображения', 400);
    }

    const data = await res.json();
    return apiOk({ url: data.secure_url as string });
  } catch (error) {
    return apiServerError(error);
  }
}
