import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// Mock notification campaigns - in production, this would be stored in a separate table
const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Weekend Sale!',
    body: 'Get 30% off on all restaurant orders this weekend!',
    type: 'promotional',
    targetSegment: 'All Users',
    sentCount: 15000,
    openCount: 4500,
    clickCount: 1200,
    status: 'sent' as const,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'New Stores Added',
    body: 'Check out the latest stores in your area',
    type: 'promotional',
    targetSegment: 'Active Users',
    sentCount: 8000,
    openCount: 2800,
    clickCount: 900,
    status: 'sent' as const,
    sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Flash Sale Tomorrow',
    body: 'Flat 50% off on first order',
    type: 'promotional',
    targetSegment: 'New Users',
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    status: 'scheduled' as const,
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-4',
    title: 'Free Delivery Weekend',
    body: 'Enjoy free delivery on all orders above Rs.199',
    type: 'promotional',
    targetSegment: 'All Users',
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    status: 'draft' as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'App Update Available',
    body: 'Update to the latest version for new features',
    type: 'system',
    targetSegment: 'All Users',
    sentCount: 20000,
    openCount: 12000,
    clickCount: 5000,
    status: 'sent' as const,
    sentAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Get user count for stats
    const totalUsers = await prisma.user.count();

    // Return mock notifications with dynamic user counts
    const notifications = mockNotifications.map(n => ({
      ...n,
      sentCount: n.status === 'sent' ? Math.floor(totalUsers * (0.8 + Math.random() * 0.2)) : 0,
      openCount: n.status === 'sent' ? Math.floor(totalUsers * (0.2 + Math.random() * 0.2)) : 0,
      clickCount: n.status === 'sent' ? Math.floor(totalUsers * (0.05 + Math.random() * 0.1)) : 0,
    }));

    const filteredNotifications = status === 'all'
      ? notifications
      : notifications.filter(n => n.status === status);

    return successResponse({ notifications: filteredNotifications });
  } catch (error) {
    console.error('Admin notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { title, body: message, type, targetSegment, scheduledAt } = body;

    if (!title || !message) {
      return errorResponse('Title and body required', 400);
    }

    // In production, this would create a notification campaign
    const notification = {
      id: `notif-${Date.now()}`,
      title,
      body: message,
      type: type || 'promotional',
      targetSegment: targetSegment || 'All Users',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt,
      createdAt: new Date().toISOString(),
    };

    return successResponse({
      notification,
      message: scheduledAt ? 'Notification scheduled' : 'Notification draft created',
    });
  } catch (error) {
    console.error('Admin create notification error:', error);
    return errorResponse('Failed to create notification', 500);
  }
}
