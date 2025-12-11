import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get user counts for different segments
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      inactiveUsers,
      usersWithOrders,
      premiumUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { updatedAt: { lt: thirtyDaysAgo } } }),
      prisma.order.findMany({
        where: { status: 'DELIVERED' },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.subscription.count({ where: { isActive: true } }),
    ]);

    // Define user segments
    const segments = [
      {
        id: 'seg-all',
        name: 'All Users',
        description: 'Every registered user on the platform',
        rules: [{ field: 'status', operator: 'equals', value: 'registered' }],
        userCount: totalUsers,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'seg-active',
        name: 'Active Users',
        description: 'Users active in the last 30 days',
        rules: [{ field: 'lastActive', operator: 'within', value: '30 days' }],
        userCount: activeUsers,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'seg-new',
        name: 'New Users',
        description: 'Users who signed up in the last 7 days',
        rules: [{ field: 'createdAt', operator: 'within', value: '7 days' }],
        userCount: newUsers,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'seg-ordered',
        name: 'Customers with Orders',
        description: 'Users who have placed at least one order',
        rules: [{ field: 'orderCount', operator: 'greater_than', value: '0' }],
        userCount: usersWithOrders.length,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'seg-inactive',
        name: 'Inactive Users',
        description: 'Users inactive for more than 30 days',
        rules: [{ field: 'lastActive', operator: 'older_than', value: '30 days' }],
        userCount: inactiveUsers,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'seg-premium',
        name: 'Premium Subscribers',
        description: 'Users with active subscription',
        rules: [{ field: 'subscription', operator: 'equals', value: 'active' }],
        userCount: premiumUsers,
        status: 'active' as const,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    return successResponse({ segments });
  } catch (error) {
    console.error('Admin segments error:', error);
    return errorResponse('Failed to fetch segments', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { name, description, rules } = body;

    if (!name || !rules || rules.length === 0) {
      return errorResponse('Name and rules required', 400);
    }

    // In production, save segment to database
    const segment = {
      id: `seg-${Date.now()}`,
      name,
      description,
      rules,
      userCount: 0, // Would be calculated based on rules
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return successResponse({ segment, message: 'Segment created successfully' });
  } catch (error) {
    console.error('Admin create segment error:', error);
    return errorResponse('Failed to create segment', 500);
  }
}
