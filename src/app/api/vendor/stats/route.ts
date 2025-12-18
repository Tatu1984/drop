import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// GET /api/vendor/stats - Get vendor dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's orders
    const [todayOrders, yesterdayOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.order.findMany({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: yesterday, lt: today },
        },
      }),
    ]);

    const todayOrdersCount = todayOrders.length;
    const yesterdayOrdersCount = yesterdayOrders.length;

    const todayRevenue = todayOrders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total, 0);

    const yesterdayRevenue = yesterdayOrders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total, 0);

    // Calculate percentage changes
    const ordersChange = yesterdayOrdersCount > 0
      ? ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100
      : 0;

    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Get pending orders (new orders that need attention)
    const pendingOrders = todayOrders.filter(o =>
      o.status === 'PENDING' || o.status === 'CONFIRMED'
    ).length;

    const preparingOrders = todayOrders.filter(o => o.status === 'PREPARING').length;
    const completedOrders = todayOrders.filter(o => o.status === 'DELIVERED').length;

    // Get average prep time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        createdAt: { gte: thirtyDaysAgo },
        acceptedAt: { not: null },
        readyAt: { not: null },
      },
      select: {
        acceptedAt: true,
        readyAt: true,
      },
    });

    let avgPrepTime = vendor.avgDeliveryTime || 0;
    if (recentOrders.length > 0) {
      const totalPrepTime = recentOrders.reduce((sum, order) => {
        if (order.acceptedAt && order.readyAt) {
          const diff = order.readyAt.getTime() - order.acceptedAt.getTime();
          return sum + diff / 60000; // Convert to minutes
        }
        return sum;
      }, 0);
      avgPrepTime = Math.round(totalPrepTime / recentOrders.length);
    }

    return successResponse({
      todayOrders: todayOrdersCount,
      ordersChange: Math.round(ordersChange * 10) / 10,
      todayRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      avgRating: vendor.rating,
      totalRatings: vendor.totalRatings,
      avgPrepTime,
      pendingOrders,
      preparingOrders,
      completedOrders,
    });
  } catch (error) {
    console.error('Vendor stats GET error:', error);
    return errorResponse('Failed to fetch stats', 500);
  }
}
