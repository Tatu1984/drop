import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/tables/[tableId] - Get a single table
export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;

    const table = await prisma.table.findUnique({
      where: { id: tableId },
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
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            reservations: true,
            dineInOrders: true,
          },
        },
        reservations: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'SEATED'],
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 5,
        },
      },
    });

    if (!table) {
      return notFoundResponse('Table not found');
    }

    return successResponse(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return errorResponse('Failed to fetch table', 500);
  }
}

// PUT /api/rms/tables/[tableId] - Update a table
export async function PUT(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    const body = await request.json();

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!existingTable) {
      return notFoundResponse('Table not found');
    }

    // If table number is being updated, check for conflicts
    if (body.tableNumber && body.tableNumber !== existingTable.tableNumber) {
      const tableExists = await prisma.table.findUnique({
        where: {
          outletId_tableNumber: {
            outletId: existingTable.outletId,
            tableNumber: body.tableNumber,
          },
        },
      });

      if (tableExists) {
        return errorResponse('Table number already exists in this outlet', 400);
      }
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: {
        tableNumber: body.tableNumber,
        floorId: body.floorId,
        zoneId: body.zoneId,
        capacity: body.capacity,
        minCapacity: body.minCapacity,
        shape: body.shape,
        positionX: body.positionX,
        positionY: body.positionY,
        width: body.width,
        height: body.height,
        rotation: body.rotation,
        status: body.status,
        isActive: body.isActive,
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

    return successResponse(table, 'Table updated successfully');
  } catch (error) {
    console.error('Error updating table:', error);
    return errorResponse('Failed to update table', 500);
  }
}

// DELETE /api/rms/tables/[tableId] - Delete a table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;

    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        _count: {
          select: {
            reservations: true,
            dineInOrders: true,
          },
        },
      },
    });

    if (!table) {
      return notFoundResponse('Table not found');
    }

    // Check if table has active data
    if (table._count.reservations > 0 || table._count.dineInOrders > 0) {
      return errorResponse(
        'Cannot delete table with existing reservations or orders. Please deactivate it instead.',
        400
      );
    }

    await prisma.table.delete({
      where: { id: tableId },
    });

    return successResponse({ id: tableId }, 'Table deleted successfully');
  } catch (error) {
    console.error('Error deleting table:', error);
    return errorResponse('Failed to delete table', 500);
  }
}

// PATCH /api/rms/tables/[tableId] - Update table status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'BLOCKED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!existingTable) {
      return notFoundResponse('Table not found');
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { status },
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

    return successResponse(table, 'Table status updated successfully');
  } catch (error) {
    console.error('Error updating table status:', error);
    return errorResponse('Failed to update table status', 500);
  }
}
