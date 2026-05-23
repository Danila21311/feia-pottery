import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireSessionUser } from '@/app/api/_lib/auth';
import { createGiftCertificateOrder } from '@/lib/repositories/giftCertificateOrders';

interface GiftOrderPayload {
  amount: number;
  recipientName: string;
  message?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  contactMethod: 'telegram' | 'max' | 'phone';
  comment?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    if (!user) return apiError('Не авторизован', 401);

    const body = (await request.json()) as GiftOrderPayload;
    if (
      !body.amount ||
      !body.recipientName ||
      !body.customerName ||
      !body.customerPhone ||
      !body.customerEmail
    ) {
      return apiError('Заполните обязательные поля', 400);
    }
    if (body.amount < 500) {
      return apiError('Минимальная сумма сертификата — 500 ₽', 400);
    }

    const order = await createGiftCertificateOrder(user.id, {
      amount: body.amount,
      recipient_name: body.recipientName,
      message: body.message ?? null,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      contact_method: body.contactMethod ?? 'telegram',
      comment: body.comment ?? null,
    });

    return apiOk(order);
  } catch (error) {
    return apiServerError(error);
  }
}
