import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// GET /api/vendor/analytics - Get vendor analytics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Get vendor - user.userId is the vendor ID for vendor auth
    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get orders in period
    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
      },
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'PENDING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      preparing: orders.filter(o => o.status === 'PREPARING').length,
      readyForPickup: orders.filter(o => o.status === 'READY_FOR_PICKUP').length,
      pickedUp: orders.filter(o => o.status === 'PICKED_UP').length,
      outForDelivery: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
      delivered: completedOrders,
      cancelled: cancelledOrders,
    };

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.filter(o => o.status === 'DELIVERED').forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.productId]) {
          itemSales[item.productId] = { name: item.productId, quantity: 0, revenue: 0 };
        }
        itemSales[item.productId].quantity += item.quantity;
        itemSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Daily revenue for chart
    const dailyRevenue: Record<string, number> = {};
    orders.filter(o => o.status === 'DELIVERED').forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + order.total;
    });

    const revenueChart = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get reviews stats
    const reviews = await prisma.review.findMany({
      where: { vendorId: vendor.id },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return successResponse({
      summary: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        avgOrderValue,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
      ordersByStatus,
      topItems,
      revenueChart,
      period,
    });
  } catch (error) {
    console.error('Vendor analytics GET error:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
