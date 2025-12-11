import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        supplier: true,
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
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                unitOfMeasure: true,
                currentStock: true,
              },
            },
            receiptItems: {
              include: {
                goodsReceipt: {
                  select: {
                    id: true,
                    grnNumber: true,
                    receivedDate: true,
                  },
                },
              },
            },
          },
        },
        receipts: {
          include: {
            receivedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            items: true,
          },
        },
        invoices: true,
      },
    });

    if (!purchaseOrder) {
      return notFoundResponse('Purchase order not found');
    }

    return successResponse(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order API error:', error);
    return errorResponse('Failed to fetch purchase order', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params;
    const body = await request.json();

    // Check if PO exists
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });

    if (!existingPO) {
      return notFoundResponse('Purchase order not found');
    }

    // Only allow editing DRAFT or PENDING_APPROVAL POs
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(existingPO.status)) {
      return errorResponse('Cannot edit purchase order with current status', 400);
    }

    const { expectedDate, items, taxRate, notes } = body;

    // If items are provided, recalculate totals
    let updateData: Record<string, unknown> = {
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      notes: notes !== undefined ? notes : undefined,
    };

    if (items && items.length > 0) {
      // Calculate new totals
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

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        total,
      };

      // Delete existing items and create new ones
      await prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: poId },
      });

      updateData.items = {
        create: processedItems,
      };
    }

    // Update purchase order
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: updateData,
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

    return successResponse(purchaseOrder, 'Purchase order updated successfully');
  } catch (error) {
    console.error('Update purchase order API error:', error);
    return errorResponse('Failed to update purchase order', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params;

    // Check if PO exists
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        receipts: true,
      },
    });

    if (!existingPO) {
      return notFoundResponse('Purchase order not found');
    }

    // Only allow deleting DRAFT POs
    if (existingPO.status !== 'DRAFT') {
      return errorResponse('Can only delete DRAFT purchase orders. Use PATCH to cancel instead.', 400);
    }

    // Check if any items have been received
    if (existingPO.receipts.length > 0) {
      return errorResponse('Cannot delete purchase order with received items', 400);
    }

    // Delete purchase order and items (cascade)
    await prisma.purchaseOrder.delete({
      where: { id: poId },
    });

    return successResponse(null, 'Purchase order deleted successfully');
  } catch (error) {
    console.error('Delete purchase order API error:', error);
    return errorResponse('Failed to delete purchase order', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params;
    const body = await request.json();
    const { status, employeeId } = body;

    // Validate required fields
    if (!status) {
      return errorResponse('Missing required field: status', 400);
    }

    // Check if PO exists
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
    });

    if (!existingPO) {
      return notFoundResponse('Purchase order not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
      PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
      APPROVED: ['SENT', 'CANCELLED'],
      SENT: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      PARTIALLY_RECEIVED: ['RECEIVED'],
    };

    if (!validTransitions[existingPO.status]?.includes(status)) {
      return errorResponse(
        `Invalid status transition from ${existingPO.status} to ${status}`,
        400
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { status };

    // If approving, record approver and date
    if (status === 'APPROVED' && employeeId) {
      updateData.approvedByEmployeeId = employeeId;
      updateData.approvedAt = new Date();
    }

    // Update purchase order
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: updateData,
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    return successResponse(purchaseOrder, 'Purchase order status updated successfully');
  } catch (error) {
    console.error('Update PO status API error:', error);
    return errorResponse('Failed to update purchase order status', 500);
  }
}
