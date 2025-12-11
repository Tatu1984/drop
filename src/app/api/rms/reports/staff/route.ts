import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/reports/staff - Get staff performance metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const period = searchParams.get('period') || 'week'; // day, week, month
    const employeeId = searchParams.get('employeeId');

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    // Calculate date range
    const dateTo = new Date();
    const dateFrom = new Date();

    switch (period) {
      case 'day':
        dateFrom.setDate(dateTo.getDate() - 1);
        break;
      case 'week':
        dateFrom.setDate(dateTo.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(dateTo.getMonth() - 1);
        break;
      default:
        dateFrom.setDate(dateTo.getDate() - 7);
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    // Get orders served by staff
    const orders = await prisma.dineInOrder.findMany({
      where: {
        outletId,
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: {
          not: 'VOID',
        },
        ...(employeeId && { serverEmployeeId: employeeId }),
      },
      include: {
        server: true,
        items: {
          where: {
            isVoid: false,
          },
        },
      },
    });

    // Staff performance metrics
    const staffStats: {
      [key: string]: {
        employeeId: string;
        employeeName: string;
        role: string;
        ordersServed: number;
        totalSales: number;
        averageOrderValue: number;
        totalCovers: number;
        totalTips: number;
        averageTipPercentage: number;
      };
    } = {};

    orders.forEach((order) => {
      if (!order.serverEmployeeId || !order.server) return;

      const key = order.serverEmployeeId;
      if (!staffStats[key]) {
        staffStats[key] = {
          employeeId: order.serverEmployeeId,
          employeeName: `${order.server.firstName} ${order.server.lastName}`,
          role: order.server.role,
          ordersServed: 0,
          totalSales: 0,
          averageOrderValue: 0,
          totalCovers: 0,
          totalTips: 0,
          averageTipPercentage: 0,
        };
      }

      staffStats[key].ordersServed += 1;
      staffStats[key].totalSales += order.total;
      staffStats[key].totalCovers += order.guestCount;
      staffStats[key].totalTips += order.tip;
    });

    // Calculate averages
    Object.values(staffStats).forEach((stat) => {
      stat.averageOrderValue = stat.ordersServed > 0 ? stat.totalSales / stat.ordersServed : 0;
      stat.averageTipPercentage =
        stat.totalSales > 0 ? (stat.totalTips / stat.totalSales) * 100 : 0;
    });

    const staffPerformance = Object.values(staffStats).sort(
      (a, b) => b.totalSales - a.totalSales
    );

    // Get time entries for labor hours
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        outletId,
        clockIn: {
          gte: dateFrom,
          lte: dateTo,
        },
        ...(employeeId && { employeeId }),
      },
      include: {
        employee: true,
      },
    });

    // Calculate labor hours
    const laborStats: {
      [key: string]: {
        employeeId: string;
        employeeName: string;
        totalHours: number;
        shiftsWorked: number;
        averageHoursPerShift: number;
      };
    } = {};

    timeEntries.forEach((entry) => {
      const key = entry.employeeId;
      if (!laborStats[key]) {
        laborStats[key] = {
          employeeId: entry.employeeId,
          employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
          totalHours: 0,
          shiftsWorked: 0,
          averageHoursPerShift: 0,
        };
      }

      const hours = entry.clockOut
        ? (entry.clockOut.getTime() - entry.clockIn.getTime()) / (1000 * 60 * 60)
        : 0;

      laborStats[key].totalHours += hours;
      laborStats[key].shiftsWorked += 1;
    });

    Object.values(laborStats).forEach((stat) => {
      stat.averageHoursPerShift =
        stat.shiftsWorked > 0 ? stat.totalHours / stat.shiftsWorked : 0;
    });

    // Sales per labor hour
    const salesPerHour: {
      [key: string]: {
        employeeId: string;
        employeeName: string;
        salesPerHour: number;
      };
    } = {};

    Object.values(staffStats).forEach((staff) => {
      const labor = laborStats[staff.employeeId];
      if (labor && labor.totalHours > 0) {
        salesPerHour[staff.employeeId] = {
          employeeId: staff.employeeId,
          employeeName: staff.employeeName,
          salesPerHour: staff.totalSales / labor.totalHours,
        };
      }
    });

    const productivity = Object.values(salesPerHour).sort(
      (a, b) => b.salesPerHour - a.salesPerHour
    );

    // Shift summaries
    const shifts = await prisma.shift.findMany({
      where: {
        outletId,
        startTime: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        employee: true,
      },
    });

    const totalShifts = shifts.length;
    const totalShiftSales = shifts.reduce((sum, shift) => sum + shift.totalSales, 0);
    const totalLaborHours = Object.values(laborStats).reduce(
      (sum, stat) => sum + stat.totalHours,
      0
    );

    return successResponse({
      period: {
        from: dateFrom.toISOString().split('T')[0],
        to: dateTo.toISOString().split('T')[0],
        type: period,
      },
      summary: {
        totalShifts,
        totalLaborHours,
        totalShiftSales,
        averageSalesPerShift: totalShifts > 0 ? totalShiftSales / totalShifts : 0,
        salesPerLaborHour: totalLaborHours > 0 ? totalShiftSales / totalLaborHours : 0,
      },
      staffPerformance,
      laborHours: Object.values(laborStats),
      productivity,
    });
  } catch (error) {
    console.error('Error fetching staff report:', error);
    return serverErrorResponse('Failed to fetch staff report');
  }
}
