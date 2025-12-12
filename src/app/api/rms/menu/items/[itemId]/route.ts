import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/menu/items/[itemId] - Get a specific menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: {
          include: {
            menuSet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        recipe: {
          include: {
            ingredients: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    name: true,
                    unitOfMeasure: true,
                    currentStock: true,
                  },
                },
              },
            },
          },
        },
        modifierGroups: {
          orderBy: { sortOrder: 'asc' },
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return notFoundResponse('Menu item not found');
    }

    return successResponse(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return serverErrorResponse('Failed to fetch menu item');
  }
}

// PUT /api/rms/menu/items/[itemId] - Update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const {
      categoryId,
      sku,
      name,
      description,
      shortName,
      image,
      price,
      cost,
      recipeId,
      isVeg,
      isVegan,
      isGlutenFree,
      spiceLevel,
      calories,
      prepTime,
      allergens,
      tags,
      isActive,
      isAvailable,
      sortOrder,
      modifierGroupIds,
    } = body;

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return notFoundResponse('Menu item not found');
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return errorResponse('Menu category not found', 404);
      }
    }

    // Verify recipe exists if provided
    if (recipeId !== undefined && recipeId !== null) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });

      if (!recipe) {
        return errorResponse('Recipe not found', 404);
      }
    }

    const updateData: any = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (sku !== undefined) updateData.sku = sku;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (shortName !== undefined) updateData.shortName = shortName;
    if (image !== undefined) updateData.image = image;
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost;
    if (recipeId !== undefined) updateData.recipeId = recipeId;
    if (isVeg !== undefined) updateData.isVeg = isVeg;
    if (isVegan !== undefined) updateData.isVegan = isVegan;
    if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
    if (spiceLevel !== undefined) updateData.spiceLevel = spiceLevel;
    if (calories !== undefined) updateData.calories = calories;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (tags !== undefined) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const menuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
    });

    // Update modifier groups if provided
    if (modifierGroupIds !== undefined) {
      // Delete existing links
      await prisma.menuItemModifierGroup.deleteMany({
        where: { menuItemId: itemId },
      });

      // Create new links
      if (modifierGroupIds.length > 0) {
        await prisma.menuItemModifierGroup.createMany({
          data: modifierGroupIds.map((groupId: string, index: number) => ({
            menuItemId: itemId,
            modifierGroupId: groupId,
            sortOrder: index,
          })),
        });
      }
    }

    // Fetch the complete item with all relations
    const completeItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        recipe: true,
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(completeItem, 'Menu item updated successfully');
  } catch (error) {
    console.error('Error updating menu item:', error);
    return serverErrorResponse('Failed to update menu item');
  }
}

// DELETE /api/rms/menu/items/[itemId] - Delete a menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        orderItems: true,
      },
    });

    if (!existingItem) {
      return notFoundResponse('Menu item not found');
    }

    // Check if item has been used in orders
    if (existingItem.orderItems.length > 0) {
      return errorResponse(
        'Cannot delete menu item that has been used in orders. Consider deactivating it instead.',
        400
      );
    }

    // Delete modifier group links first
    await prisma.menuItemModifierGroup.deleteMany({
      where: { menuItemId: itemId },
    });

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return successResponse({ id: itemId }, 'Menu item deleted successfully');
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return serverErrorResponse('Failed to delete menu item');
  }
}

// PATCH /api/rms/menu/items/[itemId] - Patch menu item availability (86 item)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { isAvailable } = body;

    if (isAvailable === undefined) {
      return errorResponse('isAvailable is required', 400);
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return notFoundResponse('Menu item not found');
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const message = isAvailable
      ? 'Menu item marked as available'
      : 'Menu item marked as unavailable (86\'d)';

    return successResponse(menuItem, message);
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    return serverErrorResponse('Failed to update menu item availability');
  }
}
