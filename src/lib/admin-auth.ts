import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export async function getAdminUser(request: NextRequest): Promise<{ admin: JWTPayload | null; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  const cookieHeader = request.cookies.get('admin-token')?.value;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieHeader) {
    token = cookieHeader;
  }

  if (!token) {
    return { admin: null, error: 'No authentication token provided' };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { admin: null, error: 'Invalid or expired token' };
  }

  if (payload.type !== 'admin') {
    return { admin: null, error: 'Not authorized as admin' };
  }

  return { admin: payload };
}

export function adminUnauthorizedResponse(error?: string) {
  return Response.json(
    { success: false, error: error || 'Unauthorized' },
    { status: 401 }
  );
}
