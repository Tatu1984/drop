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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { assignedZone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      if (status === 'online') {
        where.isOnline = true;
        where.documentVerified = true;
        where.isAvailable = true;
      } else if (status === 'busy') {
        where.isOnline = true;
        where.isAvailable = false;
      } else if (status === 'offline') {
        where.isOnline = false;
        where.documentVerified = true;
      } else if (status === 'pending') {
        where.documentVerified = false;
      } else if (status === 'unavailable') {
        where.isAvailable = false;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [riders, total, stats] = await Promise.all([
      prisma.rider.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { createdAt: { gte: today } },
            select: { id: true },
          },
          earnings: {
            where: { date: { gte: today } },
            select: { total: true },
          },
        },
      }),
      prisma.rider.count({ where }),
      Promise.all([
        prisma.rider.count(),
        prisma.rider.count({ where: { isOnline: true, documentVerified: true, isAvailable: true } }),
        prisma.rider.count({ where: { isOnline: true, isAvailable: false } }),
        prisma.rider.count({ where: { documentVerified: false } }),
      ]),
    ]);

    const formattedRiders = riders.map(rider => ({
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      email: rider.email,
      avatar: rider.avatar,
      status: !rider.documentVerified ? 'pending' : !rider.isOnline ? 'offline' : !rider.isAvailable ? 'busy' : 'online',
      rating: rider.rating,
      totalDeliveries: rider._count.orders,
      todayDeliveries: rider.orders.length,
      earnings: rider.totalEarnings,
      todayEarnings: rider.earnings.reduce((sum, e) => sum + e.total, 0),
      vehicle: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber,
      zone: rider.assignedZone,
      isVerified: rider.documentVerified,
      joinedAt: rider.createdAt,
    }));

    return successResponse({
      items: formattedRiders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: stats[0],
        online: stats[1],
        busy: stats[2],
        pending: stats[3],
      },
    });
  } catch (error) {
    console.error('Admin riders error:', error);
    return errorResponse('Failed to fetch riders', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, riderId } = body;

    // Create new rider
    if (action === 'create') {
      const { name, phone, email, vehicleType, vehicleNumber, assignedZone } = body;

      if (!name || !phone) {
        return errorResponse('Name and phone are required', 400);
      }

      // Check if phone already exists
      const existingRider = await prisma.rider.findUnique({ where: { phone } });
      if (existingRider) {
        return errorResponse('A rider with this phone number already exists', 400);
      }

      // Hash default password (phone number)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(phone, 10);

      const newRider = await prisma.rider.create({
        data: {
          name,
          phone,
          email: email || null,
          password: hashedPassword,
          vehicleType: vehicleType || 'BIKE',
          vehicleNumber: vehicleNumber || null,
          assignedZone: assignedZone || null,
          documentVerified: true, // Admin-created riders are pre-verified
          isAvailable: true,
          isOnline: false,
          rating: 5.0,
          totalEarnings: 0,
        },
      });

      return successResponse({
        message: 'Rider created successfully',
        rider: {
          id: newRider.id,
          name: newRider.name,
          phone: newRider.phone,
        }
      });
    }

    if (!riderId || !action) {
      return errorResponse('Rider ID and action required', 400);
    }

    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) return errorResponse('Rider not found', 404);

    if (action === 'approve') {
      await prisma.rider.update({
        where: { id: riderId },
        data: { documentVerified: true, isAvailable: true },
      });
      return successResponse({ message: 'Rider approved successfully' });
    }

    if (action === 'reject') {
      await prisma.rider.delete({ where: { id: riderId } });
      return successResponse({ message: 'Rider application rejected' });
    }

    if (action === 'suspend') {
      await prisma.rider.update({
        where: { id: riderId },
        data: { isAvailable: false, isOnline: false },
      });
      return successResponse({ message: 'Rider suspended successfully' });
    }

    if (action === 'activate') {
      await prisma.rider.update({
        where: { id: riderId },
        data: { isAvailable: true },
      });
      return successResponse({ message: 'Rider activated successfully' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin rider action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get('id');

    if (!riderId) return errorResponse('Rider ID required', 400);

    await prisma.rider.delete({ where: { id: riderId } });
    return successResponse({ message: 'Rider deleted successfully' });
  } catch (error) {
    console.error('Admin delete rider error:', error);
    return errorResponse('Failed to delete rider', 500);
  }
}
