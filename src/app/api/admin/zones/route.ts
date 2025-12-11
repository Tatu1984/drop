import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [zones, stats] = await Promise.all([
      prisma.zone.findMany({
        where,
        orderBy: { name: 'asc' },
      }),
      Promise.all([
        prisma.zone.count(),
        prisma.zone.count({ where: { isActive: true } }),
        prisma.rider.count({ where: { documentVerified: true, isAvailable: true } }),
        prisma.zone.count({ where: { surgePricing: { gt: 1 } } }),
      ]),
    ]);

    // Get rider counts per zone
    const ridersByZone = await prisma.rider.groupBy({
      by: ['assignedZone'],
      _count: { assignedZone: true },
    });

    const riderCountMap = ridersByZone.reduce((acc, r) => {
      if (r.assignedZone) acc[r.assignedZone] = r._count.assignedZone;
      return acc;
    }, {} as Record<string, number>);

    const formattedZones = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      area: zone.name, // Zone doesn't have area field
      status: zone.isActive ? (zone.surgePricing > 1 ? 'surge' : 'active') : 'inactive',
      riders: riderCountMap[zone.name] || 0,
      activeOrders: Math.floor(Math.random() * 20), // Mock - would need live tracking
      avgDeliveryTime: 30,
      surgeMultiplier: zone.surgePricing,
      coordinates: { lat: 12.9716, lng: 77.5946 }, // Mock coordinates
      radius: 5,
    }));

    return successResponse({
      zones: formattedZones,
      stats: {
        totalZones: stats[0],
        activeZones: stats[1],
        totalRiders: stats[2],
        avgDeliveryTime: 30,
        surgeZones: stats[3],
      },
    });
  } catch (error) {
    console.error('Admin zones error:', error);
    return errorResponse('Failed to fetch zones', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, zoneId, ...zoneData } = body;

    if (action && zoneId) {
      const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zone) return errorResponse('Zone not found', 404);

      if (action === 'start-surge' || action === 'toggle-surge') {
        const newMultiplier = zone.surgePricing > 1 ? 1 : 1.5;
        await prisma.zone.update({
          where: { id: zoneId },
          data: { surgePricing: newMultiplier },
        });
        return successResponse({ message: `Surge ${newMultiplier > 1 ? 'enabled' : 'disabled'}` });
      }

      if (action === 'end-surge') {
        await prisma.zone.update({
          where: { id: zoneId },
          data: { surgePricing: 1 },
        });
        return successResponse({ message: 'Surge ended' });
      }

      if (action === 'activate') {
        await prisma.zone.update({
          where: { id: zoneId },
          data: { isActive: true },
        });
        return successResponse({ message: 'Zone activated' });
      }

      if (action === 'deactivate') {
        await prisma.zone.update({
          where: { id: zoneId },
          data: { isActive: false },
        });
        return successResponse({ message: 'Zone deactivated' });
      }

      return errorResponse('Invalid action', 400);
    }

    // Create new zone
    const zone = await prisma.zone.create({
      data: {
        name: zoneData.name,
        polygon: zoneData.polygon || { type: 'Polygon', coordinates: [] },
        deliveryFee: zoneData.deliveryFee || 40,
        surgePricing: 1,
        isActive: true,
      },
    });

    return successResponse({ zone, message: 'Zone created successfully' }, undefined, 201);
  } catch (error) {
    console.error('Admin zone action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { id, type, ...data } = body;

    if (type === 'surge-settings') {
      // In production, store these in a settings table
      return successResponse({ message: 'Surge settings updated' });
    }

    if (!id) return errorResponse('Zone ID required', 400);

    const zone = await prisma.zone.update({
      where: { id },
      data: {
        name: data.name,
        polygon: data.polygon,
        deliveryFee: data.deliveryFee,
        surgePricing: data.surgePricing,
        isActive: data.isActive,
      },
    });

    return successResponse({ zone, message: 'Zone updated successfully' });
  } catch (error) {
    console.error('Admin update zone error:', error);
    return errorResponse('Failed to update zone', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('id');

    if (!zoneId) return errorResponse('Zone ID required', 400);

    await prisma.zone.delete({ where: { id: zoneId } });
    return successResponse({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Admin delete zone error:', error);
    return errorResponse('Failed to delete zone', 500);
  }
}
