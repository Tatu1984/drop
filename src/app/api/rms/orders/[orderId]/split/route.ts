import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/orders/[orderId]/split - Get split bills for order
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

    const splitBills = await prisma.splitBill.findMany({
      where: { orderId },
      include: {
        items: true,
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
      },
      orderBy: {
        splitNumber: 'asc',
      },
    });

    return successResponse(splitBills);
  } catch (error) {
    console.error('Error fetching split bills:', error);
    return errorResponse('Failed to fetch split bills', 500);
  }
}

// POST /api/rms/orders/[orderId]/split - Create split bills
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { splitType, splits } = body;

    // Validation
    if (!splitType || !splits || !Array.isArray(splits) || splits.length === 0) {
      return errorResponse('splitType and splits array are required', 400);
    }

    // Check if order exists
    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: {
            isVoid: false,
          },
        },
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

    // Check if order already has split bills
    const existingSplits = await prisma.splitBill.findMany({
      where: { orderId },
    });

    if (existingSplits.length > 0) {
      return errorResponse('Order already has split bills', 400);
    }

    // Process based on split type
    const createdSplits = [];

    if (splitType === 'EQUAL') {
      // Split equally among all splits
      const numberOfSplits = splits.length;
      const subtotalPerSplit = order.subtotal / numberOfSplits;
      const taxPerSplit = order.taxAmount / numberOfSplits;
      const serviceChargePerSplit = order.serviceCharge / numberOfSplits;
      const totalPerSplit = subtotalPerSplit + taxPerSplit + serviceChargePerSplit;

      for (let i = 0; i < numberOfSplits; i++) {
        const split = await prisma.splitBill.create({
          data: {
            orderId,
            splitNumber: i + 1,
            splitType: 'EQUAL',
            subtotal: subtotalPerSplit,
            taxAmount: taxPerSplit,
            serviceCharge: serviceChargePerSplit,
            total: totalPerSplit,
          },
        });
        createdSplits.push(split);
      }
    } else if (splitType === 'BY_SEAT' || splitType === 'BY_ITEM') {
      // Each split contains specific items
      for (let i = 0; i < splits.length; i++) {
        const splitData = splits[i];
        const { itemIds } = splitData;

        if (!itemIds || !Array.isArray(itemIds)) {
          return errorResponse(`Split ${i + 1} must have itemIds array`, 400);
        }

        // Calculate totals for this split
        const splitItems = order.items.filter((item) => itemIds.includes(item.id));
        const splitSubtotal = splitItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const splitTax = splitSubtotal * (order.outlet.taxRate / 100);
        const splitServiceCharge = splitSubtotal * (order.outlet.serviceChargeRate / 100);
        const splitTotal = splitSubtotal + splitTax + splitServiceCharge;

        const split = await prisma.splitBill.create({
          data: {
            orderId,
            splitNumber: i + 1,
            splitType,
            subtotal: splitSubtotal,
            taxAmount: splitTax,
            serviceCharge: splitServiceCharge,
            total: splitTotal,
            items: {
              create: splitItems.map((item) => ({
                orderItemId: item.id,
                quantity: 1,
                amount: item.totalPrice,
              })),
            },
          },
          include: {
            items: true,
          },
        });
        createdSplits.push(split);
      }
    } else if (splitType === 'CUSTOM') {
      // Custom amounts for each split
      for (let i = 0; i < splits.length; i++) {
        const splitData = splits[i];
        const { amount } = splitData;

        if (typeof amount !== 'number' || amount <= 0) {
          return errorResponse(`Split ${i + 1} must have a valid amount`, 400);
        }

        // For custom splits, calculate proportional tax and service charge
        const proportionOfTotal = amount / order.total;
        const splitTax = order.taxAmount * proportionOfTotal;
        const splitServiceCharge = order.serviceCharge * proportionOfTotal;
        const splitSubtotal = amount - splitTax - splitServiceCharge;

        const split = await prisma.splitBill.create({
          data: {
            orderId,
            splitNumber: i + 1,
            splitType: 'CUSTOM',
            subtotal: splitSubtotal,
            taxAmount: splitTax,
            serviceCharge: splitServiceCharge,
            total: amount,
          },
        });
        createdSplits.push(split);
      }
    } else {
      return errorResponse('Invalid splitType. Must be EQUAL, BY_SEAT, BY_ITEM, or CUSTOM', 400);
    }

    return successResponse(createdSplits, 'Split bills created successfully', 201);
  } catch (error) {
    console.error('Error creating split bills:', error);
    return errorResponse('Failed to create split bills', 500);
  }
}
