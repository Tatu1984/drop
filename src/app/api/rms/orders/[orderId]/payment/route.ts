import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// POST /api/rms/orders/[orderId]/payment - Process payment for order
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const {
      splitBillId,
      method,
      amount,
      tipAmount,
      processedByEmployeeId,
      cardLastFour,
      cardType,
      transactionId,
      authCode,
    } = body;

    // Validation
    if (!method || !amount || !processedByEmployeeId) {
      return errorResponse('method, amount, and processedByEmployeeId are required', 400);
    }

    // Check if order exists
    const order = await prisma.dineInOrder.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return notFoundResponse('Order not found');
    }

    // If splitBillId is provided, validate it
    if (splitBillId) {
      const splitBill = await prisma.splitBill.findUnique({
        where: { id: splitBillId },
      });

      if (!splitBill || splitBill.orderId !== orderId) {
        return notFoundResponse('Split bill not found');
      }

      if (splitBill.isPaid) {
        return errorResponse('Split bill is already paid', 400);
      }
    }

    // Create payment record
    const payment = await prisma.dineInPayment.create({
      data: {
        orderId,
        splitBillId: splitBillId || null,
        method,
        amount,
        tipAmount: tipAmount || 0,
        processedByEmployeeId,
        cardLastFour: cardLastFour || null,
        cardType: cardType || null,
        transactionId: transactionId || null,
        authCode: authCode || null,
        status: 'COMPLETED',
      },
      include: {
        processedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If payment is for a split bill, mark it as paid
    if (splitBillId) {
      await prisma.splitBill.update({
        where: { id: splitBillId },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });
    }

    // Calculate total payments for the order
    const allPayments = await prisma.dineInPayment.findMany({
      where: {
        orderId,
        status: 'COMPLETED',
      },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTips = allPayments.reduce((sum, p) => sum + p.tipAmount, 0);

    // Update order payment status and tip
    const updateData: any = {
      tip: totalTips,
    };

    // Recalculate total with tip
    const newTotal = order.subtotal + order.taxAmount + order.serviceCharge + totalTips - order.discount;
    updateData.total = newTotal;

    if (totalPaid >= newTotal) {
      updateData.paymentStatus = 'COMPLETED';
      updateData.status = 'PAID';
    } else if (totalPaid > 0) {
      updateData.paymentStatus = 'PENDING';
      updateData.status = 'PARTIALLY_PAID';
    }

    await prisma.dineInOrder.update({
      where: { id: orderId },
      data: updateData,
    });

    return successResponse(
      {
        payment,
        totalPaid,
        totalTips,
        remainingAmount: Math.max(0, newTotal - totalPaid),
      },
      'Payment processed successfully',
      201
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return errorResponse('Failed to process payment', 500);
  }
}
