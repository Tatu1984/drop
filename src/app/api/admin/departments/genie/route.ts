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
    const type = searchParams.get('type') || 'all';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For Genie, we use orders with type GENIE_TASK or similar
    // Since Prisma schema might not have specific genie task table,
    // we'll simulate with order data filtered by type

    const where: Record<string, unknown> = {
      orderType: 'GENIE',
    };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Get orders that are genie tasks (or simulate with delivery orders)
    const [orders, total, stats] = await Promise.all([
      prisma.order.findMany({
        where: { type: 'DELIVERY' }, // Simulating genie orders
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          rider: { select: { name: true, phone: true } },
          address: true,
        },
      }),
      prisma.order.count({ where: { type: 'DELIVERY' } }),
      Promise.all([
        prisma.order.count({ where: { type: 'DELIVERY' } }),
        prisma.order.count({ where: { type: 'DELIVERY', status: 'PENDING' } }),
        prisma.order.count({ where: { type: 'DELIVERY', status: { in: ['CONFIRMED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } } }),
        prisma.order.count({ where: { type: 'DELIVERY', status: 'DELIVERED', createdAt: { gte: today } } }),
        prisma.order.aggregate({
          where: { type: 'DELIVERY' },
          _sum: { total: true },
          _avg: { total: true },
        }),
        prisma.rider.count({ where: { isOnline: true, isAvailable: true, documentVerified: true } }),
      ]),
    ]);

    // Format as genie tasks
    const tasks = orders.map(o => ({
      id: o.id,
      taskNumber: o.orderNumber,
      type: 'pickup_drop',
      status: o.status.toLowerCase(),
      customerName: o.user?.name || 'Customer',
      customerPhone: o.user?.phone || '',
      pickupAddress: o.address?.fullAddress || 'Pickup location',
      dropAddress: o.address?.fullAddress || 'Drop location',
      description: 'Delivery task',
      estimatedFare: o.total,
      actualFare: o.total,
      riderId: o.riderId,
      riderName: o.rider?.name || null,
      createdAt: o.createdAt.toISOString(),
      assignedAt: o.riderId ? o.updatedAt.toISOString() : null,
      completedAt: o.status === 'DELIVERED' ? o.updatedAt.toISOString() : null,
      priority: 'medium',
    }));

    return successResponse({
      tasks,
      stats: {
        totalTasks: stats[0],
        pendingTasks: stats[1],
        inProgressTasks: stats[2],
        completedToday: stats[3],
        avgCompletionTime: 30,
        totalRevenue: stats[4]._sum.total || 0,
        activeRiders: stats[5],
        avgFare: stats[4]._avg.total || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin genie error:', error);
    return errorResponse('Failed to fetch genie tasks', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { taskId, action, riderId } = body;

    if (!taskId || !action) {
      return errorResponse('Task ID and action required', 400);
    }

    const order = await prisma.order.findUnique({ where: { id: taskId } });
    if (!order) return errorResponse('Task not found', 404);

    if (action === 'assign') {
      if (!riderId) {
        return errorResponse('Rider ID required for assignment', 400);
      }
      await prisma.order.update({
        where: { id: taskId },
        data: { riderId, status: 'CONFIRMED' },
      });
      return successResponse({ message: 'Rider assigned successfully' });
    }

    if (action === 'cancel') {
      await prisma.order.update({
        where: { id: taskId },
        data: { status: 'CANCELLED' },
      });
      return successResponse({ message: 'Task cancelled' });
    }

    if (action === 'complete') {
      await prisma.order.update({
        where: { id: taskId },
        data: { status: 'DELIVERED' },
      });
      return successResponse({ message: 'Task completed' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin genie action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
