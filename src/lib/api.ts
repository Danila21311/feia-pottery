import { describeNetworkishFailure } from '@/lib/authMessages';

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
  isPublished: boolean;
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
  whatYouCreate: string | null;
  takeHome: string | null;
  resultImage: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WorkshopBookingStatus = 'pending_manager' | 'paid' | 'cancelled';

export interface WorkshopBooking {
  id: string;
  userId: string;
  workshopId: string;
  workshopTitle: string;
  workshopDate: string;
  workshopTime: string;
  selectedFormat: string;
  level: string | null;
  price: number;
  paymentStatus: WorkshopBookingStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  comment: string | null;
  createdAt: string;
}

export interface CreateWorkshopBookingPayload {
  workshopId: string;
  selectedFormat: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  comment?: string;
}

export type GiftCertificatePaymentStatus = 'pending_manager' | 'paid' | 'cancelled';

export interface GiftCertificateOrder {
  id: string;
  userId: string;
  amount: number;
  recipientName: string;
  message: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  contactMethod: 'telegram' | 'max' | 'phone';
  paymentStatus: GiftCertificatePaymentStatus;
  comment: string | null;
  createdAt: string;
}

export interface CreateGiftCertificateOrderPayload {
  amount: number;
  recipientName: string;
  message?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  contactMethod: 'telegram' | 'max' | 'phone';
  comment?: string;
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
  customerType: 'individual' | 'legal';
  deliveryMethod: string;
  deliveryType: string;
  city: string;
  fullAddress: string | null;
  recipientType: 'self' | 'other';
  recipientName: string | null;
  recipientPhone: string | null;
  legalCompanyName: string | null;
  legalInn: string | null;
  contactMethod: 'telegram' | 'max' | 'phone';
  paymentMethod: 'manager_confirmation';
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerType: 'individual' | 'legal';
  deliveryMethod: string;
  deliveryType: string;
  city: string;
  fullAddress?: string;
  recipientType: 'self' | 'other';
  recipientName?: string;
  recipientPhone?: string;
  legalCompanyName?: string;
  legalInn?: string;
  contactMethod: 'telegram' | 'max' | 'phone';
  paymentMethod: 'manager_confirmation';
  comment?: string;
  items: unknown[];
  total: number;
}

export interface FeedbackRequest {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  source: string;
  createdAt: string;
}

export interface CreateFeedbackPayload {
  name: string;
  email: string;
  message: string;
  source?: string;
}

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
    isPublished: row.is_published !== false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function productToApiBody(p: Partial<Product>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  if (p.id !== undefined) obj.id = p.id;
  if (p.name !== undefined) obj.name = p.name;
  if (p.price !== undefined) obj.price = p.price;
  if (p.category !== undefined) obj.category = p.category;
  if (p.images !== undefined) obj.images = p.images;
  if (p.description !== undefined) obj.description = p.description;
  if (p.dimensions !== undefined) obj.dimensions = p.dimensions;
  if (p.care !== undefined) obj.care = p.care;
  if (p.inStock !== undefined) obj.inStock = p.inStock;
  if (p.isNew !== undefined) obj.isNew = p.isNew;
  if (p.collection !== undefined) obj.collection = p.collection;
  if (p.isPublished !== undefined) obj.isPublished = p.isPublished;
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
    whatYouCreate: (row.what_you_create ?? null) as string | null,
    takeHome: (row.take_home ?? null) as string | null,
    resultImage: (row.result_image ?? null) as string | null,
    isPublished: row.is_published !== false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function workshopToApiBody(w: Partial<Workshop>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  if (w.id !== undefined) obj.id = w.id;
  if (w.title !== undefined) obj.title = w.title;
  if (w.date !== undefined) obj.date = w.date;
  if (w.time !== undefined) obj.time = w.time;
  if (w.duration !== undefined) obj.duration = w.duration;
  if (w.format !== undefined) obj.format = w.format;
  if (w.price !== undefined) obj.price = w.price;
  if (w.maxParticipants !== undefined) obj.maxParticipants = w.maxParticipants;
  if (w.currentParticipants !== undefined) obj.currentParticipants = w.currentParticipants;
  if (w.description !== undefined) obj.description = w.description;
  if (w.includes !== undefined) obj.includes = w.includes;
  if (w.level !== undefined) obj.level = w.level;
  if (w.whatYouCreate !== undefined) obj.whatYouCreate = w.whatYouCreate;
  if (w.takeHome !== undefined) obj.takeHome = w.takeHome;
  if (w.resultImage !== undefined) obj.resultImage = w.resultImage;
  if (w.isPublished !== undefined) obj.isPublished = w.isPublished;
  return obj;
}

function dbWorkshopBookingToWorkshopBooking(row: Record<string, unknown>): WorkshopBooking {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    workshopId: row.workshop_id as string,
    workshopTitle: row.workshop_title as string,
    workshopDate: row.workshop_date as string,
    workshopTime: row.workshop_time as string,
    selectedFormat: row.selected_format as string,
    level: (row.level ?? null) as string | null,
    price: row.price as number,
    paymentStatus: row.payment_status as WorkshopBookingStatus,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string,
    comment: (row.comment ?? null) as string | null,
    createdAt: row.created_at as string,
  };
}

