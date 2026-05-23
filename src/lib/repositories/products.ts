import { query } from '@/lib/db';

export type ProductRow = Record<string, unknown>;

export async function listProducts(options?: { publishedOnly?: boolean }): Promise<ProductRow[]> {
  const publishedOnly = options?.publishedOnly ?? false;
  const { rows } = await query<ProductRow>(
    publishedOnly
      ? 'select * from public.products where is_published = true order by created_at desc'
      : 'select * from public.products order by created_at desc',
  );
  return rows;
}

export async function getProductById(id: string, options?: { publishedOnly?: boolean }): Promise<ProductRow | null> {
  const publishedOnly = options?.publishedOnly ?? false;
  const { rows } = await query<ProductRow>(
    publishedOnly
      ? 'select * from public.products where id = $1 and is_published = true limit 1'
      : 'select * from public.products where id = $1 limit 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createProduct(data: Record<string, unknown>): Promise<ProductRow> {
  const { rows } = await query<ProductRow>(
    `insert into public.products (
      id, name, price, category, images, description, dimensions, care,
      in_stock, is_new, collection, is_published
    ) values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)
    returning *`,
    [
      data.id,
      data.name,
      data.price,
      data.category,
      JSON.stringify(data.images ?? []),
      data.description ?? null,
      data.dimensions ?? null,
      data.care ?? null,
      data.in_stock ?? true,
      data.is_new ?? false,
      data.collection ?? null,
      data.is_published ?? true,
    ],
  );
  return rows[0];
}

export async function updateProduct(id: string, data: Record<string, unknown>): Promise<ProductRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const mapping: Record<string, string> = {
    name: 'name',
    price: 'price',
    category: 'category',
    images: 'images',
    description: 'description',
    dimensions: 'dimensions',
    care: 'care',
    in_stock: 'in_stock',
    is_new: 'is_new',
    collection: 'collection',
    is_published: 'is_published',
  };

  for (const [key, column] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      values.push(key === 'images' ? JSON.stringify(data[key]) : data[key]);
    }
  }

  if (fields.length === 0) return getProductById(id);

  values.push(id);
  const { rows } = await query<ProductRow>(
    `update public.products set ${fields.join(', ')} where id = $${idx} returning *`,
    values,
  );
  return rows[0] ?? null;
}

export async function setProductPublished(id: string, isPublished: boolean): Promise<ProductRow | null> {
  const { rows } = await query<ProductRow>(
    'update public.products set is_published = $1 where id = $2 returning *',
    [isPublished, id],
  );
  return rows[0] ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await query('delete from public.products where id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
