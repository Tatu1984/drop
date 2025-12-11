import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/menu/sets/[menuSetId] - Get a specific menu set
export async function GET(
  request: NextRequest,
  { params }: { params: { menuSetId: string } }
) {
  try {
    const { menuSetId } = params;

    const menuSet = await prisma.menuSet.findUnique({
      where: { id: menuSetId },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        outletAssignments: {
          include: {
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!menuSet) {
      return notFoundResponse('Menu set not found');
    }

    return successResponse(menuSet);
  } catch (error) {
    console.error('Error fetching menu set:', error);
    return serverErrorResponse('Failed to fetch menu set');
  }
}

// PUT /api/rms/menu/sets/[menuSetId] - Update a menu set
export async function PUT(
  request: NextRequest,
  { params }: { params: { menuSetId: string } }
) {
  try {
    const { menuSetId } = params;
    const body = await request.json();
    const {
      name,
      description,
      isActive,
      startTime,
      endTime,
      daysOfWeek,
      validFrom,
      validTo,
    } = body;

    const existingMenuSet = await prisma.menuSet.findUnique({
      where: { id: menuSetId },
    });

    if (!existingMenuSet) {
      return notFoundResponse('Menu set not found');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
    if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;

    const menuSet = await prisma.menuSet.update({
      where: { id: menuSetId },
      data: updateData,
      include: {
        categories: true,
      },
    });

    return successResponse(menuSet, 'Menu set updated successfully');
  } catch (error) {
    console.error('Error updating menu set:', error);
    return serverErrorResponse('Failed to update menu set');
  }
}

// DELETE /api/rms/menu/sets/[menuSetId] - Delete a menu set
export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuSetId: string } }
) {
  try {
    const { menuSetId } = params;

    const existingMenuSet = await prisma.menuSet.findUnique({
      where: { id: menuSetId },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!existingMenuSet) {
      return notFoundResponse('Menu set not found');
    }

    // Check if menu set has categories
    if (existingMenuSet.categories.length > 0) {
      return errorResponse(
        'Cannot delete menu set with existing categories. Delete categories first or deactivate the menu set.',
        400
      );
    }

    await prisma.menuSet.delete({
      where: { id: menuSetId },
    });

    return successResponse({ id: menuSetId }, 'Menu set deleted successfully');
  } catch (error) {
    console.error('Error deleting menu set:', error);
    return serverErrorResponse('Failed to delete menu set');
  }
}
