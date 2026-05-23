import type pg from 'pg';
import { query, withTransaction } from '@/lib/db';

export type WorkshopBookingRow = Record<string, unknown>;

export async function listBookingsByUser(userId: string): Promise<WorkshopBookingRow[]> {
  const { rows } = await query<WorkshopBookingRow>(
    'select * from public.workshop_bookings where user_id = $1 order by created_at desc',
    [userId],
  );
  return rows;
}

export async function listAllBookings(): Promise<WorkshopBookingRow[]> {
  const { rows } = await query<WorkshopBookingRow>(
    'select * from public.workshop_bookings order by created_at desc',
  );
  return rows;
}

export async function updateBookingPaymentStatus(
  id: string,
  paymentStatus: string,
): Promise<WorkshopBookingRow | null> {
  const { rows } = await query<WorkshopBookingRow>(
    `update public.workshop_bookings
     set payment_status = $1
     where id = $2
     returning *`,
    [paymentStatus, id],
  );
  return rows[0] ?? null;
}

export async function deleteWorkshopBooking(id: string): Promise<boolean> {
  return withTransaction(async (client: pg.PoolClient) => {
    const bookingResult = await client.query<{ workshop_id: string | null }>(
      'select workshop_id from public.workshop_bookings where id = $1 for update',
      [id],
    );
    const booking = bookingResult.rows[0];
    if (!booking) return false;

    await client.query('delete from public.workshop_bookings where id = $1', [id]);

    if (booking.workshop_id) {
      await client.query(
        `update public.workshops
         set current_participants = greatest(0, current_participants - 1)
         where id = $1`,
        [booking.workshop_id],
      );
    }

    return true;
  });
}

export async function createWorkshopBooking(
  userId: string,
  payload: {
    workshopId: string;
    selectedFormat: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    comment?: string | null;
  },
): Promise<WorkshopBookingRow> {
  return withTransaction(async (client: pg.PoolClient) => {
    const workshopResult = await client.query<Record<string, unknown>>(
      'select * from public.workshops where id = $1 for update',
      [payload.workshopId],
    );
    const workshop = workshopResult.rows[0];
    if (!workshop) {
      throw new Error('WORKSHOP_NOT_FOUND');
    }

    const maxParticipants = Number(workshop.max_participants);
    const currentParticipants = Number(workshop.current_participants);
    if (maxParticipants - currentParticipants <= 0) {
      throw new Error('NO_SPOTS');
    }

    const bookingResult = await client.query<WorkshopBookingRow>(
      `insert into public.workshop_bookings (
        user_id, workshop_id, workshop_title, workshop_date, workshop_time,
        selected_format, level, price, payment_status,
        customer_name, customer_phone, customer_email, comment
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_manager', $9, $10, $11, $12)
      returning *`,
      [
        userId,
        workshop.id,
        workshop.title,
        workshop.date,
        workshop.time,
        payload.selectedFormat,
        workshop.level ?? null,
        workshop.price,
        payload.customerName,
        payload.customerPhone,
        payload.customerEmail,
        payload.comment ?? null,
      ],
    );

    await client.query(
      'update public.workshops set current_participants = current_participants + 1 where id = $1',
      [workshop.id],
    );

    return bookingResult.rows[0];
  });
}
