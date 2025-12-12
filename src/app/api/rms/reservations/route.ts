import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/reservations - Get reservations with filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const guestPhone = searchParams.get('guestPhone');
    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!outletId) {
      return errorResponse('outletId query parameter is required', 400);
    }

    const where: any = { outletId };

    if (date) {
      // Filter by specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (status) {
      where.status = status;
    }

    if (guestPhone) {
      where.guestPhone = {
        contains: guestPhone,
      };
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
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
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [
          { date: 'asc' },
          { timeSlot: 'asc' },
        ],
      }),
      prisma.reservation.count({ where }),
    ]);

    const response = paginatedResponse(reservations, total, page, limit);
    return successResponse(response);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return errorResponse('Failed to fetch reservations', 500);
  }
}

// POST /api/rms/reservations - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      outletId,
      tableId,
      customerId,
      guestName,
      guestPhone,
      guestEmail,
      guestCount,
      date,
      timeSlot,
      duration = 90,
      status = 'PENDING',
      specialRequests,
      occasion,
      depositAmount,
      depositPaid = false,
      minimumSpend,
      source = 'PHONE',
      externalRef,
    } = body;

    // Validation
    if (!outletId || !guestName || !guestPhone || !guestCount || !date || !timeSlot) {
      return errorResponse(
        'Missing required fields: outletId, guestName, guestPhone, guestCount, date, timeSlot',
        400
      );
    }

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      return errorResponse('Outlet not found', 404);
    }

    // If tableId is provided, check if it exists and is available
    if (tableId) {
      const table = await prisma.table.findFirst({
        where: {
          id: tableId,
          outletId,
        },
      });

      if (!table) {
        return errorResponse('Table not found or does not belong to this outlet', 404);
      }

      // Check if table is already reserved for this time slot
      const reservationDate = new Date(date);
      const [hours, minutes] = timeSlot.split(':');
      const slotStart = new Date(reservationDate);
      slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          tableId,
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

    const reservation = await prisma.reservation.create({
      data: {
        outletId,
        tableId,
        customerId,
        guestName,
        guestPhone,
        guestEmail,
        guestCount,
        date: new Date(date),
        timeSlot,
        duration,
        status,
        specialRequests,
        occasion,
        depositAmount,
        depositPaid,
        minimumSpend,
        source,
        externalRef,
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

    // If table is assigned and status is CONFIRMED, update table status
    if (tableId && status === 'CONFIRMED') {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });
    }

    return successResponse(reservation, 'Reservation created successfully', 201);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return errorResponse('Failed to create reservation', 500);
  }
}
