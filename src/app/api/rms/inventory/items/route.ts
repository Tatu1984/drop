import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const categoryId = searchParams.get('categoryId');
    const lowStock = searchParams.get('lowStock');
    const search = searchParams.get('search');
    const vendorId = searchParams.get('vendorId');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.inventoryItem.count({ where });

    // Fetch items
    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
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

    // Filter for low stock if requested
    let filteredItems = items;
    if (lowStock === 'true') {
      filteredItems = items.filter(item => {
        if (item.reorderPoint && item.currentStock < item.reorderPoint) {
          return true;
        }
        return false;
      });
    }

    // Add low stock alerts to items
    const itemsWithAlerts = filteredItems.map(item => ({
      ...item,
      isLowStock: item.reorderPoint ? item.currentStock < item.reorderPoint : false,
      needsReorder: item.reorderPoint ? item.currentStock <= item.reorderPoint : false,
    }));

    return successResponse(
      paginatedResponse(itemsWithAlerts, lowStock === 'true' ? filteredItems.length : total, page, limit)
    );
  } catch (error) {
    console.error('Inventory items API error:', error);
    return errorResponse('Failed to fetch inventory items', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      outletId,
      sku,
      name,
      description,
      barcode,
      categoryId,
      unitOfMeasure,
      conversionFactor,
      currentStock,
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
    } = body;

    // Validate required fields
    if (!vendorId || !sku || !name || !unitOfMeasure) {
      return errorResponse('Missing required fields: vendorId, sku, name, unitOfMeasure', 400);
    }

    // Check for duplicate SKU
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        vendorId_sku: {
          vendorId,
          sku,
        },
      },
    });

    if (existingItem) {
      return errorResponse('An item with this SKU already exists', 400);
    }

    // Create inventory item
    const item = await prisma.inventoryItem.create({
      data: {
        vendorId,
        outletId: outletId || null,
        sku,
        name,
        description: description || null,
        barcode: barcode || null,
        categoryId: categoryId || null,
        unitOfMeasure,
        conversionFactor: conversionFactor || 1,
        currentStock: currentStock || 0,
        parLevel: parLevel || null,
        reorderPoint: reorderPoint || null,
        reorderQuantity: reorderQuantity || null,
        safetyStock: safetyStock || null,
        averageCost: averageCost || 0,
        lastCost: lastCost || null,
        storageLocation: storageLocation || null,
        storageTemp: storageTemp || null,
        trackBatch: trackBatch || false,
        trackExpiry: trackExpiry || false,
        isActive: true,
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

    return successResponse(item, 'Inventory item created successfully', 201);
  } catch (error) {
    console.error('Create inventory item API error:', error);
    return errorResponse('Failed to create inventory item', 500);
  }
}
