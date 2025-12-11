import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/rms/waitlist - Get waitlist for an outlet
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');

    if (!outletId) {
      return errorResponse('outletId query parameter is required', 400);
    }

    const where: any = { outletId };

    if (status) {
      where.status = status;
    } else {
      // By default, show only active waitlist entries
      where.status = {
        in: ['WAITING', 'NOTIFIED'],
      };
    }

    const waitlist = await prisma.waitlist.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Calculate estimated wait times and positions
    const enrichedWaitlist = waitlist.map((entry, index) => ({
      ...entry,
      position: index + 1,
      waitingTime: Math.floor((Date.now() - entry.createdAt.getTime()) / 60000), // in minutes
    }));

    return successResponse(enrichedWaitlist);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return errorResponse('Failed to fetch waitlist', 500);
  }
}

// POST /api/rms/waitlist - Add guest to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      outletId,
      guestName,
      guestPhone,
      guestCount,
      estimatedWait,
      quotedWait,
      notes,
    } = body;

    // Validation
    if (!outletId || !guestName || !guestPhone || !guestCount) {
      return errorResponse(
        'Missing required fields: outletId, guestName, guestPhone, guestCount',
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

    // Calculate estimated wait time if not provided
    let calculatedEstimatedWait = estimatedWait;
    if (!calculatedEstimatedWait) {
      // Get current waitlist count
      const waitingCount = await prisma.waitlist.count({
        where: {
          outletId,
          status: 'WAITING',
        },
      });

      // Simple estimation: 15 minutes per party ahead
      calculatedEstimatedWait = waitingCount * 15;
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        outletId,
        guestName,
        guestPhone,
        guestCount,
        estimatedWait: calculatedEstimatedWait,
        quotedWait: quotedWait || calculatedEstimatedWait,
        status: 'WAITING',
        notes,
      },
    });

    // Get position in queue
    const position = await prisma.waitlist.count({
      where: {
        outletId,
        status: 'WAITING',
        createdAt: {
          lte: waitlistEntry.createdAt,
        },
      },
    });

    return successResponse(
      {
        ...waitlistEntry,
        position,
      },
      'Guest added to waitlist successfully',
      201
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return errorResponse('Failed to add guest to waitlist', 500);
  }
}
