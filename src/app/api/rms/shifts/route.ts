import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        (where.startTime as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startTime as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.shift.count({ where });

    // Fetch shifts
    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { startTime: 'desc' },
      skip,
      take: limit,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        terminal: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cashDrops: {
          select: {
            id: true,
            amount: true,
            reason: true,
            droppedAt: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(shifts, total, page, limit));
  } catch (error) {
    console.error('Shifts GET error:', error);
    return errorResponse('Failed to fetch shifts', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      outletId,
      terminalId,
      employeeId,
      openingFloat,
      notes,
    } = body;

    // Validate required fields
    if (!outletId || !employeeId) {
      return errorResponse('Missing required fields: outletId, employeeId');
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return errorResponse('Employee not found');
    }

    if (!employee.isActive) {
      return errorResponse('Employee is inactive');
    }

    // Check if employee already has an open shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        employeeId,
        status: 'OPEN',
      },
    });

    if (activeShift) {
      return errorResponse('Employee already has an open shift');
    }

    // Check if terminal is already in use
    if (terminalId) {
      const terminalInUse = await prisma.shift.findFirst({
        where: {
          terminalId,
          status: 'OPEN',
        },
      });

      if (terminalInUse) {
        return errorResponse('Terminal is already in use by another shift');
      }
    }

    // Create shift
    const shift = await prisma.shift.create({
      data: {
        outletId,
        terminalId: terminalId || null,
        employeeId,
        startTime: new Date(),
        openingFloat: openingFloat || 0,
        notes: notes || null,
        status: 'OPEN',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        terminal: {
          select: {
            id: true,
            name: true,
            deviceId: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(shift, 'Shift opened successfully', 201);
  } catch (error) {
    console.error('Shifts POST error:', error);
    return errorResponse('Failed to open shift', 500);
  }
}
