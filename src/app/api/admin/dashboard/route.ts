import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's stats
    const [
      todayOrders,
      yesterdayOrders,
      todayRevenue,
      yesterdayRevenue,
      activeUsers,
      yesterdayActiveUsers,
      onlineRiders,
      yesterdayOnlineRiders,
      recentOrders,
      ordersByStatus,
      topVendors,
    ] = await Promise.all([
      // Today's orders
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      // Yesterday's orders
      prisma.order.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      // Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      // Yesterday's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      // Active users (ordered in last 30 days)
      prisma.user.count({
        where: { orders: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
      }),
      // Yesterday active users
      prisma.user.count({
        where: { orders: { some: { createdAt: { gte: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } } },
      }),
      // Online riders
      prisma.rider.count({
        where: { isOnline: true },
      }),
      // Yesterday online riders (approximate)
      prisma.rider.count({
        where: { isOnline: true },
      }),
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          vendor: { select: { name: true } },
        },
      }),
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Top vendors
      prisma.vendor.findMany({
        take: 4,
        orderBy: { rating: 'desc' },
        include: {
          _count: { select: { orders: true } },
        },
      }),
    ]);

    const todayRevenueValue = todayRevenue._sum.total || 0;
    const yesterdayRevenueValue = yesterdayRevenue._sum.total || 0;
    const revenueGrowth = yesterdayRevenueValue > 0
      ? ((todayRevenueValue - yesterdayRevenueValue) / yesterdayRevenueValue * 100).toFixed(1)
      : 0;

    const ordersGrowth = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)
      : 0;

    const usersGrowth = yesterdayActiveUsers > 0
      ? ((activeUsers - yesterdayActiveUsers) / yesterdayActiveUsers * 100).toFixed(1)
      : 0;

    const statusCounts = ordersByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return successResponse({
      stats: {
        todayRevenue: todayRevenueValue,
        revenueGrowth: Number(revenueGrowth),
        totalOrders: todayOrders,
        ordersGrowth: Number(ordersGrowth),
        activeUsers,
        usersGrowth: Number(usersGrowth),
        onlineRiders,
        ridersChange: onlineRiders - yesterdayOnlineRiders,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name,
        vendor: order.vendor.name,
        total: order.total,
        status: order.status,
        time: order.createdAt,
      })),
      statusSummary: {
        pending: statusCounts['pending'] || 0,
        confirmed: statusCounts['confirmed'] || 0,
        preparing: statusCounts['preparing'] || 0,
        picked_up: statusCounts['picked_up'] || 0,
        out_for_delivery: statusCounts['out_for_delivery'] || 0,
        delivered: statusCounts['delivered'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
      },
      topVendors: topVendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        orders: vendor._count.orders,
        rating: vendor.rating,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
