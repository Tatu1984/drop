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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [orders, total, stats] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          vendor: { select: { name: true, type: true } },
          rider: { select: { name: true, phone: true } },
          address: { select: { fullAddress: true } },
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
      Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
      ]),
    ]);

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.name,
      customerPhone: order.user.phone,
      vendor: order.vendor.name,
      vendorType: order.vendor.type,
      items: order.items.map(i => ({ name: i.product.name, qty: i.quantity })),
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      total: order.total,
      status: order.status,
      rider: order.rider?.name || null,
      riderPhone: order.rider?.phone || null,
      createdAt: order.createdAt,
      deliveryAddress: order.address?.fullAddress || 'N/A',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    }));

    return successResponse({
      items: formattedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: stats[0],
        active: stats[1],
        delivered: stats[2],
        cancelled: stats[3],
      },
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { orderId, status, riderId, paymentStatus } = body;

    if (!orderId) return errorResponse('Order ID required', 400);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse('Order not found', 404);

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status.toUpperCase();
      // Create status history entry
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: status.toUpperCase(),
          note: `Status updated by admin`,
        },
      });
    }

    if (riderId) {
      updateData.riderId = riderId;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return successResponse({ order: updatedOrder, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Admin update order error:', error);
    return errorResponse('Failed to update order', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, orderId, riderId, reason } = body;

    if (!orderId || !action) {
      return errorResponse('Order ID and action required', 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse('Order not found', 404);

    if (action === 'assign-rider') {
      if (!riderId) return errorResponse('Rider ID required', 400);

      await prisma.order.update({
        where: { id: orderId },
        data: { riderId },
      });

      // Mark rider as unavailable while on delivery
      await prisma.rider.update({
        where: { id: riderId },
        data: { isAvailable: false },
      });

      return successResponse({ message: 'Rider assigned successfully' });
    }

    if (action === 'cancel') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CANCELLED',
          note: reason || 'Cancelled by admin',
        },
      });

      // Refund if paid
      if (order.paymentStatus === 'COMPLETED') {
        const wallet = await prisma.wallet.findUnique({ where: { userId: order.userId } });
        if (wallet) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: order.total } },
          });
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: order.total,
              type: 'REFUND',
              description: `Refund for cancelled order #${order.orderNumber}`,
              orderId: order.id,
            },
          });
        }
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'REFUNDED' },
        });
      }

      return successResponse({ message: 'Order cancelled successfully' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin order action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
