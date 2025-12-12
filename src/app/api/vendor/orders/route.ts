import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/vendor/orders - Get vendor's orders
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const where: any = { vendorId: vendor.id };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { gte: startDate, lt: endDate };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true },
          },
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
          address: true,
          rider: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(paginatedResponse(orders, total, page, limit));
  } catch (error) {
    console.error('Vendor orders GET error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

// PUT /api/vendor/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const body = await request.json();
    const { orderId, status, prepTime, note } = body;

    if (!orderId || !status) {
      return errorResponse('Order ID and status are required', 400);
    }

    // Verify order belongs to vendor
    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, vendorId: vendor.id },
    });

    if (!existingOrder) {
      return errorResponse('Order not found', 404);
    }

    const updateData: any = { status };

    if (prepTime) {
      updateData.prepTime = prepTime;
    }

    if (status === 'PREPARING') {
      updateData.acceptedAt = new Date();
    } else if (status === 'READY') {
      updateData.readyAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // Add to order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: note || `Status updated to ${status}`,
      },
    });

    return successResponse(order, 'Order status updated successfully');
  } catch (error) {
    console.error('Vendor orders PUT error:', error);
    return errorResponse('Failed to update order', 500);
  }
}
