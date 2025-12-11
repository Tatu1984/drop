import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Dine-in restaurants are RESTAURANT type vendors
    // In a full implementation, there would be a field to distinguish dine-in vs delivery-only
    const where: Record<string, unknown> = {
      type: 'RESTAURANT',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
        where.isVerified = true;
      } else if (status === 'pending') {
        where.isVerified = false;
      } else if (status === 'suspended') {
        where.isActive = false;
        where.isVerified = true;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [restaurants, total, stats] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { createdAt: { gte: today } },
            select: { id: true, total: true },
          },
        },
      }),
      prisma.vendor.count({ where }),
      Promise.all([
        prisma.vendor.count({ where: { type: 'RESTAURANT' } }),
        prisma.vendor.count({ where: { type: 'RESTAURANT', isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { type: 'RESTAURANT', isVerified: false } }),
        prisma.vendor.count({ where: { type: 'RESTAURANT', isActive: false, isVerified: true } }),
        prisma.order.aggregate({
          where: { vendor: { type: 'RESTAURANT' }, type: 'DINE_IN' },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { vendor: { type: 'RESTAURANT' }, type: 'DINE_IN', createdAt: { gte: today } } }),
      ]),
    ]);

    const formattedRestaurants = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      image: r.coverImage || r.logo,
      rating: r.rating,
      totalRatings: r.totalRatings,
      totalBookings: r._count.orders,
      revenue: r.orders.reduce((sum, o) => sum + o.total, 0),
      status: !r.isVerified ? 'pending' : !r.isActive ? 'suspended' : 'active',
      address: r.address,
      phone: '',
      cuisineTypes: [],
      avgDiningTime: 60,
      seatingCapacity: 50, // Would need to be added to schema
      tablesAvailable: 10,
      commissionRate: r.commissionRate,
      isVerified: r.isVerified,
      openingTime: r.openingTime,
      closingTime: r.closingTime,
      todayBookings: r.orders.length,
      upcomingBookings: 5,
      acceptsWalkIn: true,
      priceRange: '$$',
      joinedAt: r.createdAt.toISOString(),
    }));

    return successResponse({
      restaurants: formattedRestaurants,
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        suspended: stats[3],
        totalRevenue: stats[4]._sum.total || 0,
        todayBookings: stats[5],
        totalSeats: stats[1] * 50, // Estimated
        occupancyRate: 65,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin dine-in error:', error);
    return errorResponse('Failed to fetch dine-in restaurants', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { vendorId, action } = body;

    if (!vendorId || !action) {
      return errorResponse('Vendor ID and action required', 400);
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return errorResponse('Restaurant not found', 404);

    if (action === 'approve') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isVerified: true, isActive: true },
      });
      return successResponse({ message: 'Restaurant approved for dine-in' });
    }

    if (action === 'reject') {
      await prisma.vendor.delete({ where: { id: vendorId } });
      return successResponse({ message: 'Application rejected' });
    }

    if (action === 'suspend') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: false },
      });
      return successResponse({ message: 'Restaurant suspended' });
    }

    if (action === 'activate') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: true },
      });
      return successResponse({ message: 'Restaurant activated' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin dine-in action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
