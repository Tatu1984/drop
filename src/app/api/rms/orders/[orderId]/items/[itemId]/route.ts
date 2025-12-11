import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// PUT /api/rms/orders/[orderId]/items/[itemId] - Update order item
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  try {
    const { orderId, itemId } = params;
    const body = await request.json();
    const {
      quantity,
      seatNumber,
      courseNumber,
      courseType,
      modifiers,
      specialInstructions,
    } = body;

    // Check if item exists
    const existingItem = await prisma.dineInOrderItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.orderId !== orderId) {
      return notFoundResponse('Order item not found');
    }

    // Check if item is already void
    if (existingItem.isVoid) {
      return errorResponse('Cannot update a void item', 400);
    }

    // Prepare update data
    const updateData: any = {};

    if (quantity !== undefined) {
      updateData.quantity = quantity;
      updateData.totalPrice = existingItem.unitPrice * quantity;
    }

    if (seatNumber !== undefined) updateData.seatNumber = seatNumber;
    if (courseNumber !== undefined) updateData.courseNumber = courseNumber;
    if (courseType !== undefined) updateData.courseType = courseType;
    if (modifiers !== undefined) updateData.modifiers = modifiers;
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions;

    // Update item
    const item = await prisma.dineInOrderItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        menuItem: {
          select: {
            name: true,
            price: true,
            isVeg: true,
          },
        },
      },
    });

    // Recalculate order totals
    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
      include: {
        outlet: {
          select: {
            taxRate: true,
            serviceChargeRate: true,
          },
        },
      },
    });

    if (order) {
      const allItems = await prisma.dineInOrderItem.findMany({
        where: {
          orderId,
          isVoid: false,
        },
      });

      const newSubtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const newTaxAmount = newSubtotal * (order.outlet.taxRate / 100);
      const newServiceCharge = newSubtotal * (order.outlet.serviceChargeRate / 100);
      const newTotal = newSubtotal + newTaxAmount + newServiceCharge + order.tip - order.discount;

      await prisma.dineInOrder.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          serviceCharge: newServiceCharge,
          total: newTotal,
        },
      });
    }

    return successResponse(item, 'Item updated successfully');
  } catch (error) {
    console.error('Error updating order item:', error);
    return errorResponse('Failed to update order item', 500);
  }
}

// DELETE /api/rms/orders/[orderId]/items/[itemId] - Remove/void order item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  try {
    const { orderId, itemId } = params;
    const searchParams = request.nextUrl.searchParams;
    const voidReason = searchParams.get('voidReason') || 'Item removed';
    const voidByEmployeeId = searchParams.get('voidByEmployeeId');

    // Check if item exists
    const existingItem = await prisma.dineInOrderItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.orderId !== orderId) {
      return notFoundResponse('Order item not found');
    }

    // Void the item instead of deleting
    const item = await prisma.dineInOrderItem.update({
      where: { id: itemId },
      data: {
        isVoid: true,
        voidReason,
        voidByEmployeeId: voidByEmployeeId || null,
        status: 'VOID',
      },
    });

    // Recalculate order totals
    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
      include: {
        outlet: {
          select: {
            taxRate: true,
            serviceChargeRate: true,
          },
        },
      },
    });

    if (order) {
      const allItems = await prisma.dineInOrderItem.findMany({
        where: {
          orderId,
          isVoid: false,
        },
      });

      const newSubtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const newTaxAmount = newSubtotal * (order.outlet.taxRate / 100);
      const newServiceCharge = newSubtotal * (order.outlet.serviceChargeRate / 100);
      const newTotal = newSubtotal + newTaxAmount + newServiceCharge + order.tip - order.discount;

      await prisma.dineInOrder.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          serviceCharge: newServiceCharge,
          total: newTotal,
        },
      });
    }

    return successResponse(item, 'Item voided successfully');
  } catch (error) {
    console.error('Error deleting order item:', error);
    return errorResponse('Failed to delete order item', 500);
  }
}

// PATCH /api/rms/orders/[orderId]/items/[itemId] - Update item status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  try {
    const { orderId, itemId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('status is required', 400);
    }

    // Check if item exists
    const existingItem = await prisma.dineInOrderItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.orderId !== orderId) {
      return notFoundResponse('Order item not found');
    }

    // Update timestamps based on status
    const updateData: any = { status };

    if (status === 'SENT' && !existingItem.sentToKitchenAt) {
      updateData.sentToKitchenAt = new Date();
    } else if (status === 'READY' && !existingItem.preparedAt) {
      updateData.preparedAt = new Date();
    } else if (status === 'SERVED' && !existingItem.servedAt) {
      updateData.servedAt = new Date();
    }

    const item = await prisma.dineInOrderItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        menuItem: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    return successResponse(item, 'Item status updated successfully');
  } catch (error) {
    console.error('Error updating item status:', error);
    return errorResponse('Failed to update item status', 500);
  }
}
