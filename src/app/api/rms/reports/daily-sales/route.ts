import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/reports/daily-sales - Get daily sales report
export async function GET(request: NextRequest) {
  try {
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

    // Get orders for the day
    const orders = await prisma.dineInOrder.findMany({
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
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCovers = orders.reduce((sum, order) => sum + order.guestCount, 0);
    const averageCheck = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);
    const totalTips = orders.reduce((sum, order) => sum + order.tip, 0);
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);

    // Payment method breakdown
    const cashSales = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);

    const cardSales = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CARD')
      .reduce((sum, p) => sum + p.amount, 0);

    const upiSales = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'UPI')
      .reduce((sum, p) => sum + p.amount, 0);

    const otherSales = totalSales - cashSales - cardSales - upiSales;

    // Order type breakdown
    const dineInOrders = orders.filter((o) => o.orderType === 'DINE_IN').length;
    const takeawayOrders = orders.filter((o) => o.orderType === 'TAKEAWAY').length;

    // Previous day comparison
    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevStartOfDay = new Date(previousDay);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDay);
    prevEndOfDay.setHours(23, 59, 59, 999);

    const previousDayOrders = await prisma.dineInOrder.findMany({
      where: {
        outletId,
        createdAt: {
          gte: prevStartOfDay,
          lte: prevEndOfDay,
        },
        status: {
          not: 'VOID',
        },
      },
    });

    const previousDaySales = previousDayOrders.reduce((sum, order) => sum + order.total, 0);
    const salesGrowth = previousDaySales > 0
      ? ((totalSales - previousDaySales) / previousDaySales) * 100
      : 0;

    return successResponse({
      date: targetDate.toISOString().split('T')[0],
      outletId,
      summary: {
        totalSales,
        totalOrders,
        totalCovers,
        averageCheck,
        subtotal,
        totalTax,
        totalDiscount,
        totalTips,
      },
      paymentMethods: {
        cash: cashSales,
        card: cardSales,
        upi: upiSales,
        other: otherSales,
      },
      orderTypes: {
        dineIn: dineInOrders,
        takeaway: takeawayOrders,
      },
      comparison: {
        previousDaySales,
        salesGrowth: parseFloat(salesGrowth.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching daily sales report:', error);
    return serverErrorResponse('Failed to fetch daily sales report');
  }
}

// POST /api/rms/reports/daily-sales - Generate report for specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outletId, date } = body;

    if (!outletId || !date) {
      return errorResponse('Outlet ID and date are required', 400);
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all orders
    const orders = await prisma.dineInOrder.findMany({
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
          include: {
            menuItem: true,
          },
        },
        payments: true,
      },
    });

    // Calculate all metrics
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCovers = orders.reduce((sum, order) => sum + order.guestCount, 0);
    const averageCheck = totalOrders > 0 ? totalSales / totalOrders : 0;
    const taxCollected = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const discountsGiven = orders.reduce((sum, order) => sum + order.discount, 0);
    const tipsCollected = orders.reduce((sum, order) => sum + order.tip, 0);

    // Payment breakdown
    const cashSales = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);

    const cardSales = orders
      .flatMap((o) => o.payments)
      .filter((p) => p.method === 'CARD')
      .reduce((sum, p) => sum + p.amount, 0);

    const otherSales = totalSales - cashSales - cardSales;

    // Category breakdown
    const allItems = orders.flatMap((o) => o.items);
    const foodSales = allItems
      .filter((item) => item.courseType !== 'BEVERAGE' && item.courseType !== 'BAR')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const beverageSales = allItems
      .filter((item) => item.courseType === 'BEVERAGE')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const alcoholSales = allItems
      .filter((item) => item.courseType === 'BAR')
      .reduce((sum, item) => sum + item.totalPrice, 0);

    // Save or update the report
    const report = await prisma.dailySalesReport.upsert({
      where: {
        outletId_date: {
          outletId,
          date: startOfDay,
        },
      },
      update: {
        totalSales,
        totalOrders,
        totalCovers,
        averageCheck,
        cashSales,
        cardSales,
        otherSales,
        foodSales,
        beverageSales,
        alcoholSales,
        taxCollected,
        discountsGiven,
        tipsCollected,
      },
      create: {
        outletId,
        date: startOfDay,
        totalSales,
        totalOrders,
        totalCovers,
        averageCheck,
        cashSales,
        cardSales,
        otherSales,
        foodSales,
        beverageSales,
        alcoholSales,
        taxCollected,
        discountsGiven,
        tipsCollected,
      },
    });

    return successResponse(
      {
        report,
        message: 'Report generated successfully',
      },
      'Report generated successfully',
      201
    );
  } catch (error) {
    console.error('Error generating daily sales report:', error);
    return serverErrorResponse('Failed to generate daily sales report');
  }
}
