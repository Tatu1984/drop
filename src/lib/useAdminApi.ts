'use client';

import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-token');
    }
    return null;
  };

  const request = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Request failed');
        return { success: false, error: data.error };
      }

      return { success: true, data: data.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(<T>(endpoint: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return request<T>(`${endpoint}${query}`);
  }, [request]);

  const post = useCallback(<T>(endpoint: string, body: unknown) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [request]);

  const put = useCallback(<T>(endpoint: string, body: unknown) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }, [request]);

  const del = useCallback(<T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' });
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
    request,
    clearError: () => setError(null),
  };
}

export default useAdminApi;
