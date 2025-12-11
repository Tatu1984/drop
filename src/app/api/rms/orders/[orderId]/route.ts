import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/orders/[orderId] - Get single order with items
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            tableNumber: true,
            floor: {
              select: {
                name: true,
              },
            },
          },
        },
        server: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
                isVeg: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        payments: {
          include: {
            processedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        splitBills: {
          include: {
            items: true,
            payments: true,
          },
        },
        discounts: {
          include: {
            appliedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            approvedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Order not found');
    }

    return successResponse(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse('Failed to fetch order', 500);
  }
}

// PUT /api/rms/orders/[orderId] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const {
      serverEmployeeId,
      guestCount,
      status,
      notes,
    } = body;

    // Check if order exists
    const existingOrder = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return notFoundResponse('Order not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (serverEmployeeId !== undefined) updateData.serverEmployeeId = serverEmployeeId;
    if (guestCount !== undefined) updateData.guestCount = guestCount;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // If closing order, set closedAt
    if (status === 'CLOSED' && existingOrder.status !== 'CLOSED') {
      updateData.closedAt = new Date();

      // Update table status to AVAILABLE
      await prisma.table.update({
        where: { id: existingOrder.tableId },
        data: {
          status: 'AVAILABLE',
          currentOrderId: null,
        },
      });
    }

    const order = await prisma.dineInOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        table: {
          select: {
            tableNumber: true,
            floor: {
              select: {
                name: true,
              },
            },
          },
        },
        server: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return successResponse(order, 'Order updated successfully');
  } catch (error) {
    console.error('Error updating order:', error);
    return errorResponse('Failed to update order', 500);
  }
}

// DELETE /api/rms/orders/[orderId] - Delete/void order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Check if order exists
    const existingOrder = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return notFoundResponse('Order not found');
    }

    // Void the order instead of deleting
    const order = await prisma.dineInOrder.update({
      where: { id: orderId },
      data: {
        status: 'VOID',
        closedAt: new Date(),
      },
    });

    // Update table status to AVAILABLE
    await prisma.table.update({
      where: { id: existingOrder.tableId },
      data: {
        status: 'AVAILABLE',
        currentOrderId: null,
      },
    });

    return successResponse(order, 'Order voided successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    return errorResponse('Failed to delete order', 500);
  }
}
