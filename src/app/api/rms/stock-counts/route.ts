import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Helper function to generate stock count number
async function generateCountNumber(outletId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // Get count of stock counts for this month and outlet
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0, 23, 59, 59);

  const count = await prisma.stockCount.count({
    where: {
      outletId,
      startedAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `SC-${year}${month}-${nextNumber}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.stockCount.count({ where });

    // Fetch stock counts
    const stockCounts = await prisma.stockCount.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        startedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return successResponse(paginatedResponse(stockCounts, total, page, limit));
  } catch (error) {
    console.error('Stock counts API error:', error);
    return errorResponse('Failed to fetch stock counts', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outletId, type, employeeId, inventoryItemIds, categoryId, notes } = body;

    // Validate required fields
    if (!outletId || !type || !employeeId) {
      return errorResponse('Missing required fields: outletId, type, employeeId', 400);
    }

    // Validate type
    if (!['FULL', 'CYCLE', 'SPOT'].includes(type)) {
      return errorResponse('Invalid count type. Must be FULL, CYCLE, or SPOT', 400);
    }

    // Generate count number
    const countNumber = await generateCountNumber(outletId);

    // Build where clause for inventory items
    const itemWhere: Record<string, unknown> = {
      outletId,
      isActive: true,
    };

    // For SPOT counts, use specific item IDs
    if (type === 'SPOT') {
      if (!inventoryItemIds || inventoryItemIds.length === 0) {
        return errorResponse('SPOT counts require inventoryItemIds', 400);
      }
      itemWhere.id = { in: inventoryItemIds };
    }

    // For CYCLE counts, filter by category if provided
    if (type === 'CYCLE' && categoryId) {
      itemWhere.categoryId = categoryId;
    }

    // Get inventory items to count
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: itemWhere,
      select: {
        id: true,
        currentStock: true,
      },
    });

    if (inventoryItems.length === 0) {
      return errorResponse('No inventory items found matching criteria', 400);
    }

    // Create stock count with items
    const stockCount = await prisma.stockCount.create({
      data: {
        outletId,
        countNumber,
        type,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        startedByEmployeeId: employeeId,
        notes: notes || null,
        items: {
          create: inventoryItems.map(item => ({
            inventoryItemId: item.id,
            systemQty: item.currentStock,
            countedQty: null,
            variance: null,
          })),
        },
      },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        startedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
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
          },
        },
      },
    });

    return successResponse(stockCount, 'Stock count started successfully', 201);
  } catch (error) {
    console.error('Create stock count API error:', error);
    return errorResponse('Failed to create stock count', 500);
  }
}
