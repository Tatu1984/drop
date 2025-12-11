import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Update rider location
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user || user.type !== 'rider') {
      return unauthorizedResponse('Rider authentication required');
    }

    const { latitude, longitude, isOnline } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return errorResponse('Location coordinates are required', 400);
    }

    const updateData: Record<string, unknown> = {
      currentLat: latitude,
      currentLng: longitude,
    };

    if (isOnline !== undefined) {
      updateData.isOnline = isOnline;
    }

    const rider = await prisma.rider.update({
      where: { id: user.userId },
      data: updateData,
    });

    // Update location on active orders
    await prisma.order.updateMany({
      where: {
        riderId: user.userId,
        status: { in: ['PICKED_UP', 'OUT_FOR_DELIVERY'] },
      },
      data: {
        currentLat: latitude,
        currentLng: longitude,
      },
    });

    return successResponse({
      message: 'Location updated',
      isOnline: rider.isOnline,
    });
  } catch (error) {
    console.error('Update rider location error:', error);
    return errorResponse('Failed to update location', 500);
  }
}

// Get rider status
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user || user.type !== 'rider') {
      return unauthorizedResponse('Rider authentication required');
    }

    const rider = await prisma.rider.findUnique({
      where: { id: user.userId },
      select: {
        isOnline: true,
        isAvailable: true,
        currentLat: true,
        currentLng: true,
        assignedZone: true,
      },
    });

    // Get active orders count
    const activeOrdersCount = await prisma.order.count({
      where: {
        riderId: user.userId,
        status: { in: ['PICKED_UP', 'OUT_FOR_DELIVERY'] },
      },
    });

    return successResponse({
      ...rider,
      activeOrdersCount,
    });
  } catch (error) {
    console.error('Get rider status error:', error);
    return errorResponse('Failed to get status', 500);
  }
}
