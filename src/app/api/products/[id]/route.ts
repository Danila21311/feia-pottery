import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/repositories/products';

function updatesFromBody(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.price !== undefined) data.price = body.price;
  if (body.category !== undefined) data.category = body.category;
  if (body.images !== undefined) data.images = body.images;
  if (body.description !== undefined) data.description = body.description;
  if (body.dimensions !== undefined) data.dimensions = body.dimensions;
  if (body.care !== undefined) data.care = body.care;
  if (body.inStock !== undefined) data.in_stock = body.inStock;
  if (body.in_stock !== undefined) data.in_stock = body.in_stock;
  if (body.isNew !== undefined) data.is_new = body.isNew;
  if (body.is_new !== undefined) data.is_new = body.is_new;
  if (body.collection !== undefined) data.collection = body.collection;
  if (body.isPublished !== undefined) data.is_published = body.isPublished;
  if (body.is_published !== undefined) data.is_published = body.is_published;
  return data;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const admin = await requireAdminUser();
    const product = await getProductById(id, { publishedOnly: !admin });
    if (!product) return apiError('Товар не найден', 404);
    return apiOk(product);
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
    const product = await updateProduct(id, updatesFromBody(body));
    if (!product) return apiError('Товар не найден', 404);
    return apiOk(product);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const { id } = await context.params;
    const deleted = await deleteProduct(id);
    if (!deleted) return apiError('Товар не найден', 404);
    return apiOk({ message: 'Deleted' });
  } catch (error) {
    return apiServerError(error);
  }
}
