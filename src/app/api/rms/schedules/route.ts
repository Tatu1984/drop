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

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.employeeSchedule.count({ where });

    // Fetch schedules
    const schedules = await prisma.employeeSchedule.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
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
      },
    });

    return successResponse(paginatedResponse(schedules, total, page, limit));
  } catch (error) {
    console.error('Schedules GET error:', error);
    return errorResponse('Failed to fetch schedules', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      outletId,
      date,
      startTime,
      endTime,
      role,
      notes,
      status,
    } = body;

    // Validate required fields
    if (!employeeId || !outletId || !date || !startTime || !endTime) {
      return errorResponse('Missing required fields: employeeId, outletId, date, startTime, endTime');
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return errorResponse('Employee not found');
    }

    // Check for scheduling conflicts
    const conflictingSchedule = await prisma.employeeSchedule.findFirst({
      where: {
        employeeId,
        date: new Date(date),
        status: {
          not: 'CANCELLED',
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingSchedule) {
      return errorResponse('Employee already has a schedule during this time period');
    }

    // Create schedule
    const schedule = await prisma.employeeSchedule.create({
      data: {
        employeeId,
        outletId,
        date: new Date(date),
        startTime,
        endTime,
        role: role || null,
        notes: notes || null,
        status: status || 'SCHEDULED',
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
      },
    });

    return successResponse(schedule, 'Schedule created successfully', 201);
  } catch (error) {
    console.error('Schedules POST error:', error);
    return errorResponse('Failed to create schedule', 500);
  }
}
