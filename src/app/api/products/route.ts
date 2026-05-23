import { apiError, apiOk, apiServerError } from '@/app/api/_lib/response';
import { requireAdminUser } from '@/app/api/_lib/auth';
import {
  listProducts,
  createProduct,
} from '@/lib/repositories/products';

function productFromBody(body: Record<string, unknown>, id?: string) {
  return {
    id: id ?? (body.id as string),
    name: body.name,
    price: body.price,
    category: body.category,
    images: body.images ?? [],
    description: body.description ?? null,
    dimensions: body.dimensions ?? null,
    care: body.care ?? null,
    in_stock: body.inStock ?? body.in_stock ?? true,
    is_new: body.isNew ?? body.is_new ?? false,
    collection: body.collection ?? null,
  };
}

export async function GET() {
  try {
    const products = await listProducts({ publishedOnly: true });
    return apiOk(products);
  } catch (error) {
    return apiServerError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) return apiError('Недостаточно прав', 403);

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.id || !body.name || body.price == null || !body.category) {
      return apiError('Заполните обязательные поля товара', 400);
    }

    try {
      const product = await createProduct(productFromBody(body));
      return apiOk(product, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('duplicate key') || message.includes('products_pkey')) {
        return apiError('Товар с таким ID уже существует', 409);
      }
      throw err;
    }
  } catch (error) {
    return apiServerError(error);
  }
}
