import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/rms/kds/tickets - Get KDS tickets with filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const searchParams = request.nextUrl.searchParams;
    const stationId = searchParams.get('stationId');
    const status = searchParams.get('status');

    if (!stationId) {
      return errorResponse('stationId is required', 400);
    }

    const where: any = {
      stationId,
    };

    if (status) {
      where.status = status;
    }

    const tickets = await prisma.kDSTicket.findMany({
      where,
      include: {
        items: {
          include: {
            orderItem: {
              select: {
                id: true,
                orderId: true,
                quantity: true,
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
      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return successResponse(tickets);
  } catch (error) {
    console.error('Error fetching KDS tickets:', error);
    return errorResponse('Failed to fetch KDS tickets', 500);
  }
}

// POST /api/rms/kds/tickets - Create KDS ticket
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      stationId,
      orderNumber,
      tableNumber,
      orderType,
      priority,
      isRush,
      items = [],
    } = body;

    // Validation
    if (!stationId || !orderNumber || !items || items.length === 0) {
      return errorResponse('stationId, orderNumber, and items are required', 400);
    }

    // Check if station exists
    const station = await prisma.kDSStation.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      return errorResponse('KDS Station not found', 404);
    }

    if (!station.isActive) {
      return errorResponse('KDS Station is not active', 400);
    }

    // Create ticket with items
    const ticket = await prisma.kDSTicket.create({
      data: {
        stationId,
        orderNumber,
        tableNumber: tableNumber || null,
        orderType: orderType || 'DINE_IN',
        priority: priority || 0,
        isRush: isRush || false,
        items: {
          create: items.map((item: any) => ({
            orderItemId: item.orderItemId || null,
            name: item.name,
            quantity: item.quantity,
            modifiers: item.modifiers || null,
            specialInstructions: item.specialInstructions || null,
          })),
        },
      },
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

    // Update order item status to SENT
    for (const item of items) {
      if (item.orderItemId) {
        await prisma.dineInOrderItem.update({
          where: { id: item.orderItemId },
          data: {
            status: 'SENT',
            sentToKitchenAt: new Date(),
          },
        });
      }
    }

    return successResponse(ticket, 'KDS ticket created successfully', 201);
  } catch (error) {
    console.error('Error creating KDS ticket:', error);
    return errorResponse('Failed to create KDS ticket', 500);
  }
}
