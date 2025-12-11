import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Get rider's orders
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user || user.type !== 'rider') {
      return unauthorizedResponse('Rider authentication required');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'available', 'active', 'completed'

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type === 'available') {
      // Orders ready for pickup without a rider
      where.status = 'READY_FOR_PICKUP';
      where.riderId = null;
    } else if (type === 'active') {
      // Rider's active orders
      where.riderId = user.userId;
      where.status = {
        in: ['PICKED_UP', 'OUT_FOR_DELIVERY'],
      };
    } else if (type === 'completed') {
      // Rider's completed orders
      where.riderId = user.userId;
      where.status = 'DELIVERED';
    } else {
      // All rider's orders
      where.riderId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            logo: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    return successResponse(paginatedResponse(orders, total, page, limit));
  } catch (error) {
    console.error('Get rider orders error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

// Accept/update order
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user || user.type !== 'rider') {
      return unauthorizedResponse('Rider authentication required');
    }

    const { orderId, action } = await request.json();

    if (!orderId || !action) {
      return errorResponse('Order ID and action are required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    if (action === 'accept') {
      // Accept order
      if (order.riderId) {
        return errorResponse('Order already assigned to a rider', 400);
      }

      if (order.status !== 'READY_FOR_PICKUP') {
        return errorResponse('Order is not ready for pickup', 400);
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          riderId: user.userId,
          status: 'PICKED_UP',
          statusHistory: {
            create: {
              status: 'PICKED_UP',
              note: 'Order picked up by rider',
            },
          },
        },
      });

      return successResponse({
        order: updatedOrder,
        message: 'Order accepted',
      });
    }

    if (action === 'pickup') {
      if (order.riderId !== user.userId) {
        return errorResponse('Not authorized', 403);
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'OUT_FOR_DELIVERY',
          statusHistory: {
            create: {
              status: 'OUT_FOR_DELIVERY',
              note: 'Rider is on the way',
            },
          },
        },
      });

      return successResponse({
        order: updatedOrder,
        message: 'Order marked as out for delivery',
      });
    }

    if (action === 'deliver') {
      if (order.riderId !== user.userId) {
        return errorResponse('Not authorized', 403);
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          paymentStatus: order.paymentMethod === 'COD' ? 'COMPLETED' : order.paymentStatus,
          statusHistory: {
            create: {
              status: 'DELIVERED',
              note: 'Order delivered',
            },
          },
        },
      });

      // Calculate and add rider earnings
      const earning = order.deliveryFee * 0.8 + order.tip; // 80% of delivery fee + full tip

      await prisma.riderEarning.create({
        data: {
          riderId: user.userId,
          baseEarning: order.deliveryFee * 0.8,
          tip: order.tip,
          total: earning,
        },
      });

      // Update rider stats
      await prisma.rider.update({
        where: { id: user.userId },
        data: {
          totalDeliveries: { increment: 1 },
          totalEarnings: { increment: earning },
        },
      });

      return successResponse({
        order: updatedOrder,
        earning,
        message: 'Order delivered successfully',
      });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Rider order action error:', error);
    return errorResponse('Failed to update order', 500);
  }
}
