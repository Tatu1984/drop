// API Client for frontend to communicate with backend

const API_BASE = '/api';

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async sendOTP(phone: string, type: 'user' | 'rider' = 'user') {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, type }),
    });
  }

  async verifyOTP(phone: string, otp: string, name?: string, type: 'user' | 'rider' = 'user') {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name, type }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Admin Auth
  async adminLogin(email: string, password: string) {
    return this.request('/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Vendors
  async getVendors(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/vendors${query}`);
  }

  async getVendor(id: string) {
    return this.request(`/vendors/${id}`);
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/products${query}`);
  }

  // Search
  async search(query: string, type?: string) {
    const params = new URLSearchParams({ q: query });
    if (type) params.set('type', type);
    return this.request(`/search?${params}`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number = 1, customizations?: unknown, notes?: string) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, customizations, notes }),
    });
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    return this.request('/cart', {
      method: 'PUT',
      body: JSON.stringify({ cartItemId, quantity }),
    });
  }

  async removeFromCart(cartItemId: string) {
    return this.request(`/cart?itemId=${cartItemId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request('/cart', { method: 'DELETE' });
  }

  // Orders
  async getOrders(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/orders${query}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData: {
    vendorId: string;
    addressId?: string;
    items: { productId: string; quantity: number; customizations?: unknown; notes?: string }[];
    paymentMethod: string;
    tip?: number;
    scheduledFor?: string;
    deliveryInstructions?: string;
    couponCode?: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId: string, reason?: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED', cancellationReason: reason }),
    });
  }

  async rateOrder(orderId: string, rating: number, review?: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, review }),
    });
  }

  // Payments
  async createPaymentOrder(amount: number, orderId?: string) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  }

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId?: string;
    type?: 'order' | 'wallet';
  }) {
    return this.request('/payments', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Wallet
  async getWallet() {
    return this.request('/wallet');
  }

  async addMoneyToWallet(amount: number) {
    return this.request('/wallet', {
      method: 'POST',
      body: JSON.stringify({ amount, type: 'TOP_UP' }),
    });
  }

  // Profile
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    avatar?: string;
    dateOfBirth?: string;
    preferredLanguage?: string;
  }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Addresses
  async getAddresses() {
    return this.request('/user/addresses');
  }

  async addAddress(data: {
    label: string;
    fullAddress: string;
    landmark?: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
  }) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: {
    label?: string;
    fullAddress?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }) {
    return this.request('/user/addresses', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async deleteAddress(id: string) {
    return this.request(`/user/addresses?id=${id}`, { method: 'DELETE' });
  }

  // Notifications
  async getNotifications(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/notifications${query}`);
  }

  async markNotificationRead(notificationId?: string) {
    return this.request('/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationId ? { notificationId } : { markAllRead: true }),
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications?id=${notificationId}`, { method: 'DELETE' });
  }

  async clearNotifications() {
    return this.request('/notifications?clearAll=true', { method: 'DELETE' });
  }

  // File Upload
  async uploadFile(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }

  // Rider APIs
  async getRiderOrders(type?: 'available' | 'active' | 'completed') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/rider/orders${query}`);
  }

  async acceptOrder(orderId: string) {
    return this.request('/rider/orders', {
      method: 'POST',
      body: JSON.stringify({ orderId, action: 'accept' }),
    });
  }

  async markOrderPickedUp(orderId: string) {
    return this.request('/rider/orders', {
      method: 'POST',
      body: JSON.stringify({ orderId, action: 'pickup' }),
    });
  }

  async markOrderDelivered(orderId: string) {
    return this.request('/rider/orders', {
      method: 'POST',
      body: JSON.stringify({ orderId, action: 'deliver' }),
    });
  }

  async updateRiderLocation(latitude: number, longitude: number, isOnline?: boolean) {
    return this.request('/rider/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, isOnline }),
    });
  }

  async getRiderEarnings(period?: 'today' | 'week' | 'month' | 'all') {
    const query = period ? `?period=${period}` : '';
    return this.request(`/rider/earnings${query}`);
  }
}

export const apiClient = new APIClient();
export default apiClient;
