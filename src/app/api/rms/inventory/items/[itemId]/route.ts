import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: {
        inventoryCategory: true,
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            performedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        supplierItems: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!item) {
      return notFoundResponse('Inventory item not found');
    }

    // Add low stock alerts
    const itemWithAlerts = {
      ...item,
      isLowStock: item.reorderPoint ? item.currentStock < item.reorderPoint : false,
      needsReorder: item.reorderPoint ? item.currentStock <= item.reorderPoint : false,
    };

    return successResponse(itemWithAlerts);
  } catch (error) {
    console.error('Get inventory item API error:', error);
    return errorResponse('Failed to fetch inventory item', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const body = await request.json();

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return notFoundResponse('Inventory item not found');
    }

    const {
      name,
      description,
      barcode,
      categoryId,
      unitOfMeasure,
      conversionFactor,
      parLevel,
      reorderPoint,
      reorderQuantity,
      safetyStock,
      averageCost,
      lastCost,
      storageLocation,
      storageTemp,
      trackBatch,
      trackExpiry,
      isActive,
    } = body;

    // Update inventory item
    const item = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        unitOfMeasure: unitOfMeasure !== undefined ? unitOfMeasure : undefined,
        conversionFactor: conversionFactor !== undefined ? conversionFactor : undefined,
        parLevel: parLevel !== undefined ? parLevel : undefined,
        reorderPoint: reorderPoint !== undefined ? reorderPoint : undefined,
        reorderQuantity: reorderQuantity !== undefined ? reorderQuantity : undefined,
        safetyStock: safetyStock !== undefined ? safetyStock : undefined,
        averageCost: averageCost !== undefined ? averageCost : undefined,
        lastCost: lastCost !== undefined ? lastCost : undefined,
        storageLocation: storageLocation !== undefined ? storageLocation : undefined,
        storageTemp: storageTemp !== undefined ? storageTemp : undefined,
        trackBatch: trackBatch !== undefined ? trackBatch : undefined,
        trackExpiry: trackExpiry !== undefined ? trackExpiry : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        inventoryCategory: true,
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(item, 'Inventory item updated successfully');
  } catch (error) {
    console.error('Update inventory item API error:', error);
    return errorResponse('Failed to update inventory item', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return notFoundResponse('Inventory item not found');
    }

    // Soft delete by setting isActive to false
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { isActive: false },
    });

    return successResponse(null, 'Inventory item deleted successfully');
  } catch (error) {
    console.error('Delete inventory item API error:', error);
    return errorResponse('Failed to delete inventory item', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const { adjustment, reason, employeeId } = body;

    // Validate required fields
    if (adjustment === undefined || !reason) {
      return errorResponse('Missing required fields: adjustment, reason', 400);
    }

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return notFoundResponse('Inventory item not found');
    }

    // Calculate new stock level
    const newStock = existingItem.currentStock + adjustment;

    if (newStock < 0) {
      return errorResponse('Stock adjustment would result in negative stock', 400);
    }

    // Update stock and create movement record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: itemId },
        data: { currentStock: newStock },
      });

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          inventoryItemId: itemId,
          type: 'ADJUSTMENT',
          quantity: adjustment,
          referenceType: 'MANUAL_ADJUSTMENT',
          performedByEmployeeId: employeeId || null,
          notes: reason,
        },
      });

      return updatedItem;
    });

    return successResponse(
      {
        ...result,
        previousStock: existingItem.currentStock,
        adjustment,
        newStock,
      },
      'Stock adjusted successfully'
    );
  } catch (error) {
    console.error('Stock adjustment API error:', error);
    return errorResponse('Failed to adjust stock', 500);
  }
}
