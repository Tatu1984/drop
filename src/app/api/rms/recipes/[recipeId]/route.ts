import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/recipes/[recipeId] - Get a specific recipe with all ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = params;

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                unitOfMeasure: true,
                currentStock: true,
                averageCost: true,
                lastCost: true,
              },
            },
          },
        },
        subRecipes: {
          include: {
            subRecipe: {
              include: {
                ingredients: {
                  include: {
                    inventoryItem: {
                      select: {
                        id: true,
                        name: true,
                        unitOfMeasure: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
            isAvailable: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!recipe) {
      return notFoundResponse('Recipe not found');
    }

    return successResponse(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return serverErrorResponse('Failed to fetch recipe');
  }
}

// PUT /api/rms/recipes/[recipeId] - Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = params;
    const body = await request.json();
    const {
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
      ingredients,
      subRecipes,
    } = body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: true,
        subRecipes: true,
      },
    });

    if (!existingRecipe) {
      return notFoundResponse('Recipe not found');
    }

    // Update basic recipe data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (yieldQuantity !== undefined) updateData.yieldQuantity = yieldQuantity;
    if (yieldUnit !== undefined) updateData.yieldUnit = yieldUnit;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (cookTime !== undefined) updateData.cookTime = cookTime;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (calories !== undefined) updateData.calories = calories;
    if (protein !== undefined) updateData.protein = protein;
    if (carbs !== undefined) updateData.carbs = carbs;
    if (fat !== undefined) updateData.fat = fat;

    // Update ingredients if provided
    if (ingredients !== undefined) {
      // Validate ingredients
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

      // Delete existing ingredients
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // Create new ingredients
      await prisma.recipeIngredient.createMany({
        data: ingredients.map((ingredient: any) => ({
          recipeId,
          inventoryItemId: ingredient.inventoryItemId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          wastagePercent: ingredient.wastagePercent || 0,
        })),
      });

      // Recalculate total cost
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

      const finalYieldQuantity = yieldQuantity !== undefined ? yieldQuantity : existingRecipe.yieldQuantity;
      const costPerServing = finalYieldQuantity > 0 ? totalCost / finalYieldQuantity : totalCost;

      updateData.totalCost = totalCost;
      updateData.costPerServing = costPerServing;
    }

    // Update sub-recipes if provided
    if (subRecipes !== undefined) {
      // Validate sub-recipes
      for (const subRecipe of subRecipes) {
        if (!subRecipe.subRecipeId || !subRecipe.quantity) {
          return errorResponse(
            'Each sub-recipe must have subRecipeId and quantity',
            400
          );
        }

        // Verify sub-recipe exists
        const existingSubRecipe = await prisma.recipe.findUnique({
          where: { id: subRecipe.subRecipeId },
        });

        if (!existingSubRecipe) {
          return errorResponse(
            `Sub-recipe ${subRecipe.subRecipeId} not found`,
            404
          );
        }

        // Prevent circular reference
        if (subRecipe.subRecipeId === recipeId) {
          return errorResponse('Recipe cannot reference itself as a sub-recipe', 400);
        }
      }

      // Delete existing sub-recipes
      await prisma.recipeSubRecipe.deleteMany({
        where: { parentRecipeId: recipeId },
      });

      // Create new sub-recipes
      if (subRecipes.length > 0) {
        await prisma.recipeSubRecipe.createMany({
          data: subRecipes.map((subRecipe: any) => ({
            parentRecipeId: recipeId,
            subRecipeId: subRecipe.subRecipeId,
            quantity: subRecipe.quantity,
          })),
        });
      }
    }

    // Update the recipe
    const recipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: updateData,
    });

    // Fetch the complete recipe with all relations
    const completeRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
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

    return successResponse(completeRecipe, 'Recipe updated successfully');
  } catch (error) {
    console.error('Error updating recipe:', error);
    return serverErrorResponse('Failed to update recipe');
  }
}

// DELETE /api/rms/recipes/[recipeId] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = params;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        menuItems: true,
        usedInRecipes: true,
      },
    });

    if (!existingRecipe) {
      return notFoundResponse('Recipe not found');
    }

    // Check if recipe is used in menu items
    if (existingRecipe.menuItems.length > 0) {
      return errorResponse(
        'Cannot delete recipe that is linked to menu items. Remove the links first.',
        400
      );
    }

    // Check if recipe is used as a sub-recipe
    if (existingRecipe.usedInRecipes.length > 0) {
      return errorResponse(
        'Cannot delete recipe that is used as a sub-recipe in other recipes. Remove the references first.',
        400
      );
    }

    // Delete ingredients first
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId },
    });

    // Delete sub-recipes
    await prisma.recipeSubRecipe.deleteMany({
      where: { parentRecipeId: recipeId },
    });

    // Delete the recipe
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return successResponse({ id: recipeId }, 'Recipe deleted successfully');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return serverErrorResponse('Failed to delete recipe');
  }
}
