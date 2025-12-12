import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();
    const {
      date,
      startTime,
      endTime,
      role,
      notes,
      status,
    } = body;

    // Check if schedule exists
    const existingSchedule = await prisma.employeeSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      return notFoundResponse('Schedule not found');
    }

    // If changing date or time, check for conflicts
    if (date || startTime || endTime) {
      const scheduleDate = date ? new Date(date) : existingSchedule.date;
      const scheduleStartTime = startTime || existingSchedule.startTime;
      const scheduleEndTime = endTime || existingSchedule.endTime;

      const conflictingSchedule = await prisma.employeeSchedule.findFirst({
        where: {
          id: { not: scheduleId },
          employeeId: existingSchedule.employeeId,
          date: scheduleDate,
          status: {
            not: 'CANCELLED',
          },
          OR: [
            {
              AND: [
                { startTime: { lte: scheduleStartTime } },
                { endTime: { gt: scheduleStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: scheduleEndTime } },
                { endTime: { gte: scheduleEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: scheduleStartTime } },
                { endTime: { lte: scheduleEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSchedule) {
        return errorResponse('Employee already has a schedule during this time period');
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (role !== undefined) updateData.role = role || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;

    // Update schedule
    const schedule = await prisma.employeeSchedule.update({
      where: { id: scheduleId },
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
          },
        },
      },
    });

    return successResponse(schedule, 'Schedule updated successfully');
  } catch (error) {
    console.error('Schedule PUT error:', error);
    return errorResponse('Failed to update schedule', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;

    // Check if schedule exists
    const schedule = await prisma.employeeSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return notFoundResponse('Schedule not found');
    }

    // Delete schedule
    await prisma.employeeSchedule.delete({
      where: { id: scheduleId },
    });

    return successResponse({ id: scheduleId }, 'Schedule deleted successfully');
  } catch (error) {
    console.error('Schedule DELETE error:', error);
    return errorResponse('Failed to delete schedule', 500);
  }
}
