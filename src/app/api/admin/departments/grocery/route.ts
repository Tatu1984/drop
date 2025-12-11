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
      type: 'GROCERY',
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

    const [stores, total, stats] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true, products: true, categories: true } },
          orders: {
            where: { createdAt: { gte: today } },
            select: { id: true, total: true },
          },
        },
      }),
      prisma.vendor.count({ where }),
      Promise.all([
        prisma.vendor.count({ where: { type: 'GROCERY' } }),
        prisma.vendor.count({ where: { type: 'GROCERY', isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { type: 'GROCERY', isVerified: false } }),
        prisma.vendor.count({ where: { type: 'GROCERY', isActive: false, isVerified: true } }),
        prisma.order.aggregate({
          where: { vendor: { type: 'GROCERY' } },
          _sum: { total: true },
        }),
        prisma.product.count({ where: { vendor: { type: 'GROCERY' } } }),
        prisma.product.count({ where: { vendor: { type: 'GROCERY' }, inStock: false } }),
      ]),
    ]);

    const formattedStores = stores.map(s => ({
      id: s.id,
      name: s.name,
      image: s.coverImage || s.logo,
      rating: s.rating,
      totalRatings: s.totalRatings,
      orders: s._count.orders,
      revenue: s.orders.reduce((sum, o) => sum + o.total, 0),
      status: !s.isVerified ? 'pending' : !s.isActive ? 'suspended' : 'active',
      address: s.address,
      phone: '',
      avgDeliveryTime: s.avgDeliveryTime,
      minimumOrder: s.minimumOrder,
      commissionRate: s.commissionRate,
      isVerified: s.isVerified,
      openingTime: s.openingTime,
      closingTime: s.closingTime,
      productCount: s._count.products,
      categoryCount: s._count.categories,
      todayOrders: s.orders.length,
      stockAlerts: 0, // Would need actual low stock calculation
      joinedAt: s.createdAt.toISOString(),
    }));

    return successResponse({
      stores: formattedStores,
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        suspended: stats[3],
        totalRevenue: stats[4]._sum.total || 0,
        totalProducts: stats[5],
        lowStockAlerts: stats[6],
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin grocery error:', error);
    return errorResponse('Failed to fetch grocery stores', 500);
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
    if (!vendor) return errorResponse('Store not found', 404);

    if (action === 'approve') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isVerified: true, isActive: true },
      });
      return successResponse({ message: 'Grocery store approved successfully' });
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
      return successResponse({ message: 'Store suspended' });
    }

    if (action === 'activate') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: true },
      });
      return successResponse({ message: 'Store activated' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin grocery action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
