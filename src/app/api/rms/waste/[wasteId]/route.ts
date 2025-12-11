import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/waste/[wasteId] - Get waste log details
export async function GET(
  request: NextRequest,
  { params }: { params: { wasteId: string } }
) {
  try {
    const { wasteId } = params;

    if (!wasteId) {
      return errorResponse('Waste ID is required', 400);
    }

    const wasteLog = await prisma.wasteLog.findUnique({
      where: {
        id: wasteId,
      },
      include: {
        items: true,
        loggedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            role: true,
          },
        },
      },
    });

    if (!wasteLog) {
      return notFoundResponse('Waste log not found');
    }

    return successResponse({
      id: wasteLog.id,
      vendorId: wasteLog.vendorId,
      outletId: wasteLog.outletId,
      date: wasteLog.date,
      totalValue: wasteLog.totalValue,
      notes: wasteLog.notes,
      loggedBy: wasteLog.loggedBy
        ? {
            id: wasteLog.loggedBy.id,
            name: `${wasteLog.loggedBy.firstName} ${wasteLog.loggedBy.lastName}`,
            employeeCode: wasteLog.loggedBy.employeeCode,
            role: wasteLog.loggedBy.role,
          }
        : null,
      items: wasteLog.items.map((item) => ({
        id: item.id,
        inventoryItemId: item.inventoryItemId,
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        reason: item.reason,
        value: item.value,
        notes: item.notes,
      })),
      itemsCount: wasteLog.items.length,
    });
  } catch (error) {
    console.error('Error fetching waste log details:', error);
    return serverErrorResponse('Failed to fetch waste log details');
  }
}
