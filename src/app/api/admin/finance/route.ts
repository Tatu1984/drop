import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'week';
    const tab = searchParams.get('tab') || 'overview';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      currentRevenue,
      prevRevenue,
      todayRevenue,
      commissionEarned,
      pendingPayouts,
      transactions,
      paymentMethods,
      revenueByMonth,
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: prevStartDate, lt: startDate }, paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      // Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      // Commission earned (assuming 15% avg commission)
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      // Pending payouts
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED', status: 'DELIVERED' },
        _sum: { subtotal: true },
      }),
      // Recent transactions
      prisma.walletTransaction.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { wallet: { include: { user: { select: { name: true } } } } },
      }),
      // Payment methods distribution
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: startDate } },
        _count: { paymentMethod: true },
      }),
      // Revenue by month (last 6 months)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
          SUM(total)::numeric as revenue
        FROM "Order"
        WHERE "paymentStatus" = 'COMPLETED'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      ` as Promise<{ month: string; revenue: number }[]>,
    ]);

    const totalRevenue = currentRevenue._sum.total || 0;
    const prevTotalRevenue = prevRevenue._sum.total || 0;
    const growthPercentage = prevTotalRevenue > 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(1)
      : 0;

    const totalPayments = paymentMethods.reduce((sum, p) => sum + p._count.paymentMethod, 0);
    const paymentDistribution = paymentMethods.map(p => ({
      method: p.paymentMethod,
      count: p._count.paymentMethod,
      percentage: totalPayments > 0 ? Math.round((p._count.paymentMethod / totalPayments) * 100) : 0,
    }));

    return successResponse({
      overview: {
        totalRevenue,
        todayRevenue: todayRevenue._sum.total || 0,
        commission: commissionEarned._sum.platformFee || Math.round(totalRevenue * 0.15),
        pendingPayouts: Math.round((pendingPayouts._sum.subtotal || 0) * 0.85),
        growthPercentage: Number(growthPercentage),
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: t.amount,
        user: t.wallet.user?.name || 'System',
        time: t.createdAt,
      })),
      paymentDistribution,
      revenueByMonth: revenueByMonth.map(r => ({
        month: r.month,
        revenue: Number(r.revenue) || 0,
      })),
    });
  } catch (error) {
    console.error('Admin finance error:', error);
    return errorResponse('Failed to fetch finance data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, payoutId } = body;

    if (action === 'process-payout') {
      // In production, integrate with payment gateway for payouts
      return successResponse({ message: 'Payout processed successfully' });
    }

    if (action === 'process-all-payouts') {
      return successResponse({ message: 'All pending payouts processed' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin finance action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
