import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// PATCH /api/rms/kds/tickets/[ticketId] - Update ticket status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;
    const body = await request.json();
    const { status, itemStatuses } = body;

    if (!status) {
      return errorResponse('status is required', 400);
    }

    // Check if ticket exists
    const existingTicket = await prisma.kDSTicket.findUnique({
      where: { id: ticketId },
      include: {
        items: true,
      },
    });

    if (!existingTicket) {
      return notFoundResponse('Ticket not found');
    }

    // Prepare update data
    const updateData: any = { status };

    // Update timestamps based on status
    if (status === 'ACKNOWLEDGED' && !existingTicket.acknowledgedAt) {
      updateData.acknowledgedAt = new Date();
    } else if (status === 'IN_PROGRESS' && !existingTicket.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'READY' && !existingTicket.completedAt) {
      updateData.completedAt = new Date();
    } else if (status === 'SERVED' && !existingTicket.completedAt) {
      updateData.completedAt = new Date();
    }

    // Update ticket
    const ticket = await prisma.kDSTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        items: {
          include: {
            orderItem: {
              select: {
                id: true,
                orderId: true,
              },
            },
          },
        },
        station: {
          select: {
            name: true,
            stationType: true,
          },
        },
      },
    });

    // Update individual item statuses if provided
    if (itemStatuses && Array.isArray(itemStatuses)) {
      for (const itemStatus of itemStatuses) {
        const { itemId, status: itemStatusValue } = itemStatus;
        if (itemId && itemStatusValue) {
          const updateItemData: any = { status: itemStatusValue };

          if (itemStatusValue === 'DONE') {
            updateItemData.completedAt = new Date();
          }

          await prisma.kDSTicketItem.update({
            where: { id: itemId },
            data: updateItemData,
          });
        }
      }
    }

    // Update corresponding order item statuses
    if (status === 'ACKNOWLEDGED') {
      for (const item of existingTicket.items) {
        if (item.orderItemId) {
          await prisma.dineInOrderItem.update({
            where: { id: item.orderItemId },
            data: { status: 'ACKNOWLEDGED' },
          });
        }
      }
    } else if (status === 'IN_PROGRESS') {
      for (const item of existingTicket.items) {
        if (item.orderItemId) {
          await prisma.dineInOrderItem.update({
            where: { id: item.orderItemId },
            data: { status: 'PREPARING' },
          });
        }
      }
    } else if (status === 'READY') {
      for (const item of existingTicket.items) {
        if (item.orderItemId) {
          await prisma.dineInOrderItem.update({
            where: { id: item.orderItemId },
            data: {
              status: 'READY',
              preparedAt: new Date(),
            },
          });
        }
      }
    } else if (status === 'SERVED') {
      for (const item of existingTicket.items) {
        if (item.orderItemId) {
          await prisma.dineInOrderItem.update({
            where: { id: item.orderItemId },
            data: {
              status: 'SERVED',
              servedAt: new Date(),
            },
          });
        }
      }
    }

    return successResponse(ticket, 'Ticket status updated successfully');
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return errorResponse('Failed to update ticket status', 500);
  }
}
