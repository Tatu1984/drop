import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/vendor/earnings - Get vendor's earnings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Get vendor
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
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get completed orders
    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalOrders = await prisma.order.count({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        createdAt: { gte: startDate },
      },
    });

    // Calculate earnings
    const allDeliveredOrders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        createdAt: { gte: startDate },
      },
    });

    const grossEarnings = allDeliveredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const platformFee = grossEarnings * 0.15; // 15% platform fee
    const gstAmount = grossEarnings * 0.05; // 5% GST
    const netEarnings = grossEarnings - platformFee - gstAmount;

    // Daily earnings for chart
    const dailyEarnings: Record<string, { gross: number; net: number; orders: number }> = {};
    allDeliveredOrders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyEarnings[dateKey]) {
        dailyEarnings[dateKey] = { gross: 0, net: 0, orders: 0 };
      }
      dailyEarnings[dateKey].gross += order.subtotal;
      dailyEarnings[dateKey].net += order.subtotal * 0.8; // 80% after fees
      dailyEarnings[dateKey].orders += 1;
    });

    const earningsChart = Object.entries(dailyEarnings)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get pending payouts
    const pendingPayout = await prisma.order.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        // Add payout status check if you have that field
      },
      _sum: { subtotal: true },
    });

    // Transactions (order payouts)
    const transactions = orders.map(order => ({
      id: order.id,
      type: 'ORDER_PAYOUT',
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.subtotal * 0.8,
      date: order.createdAt,
      status: 'COMPLETED',
    }));

    return successResponse({
      summary: {
        grossEarnings,
        platformFee,
        gstAmount,
        netEarnings,
        totalOrders: allDeliveredOrders.length,
        avgOrderValue: allDeliveredOrders.length > 0 ? grossEarnings / allDeliveredOrders.length : 0,
        pendingPayout: (pendingPayout._sum.subtotal || 0) * 0.8,
      },
      earningsChart,
      ...paginatedResponse(transactions, totalOrders, page, limit),
      period,
    });
  } catch (error) {
    console.error('Vendor earnings GET error:', error);
    return errorResponse('Failed to fetch earnings', 500);
  }
}
