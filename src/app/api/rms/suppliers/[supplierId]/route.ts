import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
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
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!supplier) {
      return notFoundResponse('Supplier not found');
    }

    return successResponse(supplier);
  } catch (error) {
    console.error('Get supplier API error:', error);
    return errorResponse('Failed to fetch supplier', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    const body = await request.json();

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!existingSupplier) {
      return notFoundResponse('Supplier not found');
    }

    const {
      name,
      contactName,
      email,
      phone,
      address,
      paymentTerms,
      leadTime,
      minimumOrder,
      rating,
      isActive,
    } = body;

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: name !== undefined ? name : undefined,
        contactName: contactName !== undefined ? contactName : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        paymentTerms: paymentTerms !== undefined ? paymentTerms : undefined,
        leadTime: leadTime !== undefined ? leadTime : undefined,
        minimumOrder: minimumOrder !== undefined ? minimumOrder : undefined,
        rating: rating !== undefined ? rating : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        _count: {
          select: {
            items: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResponse(supplier, 'Supplier updated successfully');
  } catch (error) {
    console.error('Update supplier API error:', error);
    return errorResponse('Failed to update supplier', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });

    if (!existingSupplier) {
      return notFoundResponse('Supplier not found');
    }

    // Check if supplier has any purchase orders
    if (existingSupplier._count.purchaseOrders > 0) {
      // Soft delete by setting isActive to false
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { isActive: false },
      });
      return successResponse(null, 'Supplier deactivated successfully (has purchase order history)');
    }

    // Hard delete if no purchase orders
    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    return successResponse(null, 'Supplier deleted successfully');
  } catch (error) {
    console.error('Delete supplier API error:', error);
    return errorResponse('Failed to delete supplier', 500);
  }
}
