import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/rms/reservations/[reservationId] - Get a single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            floor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            totalVisits: true,
            vipStatus: true,
            dietaryRestrictions: true,
            allergies: true,
          },
        },
      },
    });

    if (!reservation) {
      return notFoundResponse('Reservation not found');
    }

    return successResponse(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return errorResponse('Failed to fetch reservation', 500);
  }
}

// PUT /api/rms/reservations/[reservationId] - Update a reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const body = await request.json();

    // Check if reservation exists
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation) {
      return notFoundResponse('Reservation not found');
    }

    // If tableId is being updated, check for conflicts
    if (body.tableId && body.tableId !== existingReservation.tableId) {
      const date = body.date ? new Date(body.date) : existingReservation.date;
      const timeSlot = body.timeSlot || existingReservation.timeSlot;
      const duration = body.duration || existingReservation.duration;

      const [hours, minutes] = timeSlot.split(':');
      const slotStart = new Date(date);
      slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          tableId: body.tableId,
          id: { not: reservationId },
          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED'],
          },
          date: {
            gte: slotStart,
            lt: slotEnd,
          },
        },
      });

      if (conflictingReservation) {
        return errorResponse('Table is already reserved for this time slot', 400);
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        tableId: body.tableId,
        guestName: body.guestName,
        guestPhone: body.guestPhone,
        guestEmail: body.guestEmail,
        guestCount: body.guestCount,
        date: body.date ? new Date(body.date) : undefined,
        timeSlot: body.timeSlot,
        duration: body.duration,
        status: body.status,
        specialRequests: body.specialRequests,
        occasion: body.occasion,
        depositAmount: body.depositAmount,
        depositPaid: body.depositPaid,
        minimumSpend: body.minimumSpend,
      },
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(reservation, 'Reservation updated successfully');
  } catch (error) {
    console.error('Error updating reservation:', error);
    return errorResponse('Failed to update reservation', 500);
  }
}

// DELETE /api/rms/reservations/[reservationId] - Delete a reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;

    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return notFoundResponse('Reservation not found');
    }

    // If reservation is confirmed and has a table, update table status
    if (reservation.tableId && reservation.status === 'CONFIRMED') {
      await prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return successResponse({ id: reservationId }, 'Reservation deleted successfully');
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return errorResponse('Failed to delete reservation', 500);
  }
}

// PATCH /api/rms/reservations/[reservationId] - Update reservation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const body = await request.json();
    const { status, cancelReason } = body;

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Check if reservation exists
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation) {
      return notFoundResponse('Reservation not found');
    }

    const updateData: any = { status };

    // Handle status-specific updates
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();

      // Update table status if table is assigned
      if (existingReservation.tableId) {
        await prisma.table.update({
          where: { id: existingReservation.tableId },
          data: { status: 'RESERVED' },
        });
      }
    }

    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = cancelReason;

      // Update table status if table is assigned
      if (existingReservation.tableId) {
        await prisma.table.update({
          where: { id: existingReservation.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    if (status === 'SEATED') {
      // Update table status to occupied
      if (existingReservation.tableId) {
        await prisma.table.update({
          where: { id: existingReservation.tableId },
          data: { status: 'OCCUPIED' },
        });
      }
    }

    if (status === 'COMPLETED' || status === 'NO_SHOW') {
      // Update table status back to available
      if (existingReservation.tableId) {
        await prisma.table.update({
          where: { id: existingReservation.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
          },
        },
      },
    });

    return successResponse(reservation, 'Reservation status updated successfully');
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return errorResponse('Failed to update reservation status', 500);
  }
}
