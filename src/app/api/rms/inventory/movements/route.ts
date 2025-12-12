import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const inventoryItemId = searchParams.get('inventoryItemId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const outletId = searchParams.get('outletId');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (inventoryItemId) {
      where.inventoryItemId = inventoryItemId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      const createdAtFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        createdAtFilter.gte = new Date(startDate);
      }
      if (endDate) {
        createdAtFilter.lte = new Date(endDate);
      }
      where.createdAt = createdAtFilter;
    }

    // If filtering by outlet, we need to join through inventoryItem
    if (outletId) {
      where.inventoryItem = {
        outletId: outletId,
      };
    }

    // Get total count
    const total = await prisma.stockMovement.count({ where });

    // Fetch movements
    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        inventoryItem: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitOfMeasure: true,
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        performedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(movements, total, page, limit));
  } catch (error) {
    console.error('Stock movements API error:', error);
    return errorResponse('Failed to fetch stock movements', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const { inventoryItemId, quantity, reason, employeeId, referenceType, referenceId } = body;

    // Validate required fields
    if (!inventoryItemId || quantity === undefined || !reason) {
      return errorResponse('Missing required fields: inventoryItemId, quantity, reason', 400);
    }

    // Check if inventory item exists
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!inventoryItem) {
      return errorResponse('Inventory item not found', 404);
    }

    // Calculate new stock level
    const newStock = inventoryItem.currentStock + quantity;

    if (newStock < 0) {
      return errorResponse('Adjustment would result in negative stock', 400);
    }

    // Update stock and create movement record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { currentStock: newStock },
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          inventoryItemId,
          type: 'ADJUSTMENT',
          quantity,
          referenceType: referenceType || 'MANUAL_ADJUSTMENT',
          referenceId: referenceId || null,
          performedByEmployeeId: employeeId || null,
          notes: reason,
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              sku: true,
              name: true,
              unitOfMeasure: true,
              currentStock: true,
            },
          },
          performedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return { movement, updatedItem };
    });

    return successResponse(
      {
        ...result.movement,
        previousStock: inventoryItem.currentStock,
        newStock,
      },
      'Manual adjustment recorded successfully',
      201
    );
  } catch (error) {
    console.error('Create stock movement API error:', error);
    return errorResponse('Failed to create stock movement', 500);
  }
}
