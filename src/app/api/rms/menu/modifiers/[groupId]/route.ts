import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/menu/modifiers/[groupId] - Get a specific modifier group with all modifiers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const modifierGroup = await prisma.modifierGroup.findUnique({
      where: { id: groupId },
      include: {
        modifiers: {
          orderBy: { sortOrder: 'asc' },
        },
        menuItemLinks: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!modifierGroup) {
      return notFoundResponse('Modifier group not found');
    }

    return successResponse(modifierGroup);
  } catch (error) {
    console.error('Error fetching modifier group:', error);
    return serverErrorResponse('Failed to fetch modifier group');
  }
}

// PUT /api/rms/menu/modifiers/[groupId] - Update a modifier group and its modifiers
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const {
      name,
      minSelections,
      maxSelections,
      isRequired,
      modifiers,
    } = body;

    const existingGroup = await prisma.modifierGroup.findUnique({
      where: { id: groupId },
      include: {
        modifiers: true,
      },
    });

    if (!existingGroup) {
      return notFoundResponse('Modifier group not found');
    }

    // Update group data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (minSelections !== undefined) updateData.minSelections = minSelections;
    if (maxSelections !== undefined) updateData.maxSelections = maxSelections;
    if (isRequired !== undefined) updateData.isRequired = isRequired;

    const modifierGroup = await prisma.modifierGroup.update({
      where: { id: groupId },
      data: updateData,
    });

    // Update modifiers if provided
    if (modifiers !== undefined) {
      // Get existing modifier IDs
      const existingModifierIds = existingGroup.modifiers.map(m => m.id);
      const incomingModifierIds = modifiers
        .filter((m: any) => m.id)
        .map((m: any) => m.id);

      // Delete modifiers that are not in the incoming list
      const modifiersToDelete = existingModifierIds.filter(
        id => !incomingModifierIds.includes(id)
      );

      if (modifiersToDelete.length > 0) {
        await prisma.modifier.deleteMany({
          where: {
            id: { in: modifiersToDelete },
          },
        });
      }

      // Update or create modifiers
      for (const modifier of modifiers) {
        if (modifier.id) {
          // Update existing modifier
          await prisma.modifier.update({
            where: { id: modifier.id },
            data: {
              name: modifier.name,
              price: modifier.price || 0,
              isDefault: modifier.isDefault || false,
              isActive: modifier.isActive !== undefined ? modifier.isActive : true,
              sortOrder: modifier.sortOrder !== undefined ? modifier.sortOrder : 0,
            },
          });
        } else {
          // Create new modifier
          await prisma.modifier.create({
            data: {
              groupId,
              name: modifier.name,
              price: modifier.price || 0,
              isDefault: modifier.isDefault || false,
              isActive: modifier.isActive !== undefined ? modifier.isActive : true,
              sortOrder: modifier.sortOrder !== undefined ? modifier.sortOrder : 0,
            },
          });
        }
      }
    }

    // Fetch the complete group with all modifiers
    const completeGroup = await prisma.modifierGroup.findUnique({
      where: { id: groupId },
      include: {
        modifiers: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return successResponse(completeGroup, 'Modifier group updated successfully');
  } catch (error) {
    console.error('Error updating modifier group:', error);
    return serverErrorResponse('Failed to update modifier group');
  }
}

// DELETE /api/rms/menu/modifiers/[groupId] - Delete a modifier group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const existingGroup = await prisma.modifierGroup.findUnique({
      where: { id: groupId },
      include: {
        menuItemLinks: true,
      },
    });

    if (!existingGroup) {
      return notFoundResponse('Modifier group not found');
    }

    // Check if modifier group is linked to menu items
    if (existingGroup.menuItemLinks.length > 0) {
      return errorResponse(
        'Cannot delete modifier group that is linked to menu items. Remove the links first.',
        400
      );
    }

    // Delete all modifiers first
    await prisma.modifier.deleteMany({
      where: { groupId },
    });

    // Delete the modifier group
    await prisma.modifierGroup.delete({
      where: { id: groupId },
    });

    return successResponse({ id: groupId }, 'Modifier group deleted successfully');
  } catch (error) {
    console.error('Error deleting modifier group:', error);
    return serverErrorResponse('Failed to delete modifier group');
  }
}
