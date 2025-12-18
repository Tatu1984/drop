// Vendor API helper functions
import toast from 'react-hot-toast';

const getAuthHeaders = () => {
  const token = localStorage.getItem('vendor-token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const vendorApi = {
  // Get vendor statistics
  async getStats() {
    try {
      const response = await fetch('/api/vendor/stats', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats');
      throw error;
    }
  },

  // Get vendor orders
  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/vendor/orders?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, prepTime?: number, note?: string) {
    try {
      const response = await fetch('/api/vendor/orders', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderId, status, prepTime, note }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update order');
      }
      toast.success('Order updated successfully');
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
      throw error;
    }
  },

  // Get analytics
  async getAnalytics(period: string = '7d') {
    try {
      const response = await fetch(`/api/vendor/analytics?period=${period}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
      throw error;
    }
  },

  // Get earnings
  async getEarnings(period: string = '30d') {
    try {
      const response = await fetch(`/api/vendor/earnings?period=${period}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch earnings');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load earnings');
      throw error;
    }
  },

  // Get reviews
  async getReviews(params?: { rating?: number; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.rating) queryParams.append('rating', params.rating.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/vendor/reviews?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reviews');
      throw error;
    }
  },

  // Get settings
  async getSettings() {
    try {
      const response = await fetch('/api/vendor/settings', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch settings');
      }
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
      throw error;
    }
  },

  // Update settings
  async updateSettings(settings: any) {
    try {
      const response = await fetch('/api/vendor/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }
      toast.success(data.message || 'Settings updated successfully');
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
      throw error;
    }
  },
};
