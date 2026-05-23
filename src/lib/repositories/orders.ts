import { query } from '@/lib/db';

export type OrderRow = Record<string, unknown>;

export async function createOrder(data: Record<string, unknown>): Promise<OrderRow> {
  const { rows } = await query<OrderRow>(
    `insert into public.orders (
      user_id, customer_name, customer_phone, customer_email, customer_type,
      delivery_method, delivery_type, city, full_address, recipient_type,
      recipient_name, recipient_phone, legal_company_name, legal_inn,
      contact_method, payment_method, comment, items, total
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb, $19
    ) returning *`,
    [
      data.user_id ?? null,
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.customer_type ?? 'individual',
      data.delivery_method ?? 'pickup_moscow',
      data.delivery_type ?? 'address',
      data.city ?? '',
      data.full_address ?? null,
      data.recipient_type ?? 'self',
      data.recipient_name ?? null,
      data.recipient_phone ?? null,
      data.legal_company_name ?? null,
      data.legal_inn ?? null,
      data.contact_method ?? 'telegram',
      data.payment_method ?? 'manager_confirmation',
      data.comment ?? null,
      JSON.stringify(data.items ?? []),
      data.total,
    ],
  );
  return rows[0];
}

export async function listOrdersByUser(userId: string): Promise<OrderRow[]> {
  const { rows } = await query<OrderRow>(
    'select * from public.orders where user_id = $1 order by created_at desc',
    [userId],
  );
  return rows;
}

export async function listAllOrders(): Promise<OrderRow[]> {
  const { rows } = await query<OrderRow>(
    'select * from public.orders order by created_at desc',
  );
  return rows;
}

export async function updateOrderStatus(id: string, status: string): Promise<OrderRow | null> {
  const { rows } = await query<OrderRow>(
    'update public.orders set status = $1::public.order_status where id = $2 returning *',
    [status, id],
  );
  return rows[0] ?? null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { rowCount } = await query('delete from public.orders where id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
