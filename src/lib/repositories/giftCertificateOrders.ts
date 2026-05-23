import { query } from '@/lib/db';

export type GiftCertificateOrderRow = Record<string, unknown>;

export async function updateGiftOrderPaymentStatus(
  id: string,
  paymentStatus: string,
): Promise<GiftCertificateOrderRow | null> {
  const { rows } = await query<GiftCertificateOrderRow>(
    `update public.gift_certificate_orders
     set payment_status = $1
     where id = $2
     returning *`,
    [paymentStatus, id],
  );
  return rows[0] ?? null;
}

export async function createGiftCertificateOrder(
  userId: string,
  data: Record<string, unknown>,
): Promise<GiftCertificateOrderRow> {
  const { rows } = await query<GiftCertificateOrderRow>(
    `insert into public.gift_certificate_orders (
      user_id, amount, recipient_name, message, customer_name,
      customer_phone, customer_email, contact_method, comment
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning *`,
    [
      userId,
      data.amount,
      data.recipient_name,
      data.message ?? null,
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.contact_method ?? 'telegram',
      data.comment ?? null,
    ],
  );
  return rows[0];
}

export async function listGiftOrdersByUser(userId: string): Promise<GiftCertificateOrderRow[]> {
  const { rows } = await query<GiftCertificateOrderRow>(
    'select * from public.gift_certificate_orders where user_id = $1 order by created_at desc',
    [userId],
  );
  return rows;
}

export async function listAllGiftOrders(): Promise<GiftCertificateOrderRow[]> {
  const { rows } = await query<GiftCertificateOrderRow>(
    'select * from public.gift_certificate_orders order by created_at desc',
  );
  return rows;
}

export async function deleteGiftCertificateOrder(id: string): Promise<boolean> {
  const { rowCount } = await query('delete from public.gift_certificate_orders where id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