function dbGiftCertificateOrderToGiftCertificateOrder(row: Record<string, unknown>): GiftCertificateOrder {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    amount: row.amount as number,
    recipientName: row.recipient_name as string,
    message: (row.message ?? null) as string | null,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string,
    contactMethod: row.contact_method as 'telegram' | 'max' | 'phone',
    paymentStatus: row.payment_status as GiftCertificatePaymentStatus,
    comment: (row.comment ?? null) as string | null,
    createdAt: row.created_at as string,
  };
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
    customerType: row.customer_type as 'individual' | 'legal',
    deliveryMethod: row.delivery_method as string,
    deliveryType: row.delivery_type as string,
    city: row.city as string,
    fullAddress: (row.full_address ?? null) as string | null,
    recipientType: row.recipient_type as 'self' | 'other',
    recipientName: (row.recipient_name ?? null) as string | null,
    recipientPhone: (row.recipient_phone ?? null) as string | null,
    legalCompanyName: (row.legal_company_name ?? null) as string | null,
    legalInn: (row.legal_inn ?? null) as string | null,
    contactMethod: row.contact_method as 'telegram' | 'max' | 'phone',
    paymentMethod: row.payment_method as 'manager_confirmation',
    comment: (row.comment ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function dbFeedbackToFeedback(row: Record<string, unknown>): FeedbackRequest {
  return {
    id: row.id as string,
    userId: (row.user_id ?? null) as string | null,
    name: row.name as string,
    email: row.email as string,
    message: row.message as string,
    source: (row.source ?? 'website') as string,
    createdAt: row.created_at as string,
  };
}

class ApiClient {
  private resolveInternalApiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${normalized}`;
    }
    const rw = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
    const railwayPublic = rw
      ? rw.startsWith('http://') || rw.startsWith('https://')
        ? rw.replace(/\/$/, '')
        : `https://${rw.replace(/\/$/, '')}`
      : '';
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      railwayPublic ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      `http://127.0.0.1:${process.env.PORT ?? '3000'}`;
    return `${base}${normalized}`;
  }

  private mergeTimeoutSignal(userSignal: AbortSignal | null | undefined, timeoutMs: number): AbortSignal {
    const timeoutSignal =
      typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(timeoutMs)
        : undefined;
    if (!timeoutSignal) {
      const c = new AbortController();
      setTimeout(() => c.abort(new DOMException('API request timeout', 'AbortError')), timeoutMs);
      if (!userSignal) return c.signal;
      if (userSignal.aborted) {
        c.abort(new DOMException('Request already aborted', 'AbortError'));
        return c.signal;
      }
      userSignal.addEventListener('abort', () => c.abort(new DOMException('Request cancelled', 'AbortError')), {
        once: true,
      });
      return c.signal;
    }
    if (!userSignal) return timeoutSignal;
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal && typeof AbortSignal.any === 'function') {
      return AbortSignal.any([userSignal, timeoutSignal]);
    }
    const merged = new AbortController();
    const abort = () => merged.abort(new DOMException('Request aborted (timeout or cancel)', 'AbortError'));
    if (userSignal.aborted || timeoutSignal.aborted) {
      abort();
      return merged.signal;
    }
    userSignal.addEventListener('abort', abort, { once: true });
    timeoutSignal.addEventListener('abort', abort, { once: true });
    return merged.signal;
  }

  private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const url = this.resolveInternalApiUrl(path);
    const maxAttempts = 3;
    const requestTimeoutMs = 40_000;
    let lastNetworkError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...init,
          credentials: 'include',
          signal: this.mergeTimeoutSignal(init?.signal, requestTimeoutMs),
          headers: {
            ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...(init?.headers ?? {}),
          },
          cache: 'no-store',
        });

        let body: { data?: T; error?: string } | null = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }

        if (!response.ok) {
          throw new ApiError(body?.error ?? 'Ошибка запроса', response.status, body);
        }

        return (body?.data ?? body) as T;
      } catch (err) {
        if (err instanceof ApiError) throw err;
        lastNetworkError = err;
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
          continue;
        }
      }
    }

    const raw = lastNetworkError instanceof Error ? lastNetworkError.message : String(lastNetworkError);
    throw new ApiError(raw || 'Сеть недоступна', 503, lastNetworkError);
  }

  async login(email: string, password: string) {
    try {
      const data = await this.requestJson<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      return data;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(describeNetworkishFailure(e), 503, e);
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      const data = await this.requestJson<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      });
      return data;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(describeNetworkishFailure(e), 503, e);
    }
  }

  async getMe(): Promise<{ user: User }> {
    return this.requestJson<{ user: User }>('/api/auth/me');
  }

  async updateProfile(name: string): Promise<{ user: User }> {
    return this.requestJson<{ user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async logout() {
    await this.requestJson<{ message: string }>('/api/auth/logout', { method: 'POST' });
    return { message: 'ok' };
  }

  async getProducts(): Promise<Product[]> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/products');
    return (data ?? []).map(dbProductToProduct);
  }

  async getAdminProducts(): Promise<Product[]> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/products');
    return (data ?? []).map(dbProductToProduct);
  }

  async setProductPublished(id: string, isPublished: boolean): Promise<Product> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
    return dbProductToProduct(data);
  }

  async getProduct(id: string): Promise<Product> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/products/${id}`);
    return dbProductToProduct(data);
  }

  async createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
    const data = await this.requestJson<Record<string, unknown>>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productToApiBody(product)),
    });
    return dbProductToProduct(data);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productToApiBody(updates)),
    });
    return dbProductToProduct(data);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.requestJson<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' });
  }

  async getWorkshops(): Promise<Workshop[]> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/workshops');
    return (data ?? []).map(dbWorkshopToWorkshop);
  }

  async getAdminWorkshops(): Promise<Workshop[]> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/workshops');
    return (data ?? []).map(dbWorkshopToWorkshop);
  }

  async setWorkshopPublished(id: string, isPublished: boolean): Promise<Workshop> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/workshops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
    return dbWorkshopToWorkshop(data);
  }

  async getWorkshop(id: string): Promise<Workshop> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/workshops/${id}`);
    return dbWorkshopToWorkshop(data);
  }

  async createWorkshop(workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>): Promise<Workshop> {
    const data = await this.requestJson<Record<string, unknown>>('/api/workshops', {
      method: 'POST',
      body: JSON.stringify(workshopToApiBody(workshop)),
    });
    return dbWorkshopToWorkshop(data);
  }

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/workshops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(workshopToApiBody(updates)),
    });
    return dbWorkshopToWorkshop(data);
  }

  async deleteWorkshop(id: string): Promise<{ message: string }> {
    return this.requestJson<{ message: string }>(`/api/workshops/${id}`, { method: 'DELETE' });
  }

  async createWorkshopBooking(payload: CreateWorkshopBookingPayload): Promise<{ booking: WorkshopBooking }> {
    const data = await this.requestJson<Record<string, unknown>>('/api/workshop-bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { booking: dbWorkshopBookingToWorkshopBooking(data) };
  }

  async getMyWorkshopBookings(): Promise<{ bookings: WorkshopBooking[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/profile/workshop-bookings');
    return { bookings: (data ?? []).map(dbWorkshopBookingToWorkshopBooking) };
  }

  async getAllWorkshopBookings(): Promise<{ bookings: WorkshopBooking[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/workshop-bookings');
    return { bookings: (data ?? []).map(dbWorkshopBookingToWorkshopBooking) };
  }

  async createGiftCertificateOrder(
    payload: CreateGiftCertificateOrderPayload,
  ): Promise<{ order: GiftCertificateOrder }> {
    const data = await this.requestJson<Record<string, unknown>>('/api/gift-certificate-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { order: dbGiftCertificateOrderToGiftCertificateOrder(data) };
  }

  async getMyGiftCertificateOrders(): Promise<{ orders: GiftCertificateOrder[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/profile/gift-certificate-orders');
    return { orders: (data ?? []).map(dbGiftCertificateOrderToGiftCertificateOrder) };
  }

  async getMyProfileApplications(): Promise<{
    orders: Order[];
    workshopBookings: WorkshopBooking[];
    giftCertificateOrders: GiftCertificateOrder[];
  }> {
    const [ordersData, bookingsData, giftsData] = await Promise.all([
      this.requestJson<Record<string, unknown>[]>('/api/profile/orders'),
      this.requestJson<Record<string, unknown>[]>('/api/profile/workshop-bookings'),
      this.requestJson<Record<string, unknown>[]>('/api/profile/gift-certificate-orders'),
    ]);

    return {
      orders: (ordersData ?? []).map(dbOrderToOrder),
      workshopBookings: (bookingsData ?? []).map(dbWorkshopBookingToWorkshopBooking),
      giftCertificateOrders: (giftsData ?? []).map(dbGiftCertificateOrderToGiftCertificateOrder),
    };
  }

  async getAllGiftCertificateOrders(): Promise<{ orders: GiftCertificateOrder[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/gift-certificate-orders');
    return { orders: (data ?? []).map(dbGiftCertificateOrderToGiftCertificateOrder) };
  }

  async getAdminApplicationsBundle(): Promise<{
    orders: Order[];
    workshopBookings: WorkshopBooking[];
    giftCertificateOrders: GiftCertificateOrder[];
  }> {
    const data = await this.requestJson<{
      orders: Record<string, unknown>[];
      workshopBookings: Record<string, unknown>[];
      giftCertificateOrders: Record<string, unknown>[];
    }>('/api/admin/applications');

    return {
      orders: (data.orders ?? []).map(dbOrderToOrder),
      workshopBookings: (data.workshopBookings ?? []).map(dbWorkshopBookingToWorkshopBooking),
      giftCertificateOrders: (data.giftCertificateOrders ?? []).map(dbGiftCertificateOrderToGiftCertificateOrder),
    };
  }

  async uploadImage(file: File, folder = 'feia'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.requestJson<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async createOrder(payload: CreateOrderPayload): Promise<{ order: Order }> {
    const data = await this.requestJson<Record<string, unknown>>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { order: dbOrderToOrder(data) };
  }

  async getMyOrders(): Promise<{ orders: Order[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/profile/orders');
    return { orders: (data ?? []).map(dbOrderToOrder) };
  }

  async getAllOrders(): Promise<{ orders: Order[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/orders');
    return { orders: (data ?? []).map(dbOrderToOrder) };
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<{ order: Order }> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { order: dbOrderToOrder(data) };
  }

  async updateWorkshopBookingPaymentStatus(
    id: string,
    paymentStatus: WorkshopBookingStatus,
  ): Promise<{ booking: WorkshopBooking }> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/admin/workshop-bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
    return { booking: dbWorkshopBookingToWorkshopBooking(data) };
  }

  async updateGiftCertificateOrderPaymentStatus(
    id: string,
    paymentStatus: GiftCertificatePaymentStatus,
  ): Promise<{ order: GiftCertificateOrder }> {
    const data = await this.requestJson<Record<string, unknown>>(`/api/admin/gift-certificate-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
    return { order: dbGiftCertificateOrderToGiftCertificateOrder(data) };
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    return this.requestJson<{ message: string }>(`/api/admin/orders/${id}`, { method: 'DELETE' });
  }

  async deleteWorkshopBooking(id: string): Promise<{ message: string }> {
    return this.requestJson<{ message: string }>(`/api/admin/workshop-bookings/${id}`, { method: 'DELETE' });
  }

  async deleteGiftCertificateOrder(id: string): Promise<{ message: string }> {
    return this.requestJson<{ message: string }>(`/api/admin/gift-certificate-orders/${id}`, {
      method: 'DELETE',
    });
  }

  async createFeedback(payload: CreateFeedbackPayload): Promise<{ feedback: FeedbackRequest }> {
    const row = await this.requestJson<Record<string, unknown>>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        source: payload.source ?? 'contacts_form',
      }),
    });
    return { feedback: dbFeedbackToFeedback(row) };
  }

  async getAllFeedback(): Promise<{ feedback: FeedbackRequest[] }> {
    const data = await this.requestJson<Record<string, unknown>[]>('/api/admin/feedback');
    return { feedback: (data ?? []).map(dbFeedbackToFeedback) };
  }
}

export const api = new ApiClient();
