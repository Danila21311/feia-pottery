const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP error ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(name: string) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Products endpoints
  async getProducts() {
    return this.request<Product[]>('/products', { skipAuth: true });
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`, { skipAuth: true });
  }

  async createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Workshops endpoints
  async getWorkshops() {
    return this.request<Workshop[]>('/workshops', { skipAuth: true });
  }

  async getWorkshop(id: string) {
    return this.request<Workshop>(`/workshops/${id}`, { skipAuth: true });
  }

  async createWorkshop(workshop: Omit<Workshop, 'createdAt' | 'updatedAt'>) {
    return this.request<Workshop>('/workshops', {
      method: 'POST',
      body: JSON.stringify(workshop),
    });
  }

  async updateWorkshop(id: string, data: Partial<Workshop>) {
    return this.request<Workshop>(`/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkshop(id: string) {
    return this.request<{ message: string }>(`/workshops/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoint
  async uploadImage(file: File): Promise<{ url: string }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Upload failed`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health', { skipAuth: true });
  }

  // Orders endpoints
  async createOrder(data: CreateOrderPayload) {
    return this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders() {
    return this.request<{ orders: Order[] }>('/orders/my');
  }

  async getAllOrders() {
    return this.request<{ orders: Order[] }>('/orders');
  }

  async updateOrderStatus(id: string, status: Order['status']) {
    return this.request<{ order: Order }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Types
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

export const api = new ApiClient(API_BASE_URL);
export { ApiError };
