import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';
import { requireRMSAuth } from '@/lib/rms-auth';

// GET /api/rms/menu/items - Get all menu items
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search');

    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              menuSet: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          recipe: {
            select: {
              id: true,
              name: true,
              totalCost: true,
              costPerServing: true,
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
      }),
      prisma.menuItem.count({ where }),
    ]);

    return successResponse(paginatedResponse(items, total, page, limit));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return serverErrorResponse('Failed to fetch menu items');
  }
}

// POST /api/rms/menu/items - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

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
      isVeg = true,
      isVegan = false,
      isGlutenFree = false,
      spiceLevel,
      calories,
      prepTime,
      allergens = [],
      tags = [],
      isActive = true,
      isAvailable = true,
      sortOrder = 0,
      modifierGroupIds = [],
    } = body;

    if (!categoryId || !name || price === undefined) {
      return errorResponse('categoryId, name, and price are required', 400);
    }

    // Verify category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return errorResponse('Menu category not found', 404);
    }

    // Verify recipe exists if provided
    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });

      if (!recipe) {
        return errorResponse('Recipe not found', 404);
      }
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
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
      },
      include: {
        category: true,
        recipe: true,
      },
    });

    // Link modifier groups if provided
    if (modifierGroupIds.length > 0) {
      await prisma.menuItemModifierGroup.createMany({
        data: modifierGroupIds.map((groupId: string, index: number) => ({
          menuItemId: menuItem.id,
          modifierGroupId: groupId,
          sortOrder: index,
        })),
      });
    }

    // Fetch the complete item with all relations
    const completeItem = await prisma.menuItem.findUnique({
      where: { id: menuItem.id },
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

    return successResponse(completeItem, 'Menu item created successfully', 201);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return serverErrorResponse('Failed to create menu item');
  }
}
