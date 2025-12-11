import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/floors/[floorId] - Get a single floor
export async function GET(
  request: NextRequest,
  { params }: { params: { floorId: string } }
) {
  try {
    const { floorId } = params;

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            tables: true,
            zones: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
            color: true,
            _count: {
              select: {
                tables: true,
              },
            },
          },
        },
        tables: {
          include: {
            zone: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy: { tableNumber: 'asc' },
        },
      },
    });

    if (!floor) {
      return notFoundResponse('Floor not found');
    }

    return successResponse(floor);
  } catch (error) {
    console.error('Error fetching floor:', error);
    return errorResponse('Failed to fetch floor', 500);
  }
}

// PUT /api/rms/floors/[floorId] - Update a floor
export async function PUT(
  request: NextRequest,
  { params }: { params: { floorId: string } }
) {
  try {
    const { floorId } = params;
    const body = await request.json();

    // Check if floor exists
    const existingFloor = await prisma.floor.findUnique({
      where: { id: floorId },
    });

    if (!existingFloor) {
      return notFoundResponse('Floor not found');
    }

    const floor = await prisma.floor.update({
      where: { id: floorId },
      data: {
        name: body.name,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
      include: {
        _count: {
          select: {
            tables: true,
            zones: true,
          },
        },
      },
    });

    return successResponse(floor, 'Floor updated successfully');
  } catch (error) {
    console.error('Error updating floor:', error);
    return errorResponse('Failed to update floor', 500);
  }
}

// DELETE /api/rms/floors/[floorId] - Delete a floor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { floorId: string } }
) {
  try {
    const { floorId } = params;

    // Check if floor exists
    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: {
        _count: {
          select: {
            tables: true,
          },
        },
      },
    });

    if (!floor) {
      return notFoundResponse('Floor not found');
    }

    // Check if floor has tables
    if (floor._count.tables > 0) {
      return errorResponse(
        'Cannot delete floor with existing tables. Please delete or move the tables first.',
        400
      );
    }

    await prisma.floor.delete({
      where: { id: floorId },
    });

    return successResponse({ id: floorId }, 'Floor deleted successfully');
  } catch (error) {
    console.error('Error deleting floor:', error);
    return errorResponse('Failed to delete floor', 500);
  }
}
