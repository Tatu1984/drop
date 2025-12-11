import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth cookies
    cookieStore.delete('auth-token');
    cookieStore.delete('rider-token');
    cookieStore.delete('admin-token');
    cookieStore.delete('vendor-token');

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return successResponse({ message: 'Logged out' });
  }
}
