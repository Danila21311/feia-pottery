import { supabase } from '@/integrations/supabase/client';

// ==================== Error class ====================

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ==================== Types (kept camelCase for frontend) ====================

export interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string | null;
  dimensions: string | null;
  care: string | null;
  inStock: boolean;
  isNew: boolean;
  collection: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  format: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  description: string | null;
  includes: string[];
  level: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  total: number;
  items: unknown[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  comment?: string;
  items: unknown[];
  total: number;
}

// ==================== DB row ↔ frontend type mappers ====================

function dbProductToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    category: row.category as string,
    images: (row.images ?? []) as string[],
    description: (row.description ?? null) as string | null,
    dimensions: (row.dimensions ?? null) as string | null,
    care: (row.care ?? null) as string | null,
    inStock: row.in_stock as boolean,
    isNew: row.is_new as boolean,
    collection: (row.collection ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function productToDb(p: Partial<Product>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  if (p.id !== undefined) obj.id = p.id;
  if (p.name !== undefined) obj.name = p.name;
  if (p.price !== undefined) obj.price = p.price;
  if (p.category !== undefined) obj.category = p.category;
  if (p.images !== undefined) obj.images = p.images;
  if (p.description !== undefined) obj.description = p.description;
  if (p.dimensions !== undefined) obj.dimensions = p.dimensions;
  if (p.care !== undefined) obj.care = p.care;
  if (p.inStock !== undefined) obj.in_stock = p.inStock;
  if (p.isNew !== undefined) obj.is_new = p.isNew;
  if (p.collection !== undefined) obj.collection = p.collection;
  return obj;
}

function dbWorkshopToWorkshop(row: Record<string, unknown>): Workshop {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    time: row.time as string,
    duration: row.duration as string,
    format: row.format as string,
    price: row.price as number,
    maxParticipants: row.max_participants as number,
    currentParticipants: row.current_participants as number,
    description: (row.description ?? null) as string | null,
    includes: (row.includes ?? []) as string[],
    level: (row.level ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function workshopToDb(w: Partial<Workshop>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  if (w.id !== undefined) obj.id = w.id;
  if (w.title !== undefined) obj.title = w.title;
  if (w.date !== undefined) obj.date = w.date;
  if (w.time !== undefined) obj.time = w.time;
  if (w.duration !== undefined) obj.duration = w.duration;
  if (w.format !== undefined) obj.format = w.format;
  if (w.price !== undefined) obj.price = w.price;
  if (w.maxParticipants !== undefined) obj.max_participants = w.maxParticipants;
  if (w.currentParticipants !== undefined) obj.current_participants = w.currentParticipants;
  if (w.description !== undefined) obj.description = w.description;
  if (w.includes !== undefined) obj.includes = w.includes;
  if (w.level !== undefined) obj.level = w.level;
  return obj;
}

function dbOrderToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    userId: (row.user_id ?? null) as string | null,
    status: row.status as OrderStatus,
    total: row.total as number,
    items: (row.items ?? []) as unknown[],
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string,
    comment: (row.comment ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ==================== Supabase-backed API client ====================

class ApiClient {
  // ---------- Auth ----------

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ApiError(error.message, 401);
    const user = await this._buildUser(data.user.id, data.user.email!);
    return { token: data.session.access_token, user };
  }

  async register(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new ApiError(error.message, 400);
    if (!data.session) throw new ApiError('Проверьте email для подтверждения регистрации', 400);
    const user = await this._buildUser(data.user!.id, data.user!.email!);
    return { token: data.session.access_token, user };
  }

  async getMe(): Promise<{ user: User }> {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) throw new ApiError('Не авторизован', 401);
    const user = await this._buildUser(authUser.id, authUser.email!);
    return { user };
  }

  async updateProfile(name: string): Promise<{ user: User }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new ApiError('Не авторизован', 401);

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', authUser.id);
    if (error) throw new ApiError(error.message, 400);

    return this.getMe();
  }

  async logout() {
    await supabase.auth.signOut();
    return { message: 'ok' };
  }

  // ---------- Products ----------

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500);
    return (data ?? []).map(dbProductToProduct);
  }

  async getProduct(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new ApiError(error.message, 404);
    return dbProductToProduct(data);
  }

  async createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { error } = await supabase
      .from('products')
      .insert(productToDb(product));
    if (error) {
      if (error.code === '23505') throw new ApiError('Товар с таким ID уже существует', 409);
      throw new ApiError(error.message, 400);
    }
    return { ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { error } = await supabase
      .from('products')
      .update(productToDb(updates))
      .eq('id', id);
    if (error) throw new ApiError(error.message, 400);
    return { id, ...updates, updatedAt: new Date().toISOString() } as Product;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new ApiError(error.message, 400);
    return { message: 'Deleted' };
  }

  // ---------- Workshops ----------

  async getWorkshops(): Promise<Workshop[]> {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500);
    return (data ?? []).map(dbWorkshopToWorkshop);
  }

  async getWorkshop(id: string): Promise<Workshop> {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new ApiError(error.message, 404);
    return dbWorkshopToWorkshop(data);
  }

  async createWorkshop(workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>): Promise<Workshop> {
    const { error } = await supabase
      .from('workshops')
      .insert(workshopToDb(workshop));
    if (error) throw new ApiError(error.message, 400);
    return { ...workshop, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Workshop;
  }

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    const { error } = await supabase
      .from('workshops')
      .update(workshopToDb(updates))
      .eq('id', id);
    if (error) throw new ApiError(error.message, 400);
    return { id, ...updates, updatedAt: new Date().toISOString() } as Workshop;
  }

  async deleteWorkshop(id: string): Promise<{ message: string }> {
    const { error } = await supabase.from('workshops').delete().eq('id', id);
    if (error) throw new ApiError(error.message, 400);
    return { message: 'Deleted' };
  }

  // ---------- Upload ----------

  async uploadImage(file: File): Promise<{ url: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, { contentType: file.type, upsert: false });
    if (error) throw new ApiError(error.message, 400);

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return { url: data.publicUrl };
  }

  // ---------- Orders ----------

  async createOrder(payload: CreateOrderPayload): Promise<{ order: Order }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: authUser?.id ?? null,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_email: payload.customerEmail,
        comment: payload.comment ?? null,
        items: payload.items as unknown as Record<string, unknown>,
        total: payload.total,
      })
      .select()
      .single();
    if (error) throw new ApiError(error.message, 400);
    return { order: dbOrderToOrder(data) };
  }

  async getMyOrders(): Promise<{ orders: Order[] }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new ApiError('Не авторизован', 401);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500);
    return { orders: (data ?? []).map(dbOrderToOrder) };
  }

  async getAllOrders(): Promise<{ orders: Order[] }> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500);
    return { orders: (data ?? []).map(dbOrderToOrder) };
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<{ order: Order }> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new ApiError(error.message, 400);
    return { order: dbOrderToOrder(data) };
  }

  // ---------- Private helpers ----------

  private async _buildUser(id: string, email: string): Promise<User> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', id)
      .single();

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id);

    return {
      id,
      email,
      name: profile?.name ?? null,
      roles: (roles ?? []).map(r => r.role),
    };
  }
}

export const api = new ApiClient();
