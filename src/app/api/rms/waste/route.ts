import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/waste - Get waste logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    // Calculate date range
    const dateTo = endDate ? new Date(endDate) : new Date();
    const dateFrom = startDate ? new Date(startDate) : new Date();

    if (!startDate) {
      dateFrom.setDate(dateTo.getDate() - 30); // Default to last 30 days
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    const skip = (page - 1) * limit;

    // Get waste logs
    const [wasteLogs, totalCount] = await Promise.all([
      prisma.wasteLog.findMany({
        where: {
          outletId,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          items: true,
          loggedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.wasteLog.count({
        where: {
          outletId,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const totalWasteValue = wasteLogs.reduce((sum, log) => sum + log.totalValue, 0);

    return successResponse({
      wasteLogs: wasteLogs.map((log) => ({
        id: log.id,
        date: log.date,
        totalValue: log.totalValue,
        itemsCount: log.items.length,
        notes: log.notes,
        loggedBy: log.loggedBy
          ? `${log.loggedBy.firstName} ${log.loggedBy.lastName}`
          : 'Unknown',
        items: log.items,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
      summary: {
        totalWasteValue,
        totalLogs: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching waste logs:', error);
    return serverErrorResponse('Failed to fetch waste logs');
  }
}

// POST /api/rms/waste - Log waste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outletId, vendorId, loggedByEmployeeId, items, notes, date } = body;

    if (!outletId || !vendorId || !loggedByEmployeeId || !items || items.length === 0) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate items
    for (const item of items) {
      if (!item.itemName || !item.quantity || !item.unit || !item.reason || !item.value) {
        return errorResponse('Each item must have itemName, quantity, unit, reason, and value', 400);
      }
    }

    // Calculate total value
    const totalValue = items.reduce((sum: number, item: any) => sum + item.value, 0);

    // Create waste log with items
    const wasteLog = await prisma.wasteLog.create({
      data: {
        vendorId,
        outletId,
        loggedByEmployeeId,
        totalValue,
        notes,
        date: date ? new Date(date) : new Date(),
        items: {
          create: items.map((item: any) => ({
            inventoryItemId: item.inventoryItemId,
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            reason: item.reason,
            value: item.value,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        loggedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If inventory item ID is provided, update stock
    for (const item of items) {
      if (item.inventoryItemId) {
        // Create stock movement for waste
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            type: 'WASTE',
            quantity: -item.quantity, // Negative for waste
            referenceType: 'WASTE',
            referenceId: wasteLog.id,
            unitCost: item.value / item.quantity,
            totalCost: item.value,
            performedByEmployeeId: loggedByEmployeeId,
            notes: `Waste: ${item.reason}`,
          },
        });

        // Update inventory item stock
        await prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    return successResponse(
      {
        wasteLog: {
          id: wasteLog.id,
          date: wasteLog.date,
          totalValue: wasteLog.totalValue,
          itemsCount: wasteLog.items.length,
          notes: wasteLog.notes,
          loggedBy: wasteLog.loggedBy
            ? `${wasteLog.loggedBy.firstName} ${wasteLog.loggedBy.lastName}`
            : 'Unknown',
          items: wasteLog.items,
        },
      },
      'Waste logged successfully',
      201
    );
  } catch (error) {
    console.error('Error logging waste:', error);
    return serverErrorResponse('Failed to log waste');
  }
}
