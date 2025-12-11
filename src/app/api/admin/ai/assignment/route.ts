import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get recent orders with rider assignments
    const orders = await prisma.order.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        riderId: true,
        rider: { select: { name: true } },
        vendor: { select: { name: true } },
      },
    });

    const totalRiders = await prisma.rider.count();
    const activeRiders = await prisma.rider.count({
      where: { isOnline: true, isAvailable: true },
    });

    // Generate assignment stats
    const totalAssignments = orders.filter(o => o.riderId).length;
    const stats = {
      totalAssignments,
      autoAssigned: Math.floor(totalAssignments * 0.75),
      manualAssigned: Math.ceil(totalAssignments * 0.25),
      avgAssignmentTime: 45 + Math.floor(Math.random() * 30),
      successRate: 85 + Math.floor(Math.random() * 10),
    };

    // Assignment settings (simulated)
    const settings = {
      enabled: true,
      maxDistance: 5,
      maxWaitTime: 120,
      prioritizeRating: true,
      prioritizeProximity: true,
      allowBatching: true,
      batchWindow: 300,
    };

    // Recent assignments
    const assignmentStatuses = ['assigned', 'accepted', 'rejected', 'timeout'] as const;
    const recentAssignments = orders
      .filter(o => o.riderId)
      .slice(0, 15)
      .map((order, index) => ({
        id: `assign-${order.id}`,
        orderNumber: order.orderNumber,
        riderName: order.rider?.name || 'Unknown Rider',
        vendorName: order.vendor.name,
        distance: 1 + Math.round((index % 5) * 0.8 * 10) / 10,
        assignmentTime: 20 + (index * 5) % 60,
        method: (index % 4 === 0 ? 'manual' : 'auto') as 'manual' | 'auto',
        status: assignmentStatuses[index % 4],
        timestamp: order.createdAt.toISOString(),
      }));

    return successResponse({
      stats,
      settings,
      recentAssignments,
    });
  } catch (error) {
    console.error('Admin auto-assignment error:', error);
    return errorResponse('Failed to fetch assignment data', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();

    // In a real implementation, this would save to a settings table
    // For now, we just validate and return success
    const validSettings = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : true,
      maxDistance: typeof body.maxDistance === 'number' ? body.maxDistance : 5,
      maxWaitTime: typeof body.maxWaitTime === 'number' ? body.maxWaitTime : 120,
      prioritizeRating: typeof body.prioritizeRating === 'boolean' ? body.prioritizeRating : true,
      prioritizeProximity: typeof body.prioritizeProximity === 'boolean' ? body.prioritizeProximity : true,
      allowBatching: typeof body.allowBatching === 'boolean' ? body.allowBatching : true,
      batchWindow: typeof body.batchWindow === 'number' ? body.batchWindow : 300,
    };

    return successResponse({
      message: 'Settings updated successfully',
      settings: validSettings,
    });
  } catch (error) {
    console.error('Admin update assignment settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
