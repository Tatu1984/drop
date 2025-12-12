import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/orders/[orderId]/items - Get all items for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Check if order exists
    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return notFoundResponse('Order not found');
    }

    const items = await prisma.dineInOrderItem.findMany({
      where: { orderId },
      include: {
        menuItem: {
          select: {
            name: true,
            price: true,
            isVeg: true,
            isVegan: true,
            isGlutenFree: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return successResponse(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return errorResponse('Failed to fetch order items', 500);
  }
}

// POST /api/rms/orders/[orderId]/items - Add item to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const {
      menuItemId,
      quantity,
      seatNumber,
      courseNumber,
      courseType,
      modifiers,
      specialInstructions,
    } = body;

    // Validation
    if (!menuItemId || !quantity) {
      return errorResponse('menuItemId and quantity are required', 400);
    }

    // Check if order exists
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

    if (!order) {
      return notFoundResponse('Order not found');
    }

    // Check if order is already closed or void
    if (order.status === 'CLOSED' || order.status === 'VOID') {
      return errorResponse('Cannot add items to a closed or void order', 400);
    }

    // Get menu item details
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return notFoundResponse('Menu item not found');
    }

    // Calculate item total
    const unitPrice = menuItem.price;
    const totalPrice = unitPrice * quantity;

    // Create order item
    const item = await prisma.dineInOrderItem.create({
      data: {
        orderId,
        menuItemId,
        name: menuItem.name,
        quantity,
        unitPrice,
        totalPrice,
        seatNumber: seatNumber || null,
        courseNumber: courseNumber || 1,
        courseType: courseType || 'MAIN',
        modifiers: modifiers || null,
        specialInstructions: specialInstructions || null,
      },
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

    // Update order totals
    await prisma.dineInOrder.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
        serviceCharge: newServiceCharge,
        total: newTotal,
      },
    });

    return successResponse(item, 'Item added successfully', 201);
  } catch (error) {
    console.error('Error adding order item:', error);
    return errorResponse('Failed to add order item', 500);
  }
}
