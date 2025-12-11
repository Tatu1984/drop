import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// PATCH /api/rms/waitlist/[waitlistId] - Update waitlist status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { waitlistId: string } }
) {
  try {
    const { waitlistId } = params;
    const body = await request.json();
    const { status, tableId, notes } = body;

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    // Validate status
    const validStatuses = ['WAITING', 'NOTIFIED', 'SEATED', 'LEFT', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Check if waitlist entry exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!existingEntry) {
      return notFoundResponse('Waitlist entry not found');
    }

    const updateData: any = { status };

    // Handle status-specific updates
    if (status === 'NOTIFIED') {
      updateData.notifiedAt = new Date();
    }

    if (status === 'SEATED') {
      updateData.seatedAt = new Date();

      if (tableId) {
        updateData.tableId = tableId;

        // Update table status to occupied
        await prisma.table.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        });
      }
    }

    if (status === 'LEFT') {
      updateData.leftAt = new Date();
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const waitlistEntry = await prisma.waitlist.update({
      where: { id: waitlistId },
      data: updateData,
    });

    // If seated or left, recalculate wait times for remaining guests
    if (status === 'SEATED' || status === 'LEFT' || status === 'CANCELLED') {
      // Get all waiting entries for this outlet
      const waitingEntries = await prisma.waitlist.findMany({
        where: {
          outletId: existingEntry.outletId,
          status: 'WAITING',
        },
        orderBy: { createdAt: 'asc' },
      });

      // Update estimated wait times
      for (let i = 0; i < waitingEntries.length; i++) {
        const estimatedWait = i * 15; // 15 minutes per party ahead
        await prisma.waitlist.update({
          where: { id: waitingEntries[i].id },
          data: { estimatedWait },
        });
      }
    }

    // Get current position
    const position = await prisma.waitlist.count({
      where: {
        outletId: existingEntry.outletId,
        status: 'WAITING',
        createdAt: {
          lte: waitlistEntry.createdAt,
        },
      },
    });

    return successResponse(
      {
        ...waitlistEntry,
        position: status === 'WAITING' ? position : null,
      },
      'Waitlist status updated successfully'
    );
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    return errorResponse('Failed to update waitlist status', 500);
  }
}

// GET /api/rms/waitlist/[waitlistId] - Get a single waitlist entry
export async function GET(
  request: NextRequest,
  { params }: { params: { waitlistId: string } }
) {
  try {
    const { waitlistId } = params;

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!waitlistEntry) {
      return notFoundResponse('Waitlist entry not found');
    }

    // Get position in queue if still waiting
    let position = null;
    if (waitlistEntry.status === 'WAITING' || waitlistEntry.status === 'NOTIFIED') {
      position = await prisma.waitlist.count({
        where: {
          outletId: waitlistEntry.outletId,
          status: 'WAITING',
          createdAt: {
            lte: waitlistEntry.createdAt,
          },
        },
      });
    }

    // Calculate actual waiting time
    const waitingTime = Math.floor(
      (Date.now() - waitlistEntry.createdAt.getTime()) / 60000
    ); // in minutes

    return successResponse({
      ...waitlistEntry,
      position,
      waitingTime,
    });
  } catch (error) {
    console.error('Error fetching waitlist entry:', error);
    return errorResponse('Failed to fetch waitlist entry', 500);
  }
}

// DELETE /api/rms/waitlist/[waitlistId] - Remove from waitlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { waitlistId: string } }
) {
  try {
    const { waitlistId } = params;

    // Check if entry exists
    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!waitlistEntry) {
      return notFoundResponse('Waitlist entry not found');
    }

    await prisma.waitlist.delete({
      where: { id: waitlistId },
    });

    return successResponse({ id: waitlistId }, 'Waitlist entry removed successfully');
  } catch (error) {
    console.error('Error removing waitlist entry:', error);
    return errorResponse('Failed to remove waitlist entry', 500);
  }
}
