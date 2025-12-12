import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();
    const { action, breakStart, breakEnd } = body;

    // Check if time entry exists
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: entryId },
      include: {
        employee: {
          select: {
            hourlyRate: true,
          },
        },
      },
    });

    if (!timeEntry) {
      return notFoundResponse('Time entry not found');
    }

    if (action === 'clockOut') {
      // Clock out
      if (timeEntry.clockOut) {
        return errorResponse('Already clocked out');
      }

      const clockOut = new Date();
      const clockIn = timeEntry.clockIn;

      // Calculate hours worked
      const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
      let workMinutes = totalMinutes;

      // Subtract break time if applicable
      if (timeEntry.breakStart && timeEntry.breakEnd) {
        const breakMinutes = Math.floor(
          (timeEntry.breakEnd.getTime() - timeEntry.breakStart.getTime()) / (1000 * 60)
        );
        workMinutes -= breakMinutes;
      }

      const totalHours = workMinutes / 60;

      // Calculate regular and overtime hours (assuming 8 hours is regular)
      const regularHours = Math.min(totalHours, 8);
      const overtimeHours = Math.max(totalHours - 8, 0);

      const updatedEntry = await prisma.timeEntry.update({
        where: { id: entryId },
        data: {
          clockOut,
          regularHours,
          overtimeHours,
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

      return successResponse(updatedEntry, 'Clocked out successfully');
    } else if (action === 'startBreak') {
      // Start break
      if (timeEntry.breakStart) {
        return errorResponse('Break already started');
      }

      const updatedEntry = await prisma.timeEntry.update({
        where: { id: entryId },
        data: {
          breakStart: new Date(),
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

      return successResponse(updatedEntry, 'Break started');
    } else if (action === 'endBreak') {
      // End break
      if (!timeEntry.breakStart) {
        return errorResponse('No break to end');
      }

      if (timeEntry.breakEnd) {
        return errorResponse('Break already ended');
      }

      const updatedEntry = await prisma.timeEntry.update({
        where: { id: entryId },
        data: {
          breakEnd: new Date(),
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

      return successResponse(updatedEntry, 'Break ended');
    }

    return errorResponse('Invalid action. Valid actions: clockOut, startBreak, endBreak');
  } catch (error) {
    console.error('Time entry PATCH error:', error);
    return errorResponse('Failed to update time entry', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();
    const {
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      regularHours,
      overtimeHours,
      status,
      approvedByEmployeeId,
      notes,
    } = body;

    // Check if time entry exists
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: entryId },
    });

    if (!timeEntry) {
      return notFoundResponse('Time entry not found');
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (clockIn !== undefined) updateData.clockIn = new Date(clockIn);
    if (clockOut !== undefined) updateData.clockOut = clockOut ? new Date(clockOut) : null;
    if (breakStart !== undefined) updateData.breakStart = breakStart ? new Date(breakStart) : null;
    if (breakEnd !== undefined) updateData.breakEnd = breakEnd ? new Date(breakEnd) : null;
    if (regularHours !== undefined) updateData.regularHours = regularHours;
    if (overtimeHours !== undefined) updateData.overtimeHours = overtimeHours;
    if (status !== undefined) updateData.status = status;
    if (approvedByEmployeeId !== undefined) updateData.approvedByEmployeeId = approvedByEmployeeId || null;
    if (notes !== undefined) updateData.notes = notes || null;

    // Mark as edited if time values changed
    if (clockIn !== undefined || clockOut !== undefined || regularHours !== undefined || overtimeHours !== undefined) {
      updateData.status = 'EDITED';
    }

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id: entryId },
      data: updateData,
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

    return successResponse(updatedEntry, 'Time entry updated successfully');
  } catch (error) {
    console.error('Time entry PUT error:', error);
    return errorResponse('Failed to update time entry', 500);
  }
}
