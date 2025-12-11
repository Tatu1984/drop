import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Get rider earnings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user || user.type !== 'rider') {
      return unauthorizedResponse('Rider authentication required');
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, all
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const where = {
      riderId: user.userId,
      date: { gte: startDate },
    };

    // Get earnings summary
    const summary = await prisma.riderEarning.aggregate({
      where,
      _sum: {
        baseEarning: true,
        tip: true,
        incentive: true,
        penalty: true,
        total: true,
      },
      _count: true,
    });

    // Get earnings list
    const [earnings, total] = await Promise.all([
      prisma.riderEarning.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.riderEarning.count({ where }),
    ]);

    // Get rider's total stats
    const rider = await prisma.rider.findUnique({
      where: { id: user.userId },
      select: {
        totalDeliveries: true,
        totalEarnings: true,
        rating: true,
      },
    });

    return successResponse({
      summary: {
        baseEarning: summary._sum.baseEarning || 0,
        tips: summary._sum.tip || 0,
        incentives: summary._sum.incentive || 0,
        penalties: summary._sum.penalty || 0,
        total: summary._sum.total || 0,
        deliveries: summary._count,
      },
      earnings: paginatedResponse(earnings, total, page, limit),
      lifetime: rider,
    });
  } catch (error) {
    console.error('Get rider earnings error:', error);
    return errorResponse('Failed to fetch earnings', 500);
  }
}
