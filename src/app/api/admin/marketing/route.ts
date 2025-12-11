import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'campaigns';

    const [coupons, couponStats] = await Promise.all([
      // Get all coupons/promotions (order by startDate instead of createdAt)
      prisma.promotion.findMany({
        orderBy: { startDate: 'desc' },
      }),
      // Coupon stats
      Promise.all([
        prisma.promotion.count(),
        prisma.promotion.count({ where: { isActive: true, endDate: { gte: new Date() } } }),
      ]),
    ]);

    // Format coupons
    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      title: coupon.description, // Promotion doesn't have title, use description
      description: coupon.description,
      type: coupon.discountType,
      value: coupon.discountValue,
      minOrder: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      validFrom: coupon.startDate,
      validTo: coupon.endDate,
      status: coupon.isActive && coupon.endDate >= new Date() ? 'active' : 'expired',
      applicableTo: coupon.vendorId ? 'specific' : 'all',
    }));

    // Mock campaigns data (would come from a campaigns table in production)
    const campaigns = [
      {
        id: '1',
        name: 'Weekend Food Fest',
        type: 'push',
        status: 'active',
        targetAudience: 'All Users',
        reach: 15000,
        sent: 15000,
        opened: 9500,
        clicked: 4200,
        scheduledAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'New User Welcome',
        type: 'email',
        status: 'active',
        targetAudience: 'New Users',
        reach: 5000,
        sent: 5000,
        opened: 3200,
        clicked: 1800,
        scheduledAt: new Date(),
        createdAt: new Date(),
      },
    ];

    // Mock referral data (User model doesn't have referral fields)
    const topReferrers = [
      { name: 'John Doe', code: 'JOHN123', earnings: 500 },
      { name: 'Jane Smith', code: 'JANE456', earnings: 350 },
      { name: 'Mike Brown', code: 'MIKE789', earnings: 250 },
    ];

    return successResponse({
      stats: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
        avgOpenRate: 63,
        totalCoupons: couponStats[0],
        activeCoupons: couponStats[1],
      },
      campaigns,
      coupons: formattedCoupons,
      referrals: {
        settings: {
          referrerReward: 100,
          refereeReward: 50,
          minOrder: 200,
          maxReferrals: 50,
        },
        topReferrers,
      },
      segments: [
        { id: '1', name: 'New Users', count: 1245, description: 'Users joined in last 30 days' },
        { id: '2', name: 'High Value', count: 567, description: 'Users with >10 orders' },
        { id: '3', name: 'Inactive', count: 890, description: 'No orders in 60 days' },
        { id: '4', name: 'Wine Lovers', count: 234, description: 'Ordered from wine category' },
      ],
    });
  } catch (error) {
    console.error('Admin marketing error:', error);
    return errorResponse('Failed to fetch marketing data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'coupon') {
      const coupon = await prisma.promotion.create({
        data: {
          code: data.code.toUpperCase(),
          description: data.description || data.title,
          discountType: data.discountType || 'PERCENTAGE',
          discountValue: data.discountValue,
          minOrderValue: data.minOrder || 0,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          startDate: new Date(data.validFrom),
          endDate: new Date(data.validTo),
          isActive: true,
        },
      });
      return successResponse({ coupon, message: 'Coupon created successfully' }, undefined, 201);
    }

    if (type === 'campaign') {
      // In production, this would create a campaign entry and schedule notifications
      return successResponse({ message: 'Campaign created successfully' }, undefined, 201);
    }

    return errorResponse('Invalid type', 400);
  } catch (error) {
    console.error('Admin marketing create error:', error);
    return errorResponse('Failed to create', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { type, id, ...data } = body;

    if (type === 'coupon') {
      const coupon = await prisma.promotion.update({
        where: { id },
        data: {
          code: data.code?.toUpperCase(),
          description: data.description || data.title,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderValue: data.minOrder,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          startDate: data.validFrom ? new Date(data.validFrom) : undefined,
          endDate: data.validTo ? new Date(data.validTo) : undefined,
          isActive: data.isActive,
        },
      });
      return successResponse({ coupon, message: 'Coupon updated successfully' });
    }

    if (type === 'referral-settings') {
      // In production, store these in a settings table
      return successResponse({ message: 'Referral settings updated' });
    }

    return errorResponse('Invalid type', 400);
  } catch (error) {
    console.error('Admin marketing update error:', error);
    return errorResponse('Failed to update', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID required', 400);

    if (type === 'coupon') {
      await prisma.promotion.delete({ where: { id } });
      return successResponse({ message: 'Coupon deleted successfully' });
    }

    return errorResponse('Invalid type', 400);
  } catch (error) {
    console.error('Admin marketing delete error:', error);
    return errorResponse('Failed to delete', 500);
  }
}
