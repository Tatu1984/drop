import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Get notifications
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.userId, isRead: false },
      }),
    ]);

    return successResponse({
      ...paginatedResponse(notifications, total, page, limit),
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { notificationId, markAllRead } = await request.json();

    if (markAllRead) {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.userId, isRead: false },
        data: { isRead: true },
      });

      return successResponse({ message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return errorResponse('Notification ID is required', 400);
    }

    // Mark single notification as read
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.userId,
      },
      data: { isRead: true },
    });

    return successResponse({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

// Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId: user.userId },
      });
      return successResponse({ message: 'All notifications cleared' });
    }

    if (!notificationId) {
      return errorResponse('Notification ID is required', 400);
    }

    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: user.userId,
      },
    });

    return successResponse({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}
