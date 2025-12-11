import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// Helper function to generate GRN number
async function generateGRNNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

  // Get count of GRNs for this month
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0, 23, 59, 59);

  const count = await prisma.goodsReceipt.count({
    where: {
      receivedDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `GRN-${year}${month}-${nextNumber}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params;
    const body = await request.json();
    const { receivedByEmployeeId, items, notes } = body;

    // Validate required fields
    if (!receivedByEmployeeId || !items || items.length === 0) {
      return errorResponse('Missing required fields: receivedByEmployeeId, items', 400);
    }

    // Check if PO exists
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return notFoundResponse('Purchase order not found');
    }

    // PO must be in SENT or PARTIALLY_RECEIVED status
    if (!['SENT', 'PARTIALLY_RECEIVED'].includes(purchaseOrder.status)) {
      return errorResponse('Purchase order must be SENT or PARTIALLY_RECEIVED to receive items', 400);
    }

    // Generate GRN number
    const grnNumber = await generateGRNNumber();

    // Process received items
    const receiptItems = items.map((item: {
      purchaseOrderItemId: string;
      quantityReceived: number;
      batchNumber?: string;
      expiryDate?: string;
    }) => {
      const poItem = purchaseOrder.items.find(pi => pi.id === item.purchaseOrderItemId);
      if (!poItem) {
        throw new Error(`Purchase order item ${item.purchaseOrderItemId} not found`);
      }

      if (item.quantityReceived <= 0) {
        throw new Error('Quantity received must be greater than 0');
      }

      const newReceivedQty = poItem.receivedQty + item.quantityReceived;
      if (newReceivedQty > poItem.quantity) {
        throw new Error(
          `Cannot receive more than ordered quantity for ${poItem.inventoryItem.name}`
        );
      }

      return {
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantityReceived: item.quantityReceived,
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        inventoryItem: poItem.inventoryItem,
        unitCost: poItem.unitPrice,
      };
    });

    // Create goods receipt and update inventory in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create goods receipt
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          grnNumber,
          purchaseOrderId: poId,
          receivedByEmployeeId,
          receivedDate: new Date(),
          notes: notes || null,
          items: {
            create: receiptItems.map(item => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              quantityReceived: item.quantityReceived,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
            })),
          },
        },
        include: {
          items: {
            include: {
              purchaseOrderItem: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
          receivedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Update inventory items stock levels and create stock movements
      for (const item of receiptItems) {
        // Update current stock
        const updatedItem = await tx.inventoryItem.update({
          where: { id: item.inventoryItem.id },
          data: {
            currentStock: {
              increment: item.quantityReceived,
            },
            lastCost: item.unitCost,
            // Update average cost using weighted average
            averageCost: {
              set: (
                (item.inventoryItem.currentStock * item.inventoryItem.averageCost +
                  item.quantityReceived * item.unitCost) /
                (item.inventoryItem.currentStock + item.quantityReceived)
              ),
            },
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItem.id,
            type: 'PURCHASE',
            quantity: item.quantityReceived,
            referenceType: 'PO',
            referenceId: poId,
            unitCost: item.unitCost,
            totalCost: item.quantityReceived * item.unitCost,
            performedByEmployeeId: receivedByEmployeeId,
            notes: `Received via ${grnNumber}`,
          },
        });

        // Create stock batch if item tracks batches
        if (item.inventoryItem.trackBatch && item.batchNumber) {
          await tx.stockBatch.create({
            data: {
              inventoryItemId: item.inventoryItem.id,
              batchNumber: item.batchNumber,
              quantity: item.quantityReceived,
              receivedDate: new Date(),
              expiryDate: item.expiryDate,
              unitCost: item.unitCost,
            },
          });
        }

        // Update PO item received quantity
        await tx.purchaseOrderItem.update({
          where: { id: item.purchaseOrderItemId },
          data: {
            receivedQty: {
              increment: item.quantityReceived,
            },
          },
        });
      }

      // Check if all items are fully received
      const updatedPOItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: poId },
      });

      const allFullyReceived = updatedPOItems.every(
        item => item.receivedQty >= item.quantity
      );

      const anyPartiallyReceived = updatedPOItems.some(
        item => item.receivedQty > 0 && item.receivedQty < item.quantity
      );

      // Update PO status
      let newPOStatus = purchaseOrder.status;
      if (allFullyReceived) {
        newPOStatus = 'RECEIVED';
      } else if (anyPartiallyReceived || updatedPOItems.some(item => item.receivedQty > 0)) {
        newPOStatus = 'PARTIALLY_RECEIVED';
      }

      const updatedPO = await tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: newPOStatus,
          receivedDate: allFullyReceived ? new Date() : null,
        },
      });

      return { goodsReceipt, updatedPO };
    });

    return successResponse(
      result.goodsReceipt,
      'Goods receipt created successfully',
      201
    );
  } catch (error) {
    console.error('Create goods receipt API error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to create goods receipt', 500);
  }
}
