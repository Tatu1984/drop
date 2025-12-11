import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { shiftId: string } }
) {
  try {
    const { shiftId } = params;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        terminal: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cashDrops: {
          orderBy: { droppedAt: 'desc' },
          select: {
            id: true,
            amount: true,
            reason: true,
            droppedAt: true,
          },
        },
      },
    });

    if (!shift) {
      return notFoundResponse('Shift not found');
    }

    // Calculate cash breakdown
    const totalCashDrops = shift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0);
    const expectedCashInDrawer = shift.openingFloat + shift.cashSales - totalCashDrops;

    const breakdown = {
      openingFloat: shift.openingFloat,
      cashSales: shift.cashSales,
      totalCashDrops,
      expectedCashInDrawer,
      actualCash: shift.actualCash,
      variance: shift.variance,
      cardSales: shift.cardSales,
      otherSales: shift.otherSales,
      totalSales: shift.totalSales,
      totalTax: shift.totalTax,
      totalDiscount: shift.totalDiscount,
      totalTips: shift.totalTips,
    };

    return successResponse({
      ...shift,
      breakdown,
    });
  } catch (error) {
    console.error('Shift GET error:', error);
    return errorResponse('Failed to fetch shift', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shiftId: string } }
) {
  try {
    const { shiftId } = params;
    const body = await request.json();
    const {
      actualCash,
      closingFloat,
      notes,
    } = body;

    // Check if shift exists
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        cashDrops: true,
      },
    });

    if (!shift) {
      return notFoundResponse('Shift not found');
    }

    if (shift.status === 'CLOSED' || shift.status === 'RECONCILED') {
      return errorResponse('Shift is already closed');
    }

    // Calculate totals
    const totalCashDrops = shift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0);
    const expectedCash = shift.openingFloat + shift.cashSales - totalCashDrops;
    const variance = actualCash - expectedCash;

    // Update shift
    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        endTime: new Date(),
        closingFloat: closingFloat || shift.openingFloat,
        actualCash,
        expectedCash,
        variance,
        status: 'CLOSED',
        notes: notes || shift.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        terminal: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cashDrops: {
          orderBy: { droppedAt: 'desc' },
          select: {
            id: true,
            amount: true,
            reason: true,
            droppedAt: true,
          },
        },
      },
    });

    // Calculate cash breakdown for response
    const breakdown = {
      openingFloat: updatedShift.openingFloat,
      cashSales: updatedShift.cashSales,
      totalCashDrops,
      expectedCashInDrawer: closingFloat || shift.openingFloat,
      actualCash: updatedShift.actualCash,
      variance: updatedShift.variance,
      cardSales: updatedShift.cardSales,
      otherSales: updatedShift.otherSales,
      totalSales: updatedShift.totalSales,
      totalTax: updatedShift.totalTax,
      totalDiscount: updatedShift.totalDiscount,
      totalTips: updatedShift.totalTips,
    };

    return successResponse(
      {
        ...updatedShift,
        breakdown,
      },
      'Shift closed successfully'
    );
  } catch (error) {
    console.error('Shift PATCH error:', error);
    return errorResponse('Failed to close shift', 500);
  }
}
