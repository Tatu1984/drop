import { NextRequest } from 'next/server';
import { getCurrentUser, getFullUser, getFullRider, getFullAdmin } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error || 'Not authenticated');
    }

    let userData;

    switch (user.type) {
      case 'user':
        userData = await getFullUser(user.userId);
        break;
      case 'rider':
        userData = await getFullRider(user.userId);
        break;
      case 'admin':
        userData = await getFullAdmin(user.userId);
        break;
      default:
        return errorResponse('Invalid user type', 400);
    }

    if (!userData) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      type: user.type,
      user: userData,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Failed to get user data', 500);
  }
}
