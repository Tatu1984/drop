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

    // Get referrals with related user data
    const dbReferrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        referrer: { select: { id: true, name: true, phone: true } },
        referred: { select: { id: true, name: true, phone: true } },
      },
    });

    // Check if referred users have made orders
    const referredUserIds = dbReferrals.map(r => r.referredId);
    const ordersCount = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: referredUserIds }, status: 'DELIVERED' },
      _count: true,
    });

    const ordersMap = new Map(ordersCount.map(o => [o.userId, o._count]));

    const referrals = dbReferrals.map(ref => {
      const hasOrdered = (ordersMap.get(ref.referredId) || 0) > 0;

      return {
        id: ref.id,
        referrerName: ref.referrer.name || 'Unknown',
        referrerPhone: ref.referrer.phone,
        referredName: ref.referred.name || 'New User',
        referredPhone: ref.referred.phone,
        code: ref.referralCode,
        status: hasOrdered ? 'completed' : 'pending',
        referrerReward: hasOrdered ? 50 : 0,
        referredReward: hasOrdered ? 100 : 0,
        createdAt: ref.createdAt.toISOString(),
        completedAt: hasOrdered ? ref.createdAt.toISOString() : undefined,
      };
    });

    // Filter by status
    const filteredReferrals = status === 'all'
      ? referrals
      : referrals.filter(r => r.status === status);

    // Settings (static for now)
    const settings = {
      referrerReward: 50,
      referredReward: 100,
      minOrderValue: 199,
      expiryDays: 30,
      maxReferralsPerUser: 20,
    };

    return successResponse({ referrals: filteredReferrals, settings });
  } catch (error) {
    console.error('Admin referrals error:', error);
    return errorResponse('Failed to fetch referrals', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { referrerReward, referredReward, minOrderValue, expiryDays } = body;

    // In a real implementation, these settings would be stored in a config table
    // For now, just return success
    const settings = {
      referrerReward: referrerReward || 50,
      referredReward: referredReward || 100,
      minOrderValue: minOrderValue || 199,
      expiryDays: expiryDays || 30,
      maxReferralsPerUser: 20,
    };

    return successResponse({ message: 'Referral settings updated', settings });
  } catch (error) {
    console.error('Admin update referral settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
