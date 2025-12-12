import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/reports/revenue - Get revenue breakdown by period
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const period = searchParams.get('period') || 'week'; // week, month, quarter, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!outletId) {
      return errorResponse('Outlet ID is required', 400);
    }

    let dateFrom: Date;
    let dateTo: Date = new Date();

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else {
      // Calculate dates based on period
      dateTo = new Date();
      dateFrom = new Date();

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
        payments: true,
      },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCovers = orders.reduce((sum, order) => sum + order.guestCount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageRevenuePerCover = totalCovers > 0 ? totalRevenue / totalCovers : 0;

    // Revenue by category
    const allItems = orders.flatMap((o) => o.items);

    const foodRevenue = allItems
      .filter((item) => item.courseType !== 'BEVERAGE' && item.courseType !== 'BAR')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const beverageRevenue = allItems
      .filter((item) => item.courseType === 'BEVERAGE')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const alcoholRevenue = allItems
      .filter((item) => item.courseType === 'BAR')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    // Revenue by order type
    const dineInRevenue = orders
      .filter((o) => o.orderType === 'DINE_IN')
      .reduce((sum, order) => sum + order.total, 0);

    const takeawayRevenue = orders
      .filter((o) => o.orderType === 'TAKEAWAY')
      .reduce((sum, order) => sum + order.total, 0);

    // Revenue by payment method
    const cashRevenue = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);

    const cardRevenue = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CARD')
      .reduce((sum, p) => sum + p.amount, 0);

    const upiRevenue = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'UPI')
      .reduce((sum, p) => sum + p.amount, 0);

    // Daily revenue trend
    const dailyRevenue: { [key: string]: number } = {};
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + order.total;
    });

    const revenueTrend = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // Tax and discounts
    const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.discount, 0);
    const totalTips = orders.reduce((sum, order) => sum + order.tip, 0);
    const netRevenue = totalRevenue - totalTax;

    // Compare with previous period
    const periodDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    const previousPeriodFrom = new Date(dateFrom);
    previousPeriodFrom.setDate(previousPeriodFrom.getDate() - periodDays);
    const previousPeriodTo = new Date(dateFrom);
    previousPeriodTo.setDate(previousPeriodTo.getDate() - 1);

    const previousOrders = await prisma.dineInOrder.findMany({
      where: {
        outletId,
        createdAt: {
          gte: previousPeriodFrom,
          lte: previousPeriodTo,
        },
        status: {
          not: 'VOID',
        },
      },
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    return successResponse({
      period: {
        from: dateFrom.toISOString().split('T')[0],
        to: dateTo.toISOString().split('T')[0],
        type: period,
      },
      summary: {
        totalRevenue,
        netRevenue,
        totalOrders,
        totalCovers,
        averageOrderValue,
        averageRevenuePerCover,
        totalTax,
        totalDiscounts,
        totalTips,
      },
      byCategory: {
        food: foodRevenue,
        beverage: beverageRevenue,
        alcohol: alcoholRevenue,
      },
      byOrderType: {
        dineIn: dineInRevenue,
        takeaway: takeawayRevenue,
      },
      byPaymentMethod: {
        cash: cashRevenue,
        card: cardRevenue,
        upi: upiRevenue,
      },
      trend: revenueTrend,
      comparison: {
        previousPeriodRevenue: previousRevenue,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    return serverErrorResponse('Failed to fetch revenue report');
  }
}
