import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { getWorkshopById, updateWorkshop, deleteWorkshop } from '@/lib/repositories/workshops';

function updatesFromBody(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const map: Record<string, string[]> = {
    title: ['title'],
    date: ['date'],
    time: ['time'],
    duration: ['duration'],
    format: ['format'],
    price: ['price'],
    max_participants: ['maxParticipants', 'max_participants'],
    current_participants: ['currentParticipants', 'current_participants'],
    description: ['description'],
    includes: ['includes'],
    level: ['level'],
    what_you_create: ['whatYouCreate', 'what_you_create'],
    take_home: ['takeHome', 'take_home'],
    result_image: ['resultImage', 'result_image'],
    is_published: ['isPublished', 'is_published'],
  };

  for (const [column, keys] of Object.entries(map)) {
    for (const key of keys) {
      if (body[key] !== undefined) {
        data[column] = body[key];
        break;
      }
    }
  }
  return data;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const admin = await requireAdminUser();
    const workshop = await getWorkshopById(id, { publishedOnly: !admin });
    if (!workshop) return apiError('Мастер-класс не найден', 404);
    return apiOk(workshop);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const workshop = await updateWorkshop(id, updatesFromBody(body));
    if (!workshop) return apiError('Мастер-класс не найден', 404);
    return apiOk(workshop);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const deleted = await deleteWorkshop(id);
    if (!deleted) return apiError('Мастер-класс не найден', 404);
    return apiOk({ message: 'Deleted' });
  } catch (error) {
    return apiServerError(error);
  }
}
