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

    const where: Record<string, unknown> = {
      vehicleType: 'BIKE',
    };

    if (status === 'online') {
      where.isOnline = true;
    } else if (status === 'offline') {
      where.isOnline = false;
    } else if (status === 'maintenance') {
      // For now, simulate maintenance with offline riders
      where.isOnline = false;
      where.documentVerified = true;
    }

    const riders = await prisma.rider.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's deliveries for each rider
    const todayOrders = await prisma.order.groupBy({
      by: ['riderId'],
      where: {
        riderId: { in: riders.map(r => r.id) },
        createdAt: { gte: today },
        status: 'DELIVERED',
      },
      _count: true,
    });

    const todayOrdersMap = new Map(todayOrders.map(o => [o.riderId, o._count]));

    const formattedRiders = riders.map(rider => ({
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      vehicleNumber: rider.vehicleNumber || 'N/A',
      vehicleModel: rider.vehicleType || 'Standard Bike',
      isOnline: rider.isOnline,
      isAvailable: rider.isAvailable,
      currentLocation: 'Zone A', // Would come from real-time tracking
      todayDeliveries: todayOrdersMap.get(rider.id) || 0,
      rating: rider.rating || 4.5,
      status: !rider.isOnline ? (rider.documentVerified ? 'maintenance' : 'offline') : 'active',
    }));

    return successResponse({ riders: formattedRiders });
  } catch (error) {
    console.error('Admin bike fleet error:', error);
    return errorResponse('Failed to fetch bike fleet', 500);
  }
}
