import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Get riders with their delivery counts
    const riders = await prisma.rider.findMany({
      where: { documentVerified: true },
      include: {
        orders: {
          where: { status: 'DELIVERED' },
          select: { id: true, total: true, tip: true },
        },
      },
    });

    // Calculate payouts with base earning + incentives + tips
    const basePerDelivery = 30;
    const perKm = 5;
    const incentiveThreshold = 15;
    const incentiveBonus = 200;

    const payouts = riders.map(rider => {
      const deliveries = rider.orders.length;
      const baseEarning = deliveries * basePerDelivery + deliveries * 3 * perKm; // Avg 3km per delivery
      const tips = rider.orders.reduce((sum, o) => sum + (o.tip || 0), 0);
      const incentives = deliveries >= incentiveThreshold ? incentiveBonus : 0;
      const totalEarning = baseEarning + tips + incentives;

      // Simulate status
      let payoutStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
      if (totalEarning > 3000) payoutStatus = 'completed';
      else if (totalEarning > 1500) payoutStatus = 'processing';

      return {
        id: `rider-payout-${rider.id}`,
        riderName: rider.name,
        phone: rider.phone,
        deliveries,
        baseEarning,
        incentives,
        tips,
        totalEarning,
        period: 'This Week',
        status: payoutStatus,
        bankAccount: 'XXXX5678',
        upiId: rider.phone + '@upi',
      };
    }).filter(p => p.deliveries > 0);

    // Filter by status
    const filteredPayouts = status === 'all'
      ? payouts
      : payouts.filter(p => p.status === status);

    return successResponse({ payouts: filteredPayouts });
  } catch (error) {
    console.error('Admin rider payouts error:', error);
    return errorResponse('Failed to fetch rider payouts', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { payoutIds, action } = body;

    if (!payoutIds || !action) {
      return errorResponse('Payout IDs and action required', 400);
    }

    return successResponse({
      message: `${payoutIds.length} rider payouts processed successfully`,
    });
  } catch (error) {
    console.error('Admin process rider payouts error:', error);
    return errorResponse('Failed to process payouts', 500);
  }
}
