import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';
import { requireRMSAuth } from '@/lib/rms-auth';

// GET /api/rms/tables - Get all tables for an outlet
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');
    const floorId = searchParams.get('floorId');
    const status = searchParams.get('status');
    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!outletId) {
      return errorResponse('outletId query parameter is required', 400);
    }

    const where: any = { outletId };

    if (floorId) {
      where.floorId = floorId;
    }

    if (status) {
      where.status = status;
    }

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where,
        skip,
        take: limit,
        include: {
          floor: {
            select: {
              id: true,
              name: true,
            },
          },
          zone: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              reservations: true,
              dineInOrders: true,
            },
          },
        },
        orderBy: [
          { floorId: 'asc' },
          { tableNumber: 'asc' },
        ],
      }),
      prisma.table.count({ where }),
    ]);

    const response = paginatedResponse(tables, total, page, limit);
    return successResponse(response);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return errorResponse('Failed to fetch tables', 500);
  }
}

// POST /api/rms/tables - Create a new table
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      outletId,
      floorId,
      zoneId,
      tableNumber,
      capacity = 4,
      minCapacity = 1,
      shape = 'RECTANGLE',
      positionX = 0,
      positionY = 0,
      width = 100,
      height = 100,
      rotation = 0,
      status = 'AVAILABLE',
      isActive = true,
    } = body;

    // Validation
    if (!outletId || !tableNumber) {
      return errorResponse('Missing required fields: outletId, tableNumber', 400);
    }

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      return errorResponse('Outlet not found', 404);
    }

    // Check if table number already exists in this outlet
    const existingTable = await prisma.table.findUnique({
      where: {
        outletId_tableNumber: {
          outletId,
          tableNumber,
        },
      },
    });

    if (existingTable) {
      return errorResponse('Table number already exists in this outlet', 400);
    }

    // If floorId is provided, verify it exists and belongs to this outlet
    if (floorId) {
      const floor = await prisma.floor.findFirst({
        where: {
          id: floorId,
          outletId,
        },
      });

      if (!floor) {
        return errorResponse('Floor not found or does not belong to this outlet', 404);
      }
    }

    const table = await prisma.table.create({
      data: {
        outletId,
        floorId,
        zoneId,
        tableNumber,
        capacity,
        minCapacity,
        shape,
        positionX,
        positionY,
        width,
        height,
        rotation,
        status,
        isActive,
      },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return successResponse(table, 'Table created successfully', 201);
  } catch (error) {
    console.error('Error creating table:', error);
    return errorResponse('Failed to create table', 500);
  }
}
