import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const battery = searchParams.get('battery') || 'all';

    const where: Record<string, unknown> = {
      vehicleType: { in: ['EV_BIKE', 'EV_SCOOTER'] },
    };

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

    // Simulate EV-specific data (battery, range)
    let formattedRiders = riders.map((rider, index) => {
      const batteryLevel = Math.floor(Math.random() * 100);
      const isCharging = batteryLevel < 30 && !rider.isOnline;

      return {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleNumber: rider.vehicleNumber || 'N/A',
        vehicleModel: 'Electric Scooter',
        batteryLevel,
        range: Math.floor(batteryLevel * 0.8), // km remaining
        isOnline: rider.isOnline,
        isAvailable: rider.isAvailable,
        isCharging,
        currentLocation: `Zone ${String.fromCharCode(65 + (index % 5))}`,
        todayDeliveries: todayOrdersMap.get(rider.id) || 0,
        rating: rider.rating || 4.5,
      };
    });

    // Filter by battery level
    if (battery === 'full') {
      formattedRiders = formattedRiders.filter(r => r.batteryLevel >= 80);
    } else if (battery === 'medium') {
      formattedRiders = formattedRiders.filter(r => r.batteryLevel >= 20 && r.batteryLevel < 80);
    } else if (battery === 'low') {
      formattedRiders = formattedRiders.filter(r => r.batteryLevel < 20);
    } else if (battery === 'charging') {
      formattedRiders = formattedRiders.filter(r => r.isCharging);
    }

    return successResponse({ riders: formattedRiders });
  } catch (error) {
    console.error('Admin EV fleet error:', error);
    return errorResponse('Failed to fetch EV fleet', 500);
  }
}
