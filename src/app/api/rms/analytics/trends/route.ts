import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/analytics/trends - Get sales trends over time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const period = searchParams.get('period') || 'week'; // week, month, quarter, year
    const metric = searchParams.get('metric') || 'sales'; // sales, orders, covers, average
    const groupBy = searchParams.get('groupBy') || 'day'; // hour, day, week, month

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    // Calculate date range
    const dateTo = new Date();
    const dateFrom = new Date();

    switch (period) {
      case 'week':
        dateFrom.setDate(dateTo.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(dateTo.getMonth() - 1);
        break;
      case 'quarter':
        dateFrom.setMonth(dateTo.getMonth() - 3);
        break;
      case 'year':
        dateFrom.setFullYear(dateTo.getFullYear() - 1);
        break;
      default:
        dateFrom.setDate(dateTo.getDate() - 7);
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    // Get orders for the period
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
      },
      include: {
        items: {
          where: {
            isVoid: false,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group data
    const trendData: {
      [key: string]: {
        date: string;
        sales: number;
        orders: number;
        covers: number;
        averageCheck: number;
      };
    } = {};

    orders.forEach((order) => {
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = order.createdAt.toISOString().slice(0, 13) + ':00'; // YYYY-MM-DDTHH:00
          break;
        case 'day':
          key = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          const weekStart = new Date(order.createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
          break;
        default:
          key = order.createdAt.toISOString().split('T')[0];
      }

      if (!trendData[key]) {
        trendData[key] = {
          date: key,
          sales: 0,
          orders: 0,
          covers: 0,
          averageCheck: 0,
        };
      }

      trendData[key].sales += order.total;
      trendData[key].orders += 1;
      trendData[key].covers += order.guestCount;
    });

    // Calculate averages
    Object.values(trendData).forEach((data) => {
      data.averageCheck = data.orders > 0 ? data.sales / data.orders : 0;
    });

    const trend = Object.values(trendData).sort((a, b) => a.date.localeCompare(b.date));

    // Sales by day of week
    const dayOfWeekSales: { [key: string]: { sales: number; orders: number } } = {
      Sunday: { sales: 0, orders: 0 },
      Monday: { sales: 0, orders: 0 },
      Tuesday: { sales: 0, orders: 0 },
      Wednesday: { sales: 0, orders: 0 },
      Thursday: { sales: 0, orders: 0 },
      Friday: { sales: 0, orders: 0 },
      Saturday: { sales: 0, orders: 0 },
    };

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    orders.forEach((order) => {
      const dayName = daysOfWeek[order.createdAt.getDay()];
      dayOfWeekSales[dayName].sales += order.total;
      dayOfWeekSales[dayName].orders += 1;
    });

    // Sales by hour of day
    const hourOfDaySales: { [key: number]: { sales: number; orders: number } } = {};

    for (let i = 0; i < 24; i++) {
      hourOfDaySales[i] = { sales: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourOfDaySales[hour].sales += order.total;
      hourOfDaySales[hour].orders += 1;
    });

    const peakHours = Object.entries(hourOfDaySales)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        hourLabel: `${hour}:00`,
        sales: data.sales,
        orders: data.orders,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Category trends
    const categoryTrends: {
      [key: string]: {
        [key: string]: number;
      };
    } = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      order.items.forEach((item) => {
        const courseType = item.courseType;
        if (!categoryTrends[courseType]) {
          categoryTrends[courseType] = {};
        }
        if (!categoryTrends[courseType][dateKey]) {
          categoryTrends[courseType][dateKey] = 0;
        }
        categoryTrends[courseType][dateKey] += item.totalPrice;
      });
    });

    // Calculate growth rate
    const firstWeekSales = trend.slice(0, 7).reduce((sum, d) => sum + d.sales, 0);
    const lastWeekSales = trend.slice(-7).reduce((sum, d) => sum + d.sales, 0);
    const growthRate = firstWeekSales > 0
      ? ((lastWeekSales - firstWeekSales) / firstWeekSales) * 100
      : 0;

    // Moving average (7-day)
    const movingAverage = trend.map((data, index) => {
      const window = trend.slice(Math.max(0, index - 6), index + 1);
      const avg = window.reduce((sum, d) => sum + d.sales, 0) / window.length;
      return {
        date: data.date,
        movingAverage: avg,
      };
    });

    // Summary statistics
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCovers = orders.reduce((sum, order) => sum + order.guestCount, 0);
    const averageDailySales = trend.length > 0 ? totalSales / trend.length : 0;

    return successResponse({
      period: {
        from: dateFrom.toISOString().split('T')[0],
        to: dateTo.toISOString().split('T')[0],
        type: period,
        groupBy,
      },
      summary: {
        totalSales,
        totalOrders,
        totalCovers,
        averageDailySales,
        growthRate: parseFloat(growthRate.toFixed(2)),
      },
      trend,
      movingAverage,
      dayOfWeek: Object.entries(dayOfWeekSales).map(([day, data]) => ({
        day,
        sales: data.sales,
        orders: data.orders,
        averageCheck: data.orders > 0 ? data.sales / data.orders : 0,
      })),
      hourOfDay: Object.entries(hourOfDaySales).map(([hour, data]) => ({
        hour: parseInt(hour),
        hourLabel: `${hour}:00`,
        sales: data.sales,
        orders: data.orders,
      })),
      peakHours,
      categoryTrends: Object.entries(categoryTrends).map(([category, dates]) => ({
        category,
        data: Object.entries(dates).map(([date, sales]) => ({
          date,
          sales,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching trends analytics:', error);
    return serverErrorResponse('Failed to fetch trends analytics');
  }
}
