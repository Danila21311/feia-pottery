import { query } from '@/lib/db';

export type FeedbackRow = Record<string, unknown>;

export async function createFeedback(data: Record<string, unknown>): Promise<FeedbackRow> {
  const { rows } = await query<FeedbackRow>(
    `insert into public.feedback_requests (user_id, name, email, message, source)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [
      data.user_id ?? null,
      data.name,
      data.email,
      data.message,
      data.source ?? 'contacts_form',
    ],
  );
  return rows[0];
}

export async function listAllFeedback(): Promise<FeedbackRow[]> {
  const { rows } = await query<FeedbackRow>(
    'select * from public.feedback_requests order by created_at desc',
  );
  return rows;
}
