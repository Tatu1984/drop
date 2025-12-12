import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/outlets/[outletId] - Get a single outlet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params;

    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      include: {
        _count: {
          select: {
            tables: true,
            floors: true,
            reservations: true,
            dineInOrders: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        floors: {
          include: {
            _count: {
              select: {
                tables: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!outlet) {
      return notFoundResponse('Outlet not found');
    }

    return successResponse(outlet);
  } catch (error) {
    console.error('Error fetching outlet:', error);
    return errorResponse('Failed to fetch outlet', 500);
  }
}

// PUT /api/rms/outlets/[outletId] - Update an outlet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params;
    const body = await request.json();

    // Check if outlet exists
    const existingOutlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!existingOutlet) {
      return notFoundResponse('Outlet not found');
    }

    // If code is being updated, check for conflicts
    if (body.code && body.code !== existingOutlet.code) {
      const codeExists = await prisma.outlet.findUnique({
        where: { code: body.code },
      });

      if (codeExists) {
        return errorResponse('Outlet with this code already exists', 400);
      }
    }

    const outlet = await prisma.outlet.update({
      where: { id: outletId },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        phone: body.phone,
        email: body.email,
        timezone: body.timezone,
        currency: body.currency,
        openingTime: body.openingTime,
        closingTime: body.closingTime,
        isOpen: body.isOpen,
        taxRate: body.taxRate,
        serviceChargeRate: body.serviceChargeRate,
        settings: body.settings,
      },
      include: {
        _count: {
          select: {
            tables: true,
            floors: true,
            reservations: true,
          },
        },
      },
    });

    return successResponse(outlet, 'Outlet updated successfully');
  } catch (error) {
    console.error('Error updating outlet:', error);
    return errorResponse('Failed to update outlet', 500);
  }
}

// DELETE /api/rms/outlets/[outletId] - Delete an outlet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params;

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      include: {
        _count: {
          select: {
            tables: true,
            reservations: true,
            dineInOrders: true,
          },
        },
      },
    });

    if (!outlet) {
      return notFoundResponse('Outlet not found');
    }

    // Check if outlet has active data
    if (outlet._count.reservations > 0 || outlet._count.dineInOrders > 0) {
      return errorResponse(
        'Cannot delete outlet with existing reservations or orders. Please archive it instead.',
        400
      );
    }

    await prisma.outlet.delete({
      where: { id: outletId },
    });

    return successResponse({ id: outletId }, 'Outlet deleted successfully');
  } catch (error) {
    console.error('Error deleting outlet:', error);
    return errorResponse('Failed to delete outlet', 500);
  }
}
