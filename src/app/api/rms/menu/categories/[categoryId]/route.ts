import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/menu/categories/[categoryId] - Get a specific menu category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            recipe: {
              select: {
                id: true,
                name: true,
              },
            },
            modifierGroups: {
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
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        menuSet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      return notFoundResponse('Menu category not found');
    }

    return successResponse(category);
  } catch (error) {
    console.error('Error fetching menu category:', error);
    return serverErrorResponse('Failed to fetch menu category');
  }
}

// PUT /api/rms/menu/categories/[categoryId] - Update a menu category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      image,
      sortOrder,
      isActive,
      parentId,
    } = body;

    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return notFoundResponse('Menu category not found');
    }

    // Verify parent category exists if provided
    if (parentId !== undefined && parentId !== null) {
      const parentCategory = await prisma.menuCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return errorResponse('Parent category not found', 404);
      }

      // Prevent circular reference
      if (parentId === categoryId) {
        return errorResponse('Category cannot be its own parent', 400);
      }

      if (parentCategory.menuSetId !== existingCategory.menuSetId) {
        return errorResponse('Parent category must belong to the same menu set', 400);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (parentId !== undefined) updateData.parentId = parentId;

    const category = await prisma.menuCategory.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        items: true,
        children: true,
      },
    });

    return successResponse(category, 'Menu category updated successfully');
  } catch (error) {
    console.error('Error updating menu category:', error);
    return serverErrorResponse('Failed to update menu category');
  }
}

// DELETE /api/rms/menu/categories/[categoryId] - Delete a menu category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: {
        items: true,
        children: true,
      },
    });

    if (!existingCategory) {
      return notFoundResponse('Menu category not found');
    }

    // Check if category has items or subcategories
    if (existingCategory.items.length > 0) {
      return errorResponse(
        'Cannot delete category with existing menu items. Delete items first or deactivate the category.',
        400
      );
    }

    if (existingCategory.children.length > 0) {
      return errorResponse(
        'Cannot delete category with existing subcategories. Delete subcategories first or deactivate the category.',
        400
      );
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId },
    });

    return successResponse({ id: categoryId }, 'Menu category deleted successfully');
  } catch (error) {
    console.error('Error deleting menu category:', error);
    return serverErrorResponse('Failed to delete menu category');
  }
}
