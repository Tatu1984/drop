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
          _count: { select: { orders: true, products: true } },
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
          where: { vendor: { type: 'RESTAURANT' } },
          _sum: { total: true },
        }),
        prisma.vendor.aggregate({
          where: { type: 'RESTAURANT', rating: { gt: 0 } },
          _avg: { rating: true },
        }),
        prisma.order.count({ where: { vendor: { type: 'RESTAURANT' } } }),
        prisma.order.count({ where: { vendor: { type: 'RESTAURANT' }, createdAt: { gte: today } } }),
      ]),
    ]);

    const formattedRestaurants = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      image: r.coverImage || r.logo,
      rating: r.rating,
      totalRatings: r.totalRatings,
      orders: r._count.orders,
      revenue: r.orders.reduce((sum, o) => sum + o.total, 0),
      status: !r.isVerified ? 'pending' : !r.isActive ? 'suspended' : 'active',
      address: r.address,
      phone: '', // Vendor model doesn't have phone - would need to be added
      cuisineTypes: [], // Would come from categories or tags
      avgDeliveryTime: r.avgDeliveryTime,
      minimumOrder: r.minimumOrder,
      commissionRate: r.commissionRate,
      isVerified: r.isVerified,
      openingTime: r.openingTime,
      closingTime: r.closingTime,
      menuItems: r._count.products,
      todayOrders: r.orders.length,
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
        avgRating: stats[5]._avg.rating || 0,
        totalOrders: stats[6],
        todayOrders: stats[7],
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin restaurants error:', error);
    return errorResponse('Failed to fetch restaurants', 500);
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
      return successResponse({ message: 'Restaurant approved successfully' });
    }

    if (action === 'reject') {
      await prisma.vendor.delete({ where: { id: vendorId } });
      return successResponse({ message: 'Restaurant application rejected' });
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
    console.error('Admin restaurant action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { vendorId, ...updateData } = body;

    if (!vendorId) {
      return errorResponse('Vendor ID required', 400);
    }

    const updateFields: Record<string, unknown> = {};
    if (updateData.commissionRate !== undefined) {
      updateFields.commissionRate = updateData.commissionRate;
    }
    if (updateData.minimumOrder !== undefined) {
      updateFields.minimumOrder = updateData.minimumOrder;
    }
    if (updateData.avgDeliveryTime !== undefined) {
      updateFields.avgDeliveryTime = updateData.avgDeliveryTime;
    }

    await prisma.vendor.update({
      where: { id: vendorId },
      data: updateFields,
    });

    return successResponse({ message: 'Restaurant updated successfully' });
  } catch (error) {
    console.error('Admin update restaurant error:', error);
    return errorResponse('Failed to update restaurant', 500);
  }
}
