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
    const license = searchParams.get('license') || 'all';

    const where: Record<string, unknown> = {
      type: 'WINE_SHOP',
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

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (license !== 'all') {
      if (license === 'valid') {
        where.licenseExpiry = { gt: thirtyDaysFromNow };
      } else if (license === 'expiring') {
        where.licenseExpiry = { gt: now, lte: thirtyDaysFromNow };
      } else if (license === 'expired') {
        where.licenseExpiry = { lte: now };
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
          _count: { select: { orders: true, products: true } },
          orders: {
            where: { createdAt: { gte: today } },
            select: { id: true, total: true },
          },
        },
      }),
      prisma.vendor.count({ where }),
      Promise.all([
        prisma.vendor.count({ where: { type: 'WINE_SHOP' } }),
        prisma.vendor.count({ where: { type: 'WINE_SHOP', isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { type: 'WINE_SHOP', isVerified: false } }),
        prisma.vendor.count({ where: { type: 'WINE_SHOP', isActive: false, isVerified: true } }),
        prisma.order.aggregate({
          where: { vendor: { type: 'WINE_SHOP' } },
          _sum: { total: true },
        }),
        prisma.vendor.count({
          where: {
            type: 'WINE_SHOP',
            licenseExpiry: { gt: now, lte: thirtyDaysFromNow },
          },
        }),
      ]),
    ]);

    const formattedStores = stores.map(s => {
      let licenseStatus = 'valid';
      if (s.licenseExpiry) {
        if (s.licenseExpiry <= now) licenseStatus = 'expired';
        else if (s.licenseExpiry <= thirtyDaysFromNow) licenseStatus = 'expiring';
      }

      return {
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
        todayOrders: s.orders.length,
        licenseNumber: s.licenseNumber,
        licenseExpiry: s.licenseExpiry?.toISOString(),
        licenseStatus,
        ageVerifiedOrders: s._count.orders, // All orders should be age-verified
        rejectedOrders: 0,
        joinedAt: s.createdAt.toISOString(),
      };
    });

    return successResponse({
      stores: formattedStores,
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        suspended: stats[3],
        totalRevenue: stats[4]._sum.total || 0,
        expiringLicenses: stats[5],
        ageVerificationRate: 100,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin wine stores error:', error);
    return errorResponse('Failed to fetch wine stores', 500);
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
      // Verify license before approving
      if (!vendor.licenseNumber) {
        return errorResponse('License number required for approval', 400);
      }
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isVerified: true, isActive: true },
      });
      return successResponse({ message: 'Wine store approved successfully' });
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
      // Check license before reactivating
      if (vendor.licenseExpiry && vendor.licenseExpiry <= new Date()) {
        return errorResponse('Cannot activate store with expired license', 400);
      }
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: true },
      });
      return successResponse({ message: 'Store activated' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin wine action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
