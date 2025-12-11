import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const outletId = searchParams.get('outletId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const active = searchParams.get('active'); // Filter for currently clocked in

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (status) {
      where.status = status;
    }

    // Filter for active (not clocked out) entries
    if (active === 'true') {
      where.clockOut = null;
    }

    // Date range filter
    if (startDate || endDate) {
      where.clockIn = {};
      if (startDate) {
        (where.clockIn as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.clockIn as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.timeEntry.count({ where });

    // Fetch time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { clockIn: 'desc' },
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
            hourlyRate: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(timeEntries, total, page, limit));
  } catch (error) {
    console.error('Time entries GET error:', error);
    return errorResponse('Failed to fetch time entries', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, outletId, notes } = body;

    // Validate required fields
    if (!employeeId || !outletId) {
      return errorResponse('Missing required fields: employeeId, outletId');
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

    // Check if employee is already clocked in
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        clockOut: null,
      },
    });

    if (activeEntry) {
      return errorResponse('Employee is already clocked in');
    }

    // Create time entry (clock in)
    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId,
        outletId,
        clockIn: new Date(),
        notes: notes || null,
        status: 'PENDING',
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
            hourlyRate: true,
          },
        },
      },
    });

    return successResponse(timeEntry, 'Clocked in successfully', 201);
  } catch (error) {
    console.error('Time entries POST error:', error);
    return errorResponse('Failed to clock in', 500);
  }
}
