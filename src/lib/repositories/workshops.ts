import { query } from '@/lib/db';

export type WorkshopRow = Record<string, unknown>;

export async function listWorkshops(options?: { publishedOnly?: boolean }): Promise<WorkshopRow[]> {
  const publishedOnly = options?.publishedOnly ?? false;
  const { rows } = await query<WorkshopRow>(
    publishedOnly
      ? 'select * from public.workshops where is_published = true order by created_at desc'
      : 'select * from public.workshops order by created_at desc',
  );
  return rows;
}

export async function getWorkshopById(id: string, options?: { publishedOnly?: boolean }): Promise<WorkshopRow | null> {
  const publishedOnly = options?.publishedOnly ?? false;
  const { rows } = await query<WorkshopRow>(
    publishedOnly
      ? 'select * from public.workshops where id = $1 and is_published = true limit 1'
      : 'select * from public.workshops where id = $1 limit 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createWorkshop(data: Record<string, unknown>): Promise<WorkshopRow> {
  const { rows } = await query<WorkshopRow>(
    `insert into public.workshops (
      id, title, date, time, duration, format, price, max_participants,
      current_participants, description, includes, level,
      what_you_create, take_home, result_image, is_published
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16)
    returning *`,
    [
      data.id,
      data.title,
      data.date,
      data.time,
      data.duration,
      data.format,
      data.price,
      data.max_participants ?? 1,
      data.current_participants ?? 0,
      data.description ?? null,
      JSON.stringify(data.includes ?? []),
      data.level ?? null,
      data.what_you_create ?? null,
      data.take_home ?? null,
      data.result_image ?? null,
      data.is_published ?? true,
    ],
  );
  return rows[0];
}

export async function updateWorkshop(id: string, data: Record<string, unknown>): Promise<WorkshopRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const mapping: Record<string, string> = {
    title: 'title',
    date: 'date',
    time: 'time',
    duration: 'duration',
    format: 'format',
    price: 'price',
    max_participants: 'max_participants',
    current_participants: 'current_participants',
    description: 'description',
    includes: 'includes',
    level: 'level',
    what_you_create: 'what_you_create',
    take_home: 'take_home',
    result_image: 'result_image',
    is_published: 'is_published',
  };

  for (const [key, column] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      values.push(key === 'includes' ? JSON.stringify(data[key]) : data[key]);
    }
  }

  if (fields.length === 0) return getWorkshopById(id);

  values.push(id);
  const { rows } = await query<WorkshopRow>(
    `update public.workshops set ${fields.join(', ')} where id = $${idx} returning *`,
    values,
  );
  return rows[0] ?? null;
}

export async function setWorkshopPublished(id: string, isPublished: boolean): Promise<WorkshopRow | null> {
  const { rows } = await query<WorkshopRow>(
    'update public.workshops set is_published = $1 where id = $2 returning *',
    [isPublished, id],
  );
  return rows[0] ?? null;
}

export async function deleteWorkshop(id: string): Promise<boolean> {
  const { rowCount } = await query('delete from public.workshops where id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
