import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Helper function to generate PO number
async function generatePONumber(vendorId: string): Promise<string> {
  const year = new Date().getFullYear();

  // Get count of POs for this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const count = await prisma.purchaseOrder.count({
    where: {
      vendorId,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `PO-${year}-${nextNumber}`;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      const orderDateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        orderDateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        orderDateFilter.lte = new Date(endDate);
      }
      where.orderDate = orderDateFilter;
    }

    // Get total count
    const total = await prisma.purchaseOrder.count({ where });

    // Fetch purchase orders
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            code: true,
            contactName: true,
            phone: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            items: true,
            receipts: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(purchaseOrders, total, page, limit));
  } catch (error) {
    console.error('Purchase orders API error:', error);
    return errorResponse('Failed to fetch purchase orders', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
      outletId,
      supplierId,
      expectedDate,
      items,
      taxRate,
      notes,
    } = body;

    // Validate required fields
    if (!vendorId || !outletId || !supplierId || !items || items.length === 0) {
      return errorResponse('Missing required fields: vendorId, outletId, supplierId, items', 400);
    }

    // Generate PO number
    const poNumber = await generatePONumber(vendorId);

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map((item: {
      inventoryItemId: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
    }) => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return {
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || taxRate || 0,
        total: itemTotal,
        receivedQty: 0,
      };
    });

    const taxAmount = subtotal * ((taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        outletId,
        supplierId,
        status: 'DRAFT',
        orderDate: new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        subtotal,
        taxAmount,
        total,
        notes: notes || null,
        items: {
          create: processedItems,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                unitOfMeasure: true,
              },
            },
          },
        },
      },
    });

    return successResponse(purchaseOrder, 'Purchase order created successfully', 201);
  } catch (error) {
    console.error('Create purchase order API error:', error);
    return errorResponse('Failed to create purchase order', 500);
  }
}
