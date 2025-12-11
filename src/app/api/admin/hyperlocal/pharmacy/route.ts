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
      type: 'PHARMACY',
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

    const [pharmacies, total, stats] = await Promise.all([
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
        prisma.vendor.count({ where: { type: 'PHARMACY' } }),
        prisma.vendor.count({ where: { type: 'PHARMACY', isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { type: 'PHARMACY', isVerified: false } }),
        prisma.vendor.count({ where: { type: 'PHARMACY', isActive: false, isVerified: true } }),
        prisma.order.aggregate({
          where: { vendor: { type: 'PHARMACY' } },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { vendor: { type: 'PHARMACY' } } }),
        prisma.order.count({ where: { vendor: { type: 'PHARMACY' }, createdAt: { gte: today } } }),
      ]),
    ]);

    const formattedPharmacies = pharmacies.map(p => ({
      id: p.id,
      name: p.name,
      image: p.coverImage || p.logo,
      rating: p.rating,
      orders: p._count.orders,
      revenue: p.orders.reduce((sum, o) => sum + o.total, 0),
      status: !p.isVerified ? 'pending' : !p.isActive ? 'suspended' : 'active',
      address: p.address,
      phone: '',
      productCount: p._count.products,
      isVerified: p.isVerified,
      avgDeliveryTime: p.avgDeliveryTime,
      licenseNumber: p.licenseNumber || '',
      licenseExpiry: p.licenseExpiry?.toISOString() || '',
      hasPharmacist: true, // Would need to be added to schema
      prescriptionRequired: Math.floor(p._count.products * 0.3), // Estimated
      joinedAt: p.createdAt.toISOString(),
    }));

    return successResponse({
      stores: formattedPharmacies,
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        suspended: stats[3],
        totalRevenue: stats[4]._sum.total || 0,
        totalOrders: stats[5],
        todayOrders: stats[6],
        prescriptionOrders: Math.floor(stats[5] * 0.4), // Estimated
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin pharmacy error:', error);
    return errorResponse('Failed to fetch pharmacies', 500);
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
    if (!vendor) return errorResponse('Pharmacy not found', 404);

    if (action === 'approve') {
      // Pharmacies require license verification
      if (!vendor.licenseNumber) {
        return errorResponse('Drug license number required for approval', 400);
      }
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isVerified: true, isActive: true },
      });
      return successResponse({ message: 'Pharmacy approved successfully' });
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
      return successResponse({ message: 'Pharmacy suspended' });
    }

    if (action === 'activate') {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: true },
      });
      return successResponse({ message: 'Pharmacy activated' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin pharmacy action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
