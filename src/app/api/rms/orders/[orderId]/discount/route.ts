import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// POST /api/rms/orders/[orderId]/discount - Apply discount to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const {
      name,
      type,
      value,
      appliedByEmployeeId,
      requiresApproval,
      approvedByEmployeeId,
      approvalPin,
      reason,
    } = body;

    // Validation
    if (!name || !type || !value || !appliedByEmployeeId) {
      return errorResponse('name, type, value, and appliedByEmployeeId are required', 400);
    }

    if (!['PERCENTAGE', 'FLAT'].includes(type)) {
      return errorResponse('type must be PERCENTAGE or FLAT', 400);
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
      return errorResponse('Cannot apply discount to a closed or void order', 400);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (type === 'PERCENTAGE') {
      discountAmount = order.subtotal * (value / 100);
    } else {
      discountAmount = value;
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > order.subtotal) {
      return errorResponse('Discount amount cannot exceed order subtotal', 400);
    }

    // Create discount record
    const discount = await prisma.appliedDiscount.create({
      data: {
        orderId,
        name,
        type,
        value,
        amount: discountAmount,
        requiresApproval: requiresApproval || false,
        approvedByEmployeeId: approvedByEmployeeId || null,
        approvalPin: approvalPin || null,
        reason: reason || null,
        appliedByEmployeeId,
      },
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
    });

    // Recalculate order totals with new discount
    const allDiscounts = await prisma.appliedDiscount.findMany({
      where: { orderId },
    });

    const totalDiscount = allDiscounts.reduce((sum, d) => sum + d.amount, 0);

    // Calculate new totals
    const newSubtotal = order.subtotal - totalDiscount;
    const newTaxAmount = newSubtotal * (order.outlet.taxRate / 100);
    const newServiceCharge = newSubtotal * (order.outlet.serviceChargeRate / 100);
    const newTotal = newSubtotal + newTaxAmount + newServiceCharge + order.tip;

    // Update order
    await prisma.dineInOrder.update({
      where: { id: orderId },
      data: {
        discount: totalDiscount,
        subtotal: order.subtotal, // Keep original subtotal
        taxAmount: newTaxAmount,
        serviceCharge: newServiceCharge,
        total: newTotal,
      },
    });

    return successResponse(
      {
        discount,
        totalDiscount,
        newTotal,
      },
      'Discount applied successfully',
      201
    );
  } catch (error) {
    console.error('Error applying discount:', error);
    return errorResponse('Failed to apply discount', 500);
  }
}
