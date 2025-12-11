import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/recipes - Get all recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('vendorId is required', 400);
    }

    const where: any = {
      vendorId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
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
          menuItems: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          subRecipes: {
            include: {
              subRecipe: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return successResponse(paginatedResponse(recipes, total, page, limit));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return serverErrorResponse('Failed to fetch recipes');
  }
}

// POST /api/rms/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      name,
      description,
      yieldQuantity = 1,
      yieldUnit = 'portion',
      prepTime,
      cookTime,
      instructions,
      calories,
      protein,
      carbs,
      fat,
      ingredients = [],
      subRecipes = [],
    } = body;

    if (!vendorId || !name) {
      return errorResponse('vendorId and name are required', 400);
    }

    // Validate ingredients
    if (ingredients.length > 0) {
      for (const ingredient of ingredients) {
        if (!ingredient.inventoryItemId || !ingredient.quantity || !ingredient.unit) {
          return errorResponse(
            'Each ingredient must have inventoryItemId, quantity, and unit',
            400
          );
        }

        // Verify inventory item exists
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: ingredient.inventoryItemId },
        });

        if (!inventoryItem) {
          return errorResponse(
            `Inventory item ${ingredient.inventoryItemId} not found`,
            404
          );
        }
      }
    }

    // Validate sub-recipes
    if (subRecipes.length > 0) {
      for (const subRecipe of subRecipes) {
        if (!subRecipe.subRecipeId || !subRecipe.quantity) {
          return errorResponse(
            'Each sub-recipe must have subRecipeId and quantity',
            400
          );
        }

        // Verify sub-recipe exists
        const existingRecipe = await prisma.recipe.findUnique({
          where: { id: subRecipe.subRecipeId },
        });

        if (!existingRecipe) {
          return errorResponse(
            `Sub-recipe ${subRecipe.subRecipeId} not found`,
            404
          );
        }
      }
    }

    // Calculate total cost from ingredients
    let totalCost = 0;
    for (const ingredient of ingredients) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: ingredient.inventoryItemId },
      });

      if (inventoryItem && inventoryItem.averageCost) {
        const ingredientCost = inventoryItem.averageCost * ingredient.quantity;
        const wastage = (ingredient.wastagePercent || 0) / 100;
        totalCost += ingredientCost * (1 + wastage);
      }
    }

    const costPerServing = yieldQuantity > 0 ? totalCost / yieldQuantity : totalCost;

    // Create recipe with ingredients and sub-recipes
    const recipe = await prisma.recipe.create({
      data: {
        vendorId,
        name,
        description,
        yieldQuantity,
        yieldUnit,
        prepTime,
        cookTime,
        instructions,
        calories,
        protein,
        carbs,
        fat,
        totalCost,
        costPerServing,
        ingredients: {
          create: ingredients.map((ingredient: any) => ({
            inventoryItemId: ingredient.inventoryItemId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            wastagePercent: ingredient.wastagePercent || 0,
          })),
        },
        subRecipes: {
          create: subRecipes.map((subRecipe: any) => ({
            subRecipeId: subRecipe.subRecipeId,
            quantity: subRecipe.quantity,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                name: true,
                unitOfMeasure: true,
                averageCost: true,
              },
            },
          },
        },
        subRecipes: {
          include: {
            subRecipe: {
              select: {
                id: true,
                name: true,
                costPerServing: true,
              },
            },
          },
        },
      },
    });

    return successResponse(recipe, 'Recipe created successfully', 201);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return serverErrorResponse('Failed to create recipe');
  }
}
