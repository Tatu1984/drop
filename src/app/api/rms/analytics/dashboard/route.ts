import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/analytics/dashboard - Get dashboard KPIs for today
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const date = searchParams.get('date');

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's orders
    const [todayOrders, activeOrders, tables] = await Promise.all([
      prisma.dineInOrder.findMany({
        where: {
          outletId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: 'VOID',
          },
        },
        include: {
          items: {
            where: {
              isVoid: false,
            },
          },
          payments: true,
        },
      }),
      prisma.dineInOrder.findMany({
        where: {
          outletId,
          status: {
            in: ['OPEN', 'PRINTED'],
          },
        },
        include: {
          table: true,
        },
      }),
      prisma.table.findMany({
        where: {
          outletId,
          isActive: true,
        },
      }),
    ]);

    // Today's metrics
    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = todayOrders.length;
    const totalCovers = todayOrders.reduce((sum, order) => sum + order.guestCount, 0);
    const averageCheck = totalOrders > 0 ? totalSales / totalOrders : 0;
    const averagePerCover = totalCovers > 0 ? totalSales / totalCovers : 0;

    // Table status
    const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
    const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
    const reservedTables = tables.filter((t) => t.status === 'RESERVED').length;
    const tableOccupancy = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

    // Payment methods breakdown
    const cashSales = todayOrders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);

    const cardSales = todayOrders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CARD')
      .reduce((sum, p) => sum + p.amount, 0);

    const upiSales = todayOrders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'UPI')
      .reduce((sum, p) => sum + p.amount, 0);

    // Hourly sales (last 24 hours)
    const hourlySales: { [key: string]: number } = {};
    todayOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const key = `${hour}:00`;
      hourlySales[key] = (hourlySales[key] || 0) + order.total;
    });

    // Top items today
    const allItems = todayOrders.flatMap((o) => o.items);
    const itemStats: {
      [key: string]: {
        name: string;
        quantity: number;
        revenue: number;
      };
    } = {};

    allItems.forEach((item) => {
      const key = item.menuItemId;
      if (!itemStats[key]) {
        itemStats[key] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      itemStats[key].quantity += item.quantity;
      itemStats[key].revenue += item.totalPrice;
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Active orders details
    const activeOrdersDetails = activeOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.tableNumber,
      guestCount: order.guestCount,
      total: order.total,
      status: order.status,
      openedAt: order.openedAt,
      minutesOpen: Math.floor((new Date().getTime() - order.openedAt.getTime()) / 60000),
    }));

    // Yesterday's comparison
    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayOrders = await prisma.dineInOrder.findMany({
      where: {
        outletId,
        createdAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        status: {
          not: 'VOID',
        },
      },
    });

    const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
    const salesGrowth = yesterdaySales > 0
      ? ((totalSales - yesterdaySales) / yesterdaySales) * 100
      : 0;

    // Staff on duty
    const staffOnDuty = await prisma.timeEntry.findMany({
      where: {
        outletId,
        clockIn: {
          gte: startOfDay,
        },
        clockOut: null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Recent reservations
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        outletId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    });

    return successResponse({
      date: targetDate.toISOString().split('T')[0],
      currentTime: new Date().toISOString(),
      sales: {
        totalSales,
        totalOrders,
        totalCovers,
        averageCheck,
        averagePerCover,
        salesGrowth: parseFloat(salesGrowth.toFixed(2)),
        yesterdaySales,
      },
      tables: {
        total: tables.length,
        occupied: occupiedTables,
        available: availableTables,
        reserved: reservedTables,
        occupancyRate: parseFloat(tableOccupancy.toFixed(2)),
      },
      paymentMethods: {
        cash: cashSales,
        card: cardSales,
        upi: upiSales,
      },
      activeOrders: {
        count: activeOrders.length,
        orders: activeOrdersDetails,
      },
      topItems,
      hourlySales: Object.entries(hourlySales).map(([hour, sales]) => ({
        hour,
        sales,
      })),
      staff: {
        onDuty: staffOnDuty.length,
        employees: staffOnDuty.map((entry) => ({
          id: entry.employee.id,
          name: `${entry.employee.firstName} ${entry.employee.lastName}`,
          role: entry.employee.role,
          clockedInAt: entry.clockIn,
        })),
      },
      upcomingReservations: upcomingReservations.map((res) => ({
        id: res.id,
        guestName: res.guestName,
        guestCount: res.guestCount,
        timeSlot: res.timeSlot,
        status: res.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return serverErrorResponse('Failed to fetch dashboard analytics');
  }
}
