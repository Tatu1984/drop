import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRMSAuth } from '@/lib/rms-auth';

// GET /api/rms/orders - Get dine-in orders with filtering
export async function GET(request: NextRequest) {
  try {
    // Authenticate vendor/admin
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    if (!outletId) {
      return errorResponse('outletId is required', 400);
    }

    const where: any = {
      outletId,
    };

    if (tableId) {
      where.tableId = tableId;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orders = await prisma.dineInOrder.findMany({
      where,
      include: {
        table: {
          select: {
            tableNumber: true,
            floor: {
              select: {
                name: true,
              },
            },
          },
        },
        server: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

// POST /api/rms/orders - Create new dine-in order
export async function POST(request: NextRequest) {
  try {
    // Authenticate vendor/admin
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const {
      outletId,
      tableId,
      serverEmployeeId,
      createdByEmployeeId,
      guestCount,
      orderType,
      notes,
      items = [],
    } = body;

    // Validation
    if (!outletId || !tableId || !createdByEmployeeId) {
      return errorResponse('outletId, tableId, and createdByEmployeeId are required', 400);
    }

    // Generate order number with DIN- prefix + timestamp
    const timestamp = Date.now();
    const orderNumber = `DIN-${timestamp}`;

    // Calculate totals from items
    let subtotal = 0;
    const itemsWithPrices = items.map((item: any) => {
      const itemTotal = item.unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        seatNumber: item.seatNumber || null,
        courseNumber: item.courseNumber || 1,
        courseType: item.courseType || 'MAIN',
        modifiers: item.modifiers || null,
        specialInstructions: item.specialInstructions || null,
      };
    });

    // Get outlet for tax rates
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      select: {
        taxRate: true,
        serviceChargeRate: true,
      },
    });

    if (!outlet) {
      return errorResponse('Outlet not found', 404);
    }

    // Calculate tax and service charge
    const taxAmount = subtotal * (outlet.taxRate / 100);
    const serviceCharge = subtotal * (outlet.serviceChargeRate / 100);
    const total = subtotal + taxAmount + serviceCharge;

    // Create order with items
    const order = await prisma.dineInOrder.create({
      data: {
        orderNumber,
        outletId,
        tableId,
        serverEmployeeId: serverEmployeeId || null,
        createdByEmployeeId,
        guestCount: guestCount || 1,
        orderType: orderType || 'DINE_IN',
        subtotal,
        taxAmount,
        serviceCharge,
        total,
        notes: notes || null,
        items: {
          create: itemsWithPrices,
        },
      },
      include: {
        table: {
          select: {
            tableNumber: true,
            floor: {
              select: {
                name: true,
              },
            },
          },
        },
        server: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Update table status to OCCUPIED
    await prisma.table.update({
      where: { id: tableId },
      data: {
        status: 'OCCUPIED',
        currentOrderId: order.id,
      },
    });

    return successResponse(order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse('Failed to create order', 500);
  }
}
