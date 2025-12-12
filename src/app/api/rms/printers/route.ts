import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/printers - Get all printers for an outlet
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const type = searchParams.get('type'); // RECEIPT, KITCHEN, BAR, LABEL

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    const printers = await prisma.printer.findMany({
      where: {
        outletId,
        ...(type && { type: type as any }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse({
      printers: printers.map((printer) => ({
        id: printer.id,
        outletId: printer.outletId,
        name: printer.name,
        type: printer.type,
        connectionType: printer.connectionType,
        ipAddress: printer.ipAddress,
        port: printer.port,
        isActive: printer.isActive,
      })),
      count: printers.length,
    });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return serverErrorResponse('Failed to fetch printers');
  }
}

// POST /api/rms/printers - Add a new printer
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const { outletId, name, type, connectionType, ipAddress, port, isActive } = body;

    if (!outletId || !name || !type || !connectionType) {
      return errorResponse('Missing required fields: outletId, name, type, connectionType', 400);
    }

    // Validate printer type
    const validTypes = ['RECEIPT', 'KITCHEN', 'BAR', 'LABEL'];
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid printer type. Must be one of: ' + validTypes.join(', '), 400);
    }

    // Validate connection type
    const validConnectionTypes = ['USB', 'NETWORK', 'BLUETOOTH'];
    if (!validConnectionTypes.includes(connectionType)) {
      return errorResponse(
        'Invalid connection type. Must be one of: ' + validConnectionTypes.join(', '),
        400
      );
    }

    // If network printer, IP address is required
    if (connectionType === 'NETWORK' && !ipAddress) {
      return errorResponse('IP address is required for network printers', 400);
    }

    const printer = await prisma.printer.create({
      data: {
        outletId,
        name,
        type,
        connectionType,
        ipAddress: ipAddress || null,
        port: port || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return successResponse(
      {
        printer: {
          id: printer.id,
          outletId: printer.outletId,
          name: printer.name,
          type: printer.type,
          connectionType: printer.connectionType,
          ipAddress: printer.ipAddress,
          port: printer.port,
          isActive: printer.isActive,
        },
      },
      'Printer added successfully',
      201
    );
  } catch (error) {
    console.error('Error adding printer:', error);
    return serverErrorResponse('Failed to add printer');
  }
}

// PUT /api/rms/printers - Update a printer
export async function PUT(request: NextRequest, context: { params: Promise<{ [key: string]: string }> }) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const { id, name, type, connectionType, ipAddress, port, isActive } = body;

    if (!id) {
      return errorResponse('Printer ID is required', 400);
    }

    // Check if printer exists
    const existingPrinter = await prisma.printer.findUnique({
      where: { id },
    });

    if (!existingPrinter) {
      return errorResponse('Printer not found', 404);
    }

    // Validate types if provided
    if (type) {
      const validTypes = ['RECEIPT', 'KITCHEN', 'BAR', 'LABEL'];
      if (!validTypes.includes(type)) {
        return errorResponse('Invalid printer type. Must be one of: ' + validTypes.join(', '), 400);
      }
    }

    if (connectionType) {
      const validConnectionTypes = ['USB', 'NETWORK', 'BLUETOOTH'];
      if (!validConnectionTypes.includes(connectionType)) {
        return errorResponse(
          'Invalid connection type. Must be one of: ' + validConnectionTypes.join(', '),
          400
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (connectionType !== undefined) updateData.connectionType = connectionType;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (port !== undefined) updateData.port = port;
    if (isActive !== undefined) updateData.isActive = isActive;

    const printer = await prisma.printer.update({
      where: { id },
      data: updateData,
    });

    return successResponse(
      {
        printer: {
          id: printer.id,
          outletId: printer.outletId,
          name: printer.name,
          type: printer.type,
          connectionType: printer.connectionType,
          ipAddress: printer.ipAddress,
          port: printer.port,
          isActive: printer.isActive,
        },
      },
      'Printer updated successfully'
    );
  } catch (error) {
    console.error('Error updating printer:', error);
    return serverErrorResponse('Failed to update printer');
  }
}

// DELETE /api/rms/printers - Delete a printer
export async function DELETE(request: NextRequest, context: { params: Promise<{ [key: string]: string }> }) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Printer ID is required', 400);
    }

    // Check if printer exists
    const existingPrinter = await prisma.printer.findUnique({
      where: { id },
    });

    if (!existingPrinter) {
      return errorResponse('Printer not found', 404);
    }

    await prisma.printer.delete({
      where: { id },
    });

    return successResponse(
      {
        id,
      },
      'Printer deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting printer:', error);
    return serverErrorResponse('Failed to delete printer');
  }
}
