import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import {
  listWorkshops,
  createWorkshop,
} from '@/lib/repositories/workshops';

function workshopFromBody(body: Record<string, unknown>, id?: string) {
  return {
    id: id ?? (body.id as string),
    title: body.title,
    date: body.date,
    time: body.time,
    duration: body.duration,
    format: body.format,
    price: body.price,
    max_participants: body.maxParticipants ?? body.max_participants ?? 1,
    current_participants: body.currentParticipants ?? body.current_participants ?? 0,
    description: body.description ?? null,
    includes: body.includes ?? [],
    level: body.level ?? null,
    what_you_create: body.whatYouCreate ?? body.what_you_create ?? null,
    take_home: body.takeHome ?? body.take_home ?? null,
    result_image: body.resultImage ?? body.result_image ?? null,
  };
}

export async function GET() {
  try {
    const workshops = await listWorkshops({ publishedOnly: true });
    return apiOk(workshops);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.id || !body.title || body.price == null) {
      return apiError('Заполните обязательные поля мастер-класса', 400);
    }

    const workshop = await createWorkshop(workshopFromBody(body));
    return apiOk(workshop, 201);
  } catch (error) {
    return apiServerError(error);
  }
}
