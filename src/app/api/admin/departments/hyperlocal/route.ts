import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { VendorType } from '@prisma/client';

const HYPERLOCAL_TYPES: VendorType[] = ['PHARMACY', 'MEAT_SHOP', 'MILK_DAIRY', 'PET_SUPPLIES', 'FLOWERS', 'GENERAL_STORE'];

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';

    const where: Record<string, unknown> = {
      type: type !== 'all' ? type : { in: HYPERLOCAL_TYPES },
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

    const [stores, total, stats, categoryStats] = await Promise.all([
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
        prisma.vendor.count({ where: { type: { in: HYPERLOCAL_TYPES } } }),
        prisma.vendor.count({ where: { type: { in: HYPERLOCAL_TYPES }, isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { type: { in: HYPERLOCAL_TYPES }, isVerified: false } }),
        prisma.order.aggregate({
          where: { vendor: { type: { in: HYPERLOCAL_TYPES } } },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { vendor: { type: { in: HYPERLOCAL_TYPES } } } }),
        prisma.order.count({ where: { vendor: { type: { in: HYPERLOCAL_TYPES } }, createdAt: { gte: today } } }),
      ]),
      // Category-wise counts
      Promise.all(
        HYPERLOCAL_TYPES.map(t => prisma.vendor.count({ where: { type: t } }))
      ),
    ]);

    const formattedStores = stores.map(s => ({
      id: s.id,
      name: s.name,
      image: s.coverImage || s.logo,
      type: s.type,
      rating: s.rating,
      orders: s._count.orders,
      revenue: s.orders.reduce((sum, o) => sum + o.total, 0),
      status: !s.isVerified ? 'pending' : !s.isActive ? 'suspended' : 'active',
      address: s.address,
      productCount: s._count.products,
      isVerified: s.isVerified,
      avgDeliveryTime: s.avgDeliveryTime,
      joinedAt: s.createdAt.toISOString(),
    }));

    return successResponse({
      stores: formattedStores,
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        byCategory: {
          pharmacy: categoryStats[0],
          meat: categoryStats[1],
          dairy: categoryStats[2],
          pets: categoryStats[3],
          flowers: categoryStats[4],
          general: categoryStats[5],
        },
        totalRevenue: stats[3]._sum.total || 0,
        totalOrders: stats[4],
        todayOrders: stats[5],
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin hyperlocal error:', error);
    return errorResponse('Failed to fetch hyperlocal stores', 500);
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
      return successResponse({ message: 'Store approved successfully' });
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
    console.error('Admin hyperlocal action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
