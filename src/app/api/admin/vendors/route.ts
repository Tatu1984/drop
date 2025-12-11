import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response';

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

    const where: Record<string, unknown> = {};

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
      }
    }

    if (type !== 'all') {
      where.type = type;
    }

    const [vendors, total, stats] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true, products: true } },
          orders: {
            where: { paymentStatus: 'COMPLETED' },
            select: { total: true },
          },
        },
      }),
      prisma.vendor.count({ where }),
      Promise.all([
        prisma.vendor.count(),
        prisma.vendor.count({ where: { isActive: true, isVerified: true } }),
        prisma.vendor.count({ where: { isVerified: false } }),
        prisma.vendor.count({ where: { isActive: false } }),
      ]),
    ]);

    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      type: vendor.type,
      logo: vendor.logo,
      coverImage: vendor.coverImage,
      rating: vendor.rating,
      totalRatings: vendor.totalRatings,
      orders: vendor._count.orders,
      products: vendor._count.products,
      revenue: vendor.orders.reduce((sum, o) => sum + o.total, 0),
      status: !vendor.isVerified ? 'pending' : !vendor.isActive ? 'suspended' : 'active',
      address: vendor.address,
      openingTime: vendor.openingTime,
      closingTime: vendor.closingTime,
      minimumOrder: vendor.minimumOrder,
      commissionRate: vendor.commissionRate,
      isVerified: vendor.isVerified,
      joinedAt: vendor.createdAt,
    }));

    return successResponse({
      items: formattedVendors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: stats[0],
        active: stats[1],
        pending: stats[2],
        suspended: stats[3],
      },
    });
  } catch (error) {
    console.error('Admin vendors error:', error);
    return errorResponse('Failed to fetch vendors', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, vendorId, ...vendorData } = body;

    // Handle actions on existing vendors
    if (action && vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) return errorResponse('Vendor not found', 404);

      if (action === 'approve') {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { isVerified: true, isActive: true },
        });
        return successResponse({ message: 'Vendor approved successfully' });
      }

      if (action === 'reject') {
        await prisma.vendor.delete({ where: { id: vendorId } });
        return successResponse({ message: 'Vendor rejected and removed' });
      }

      if (action === 'suspend') {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { isActive: false },
        });
        return successResponse({ message: 'Vendor suspended successfully' });
      }

      if (action === 'activate') {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { isActive: true },
        });
        return successResponse({ message: 'Vendor activated successfully' });
      }

      return errorResponse('Invalid action', 400);
    }

    // Create new vendor
    const newVendor = await prisma.vendor.create({
      data: {
        name: vendorData.name,
        description: vendorData.description,
        type: vendorData.type,
        logo: vendorData.logo,
        coverImage: vendorData.coverImage,
        address: vendorData.address,
        latitude: vendorData.latitude || 12.9716,
        longitude: vendorData.longitude || 77.5946,
        openingTime: vendorData.openingTime || '09:00',
        closingTime: vendorData.closingTime || '22:00',
        minimumOrder: vendorData.minimumOrder || 100,
        commissionRate: vendorData.commissionRate || 15,
        isVerified: true,
        isActive: true,
      },
    });

    return successResponse({ vendor: newVendor, message: 'Vendor created successfully' }, undefined, 201);
  } catch (error) {
    console.error('Admin vendor action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return errorResponse('Vendor ID required', 400);

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    return successResponse({ vendor, message: 'Vendor updated successfully' });
  } catch (error) {
    console.error('Admin update vendor error:', error);
    return errorResponse('Failed to update vendor', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id');

    if (!vendorId) return errorResponse('Vendor ID required', 400);

    await prisma.vendor.delete({ where: { id: vendorId } });
    return successResponse({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Admin delete vendor error:', error);
    return errorResponse('Failed to delete vendor', 500);
  }
}
