import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/reports/items - Get top selling items and item performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const period = searchParams.get('period') || 'week'; // day, week, month
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');

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

    // Get all order items for the period
    const orderItems = await prisma.dineInOrderItem.findMany({
      where: {
        order: {
          outletId,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: {
            not: 'VOID',
          },
        },
        isVoid: false,
        ...(categoryId && {
          menuItem: {
            categoryId,
          },
        }),
      },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
        order: true,
      },
    });

    // Group by menu item
    const itemStats: {
      [key: string]: {
        id: string;
        name: string;
        categoryName: string;
        quantitySold: number;
        revenue: number;
        averagePrice: number;
        orderCount: number;
      };
    } = {};

    orderItems.forEach((item) => {
      const key = item.menuItemId;
      if (!itemStats[key]) {
        itemStats[key] = {
          id: item.menuItemId,
          name: item.name,
          categoryName: item.menuItem.category?.name || 'Uncategorized',
          quantitySold: 0,
          revenue: 0,
          averagePrice: 0,
          orderCount: 0,
        };
      }

      itemStats[key].quantitySold += item.quantity;
      itemStats[key].revenue += item.totalPrice;
      itemStats[key].orderCount += 1;
    });

    // Calculate averages and sort
    Object.values(itemStats).forEach((stat) => {
      stat.averagePrice = stat.revenue / stat.quantitySold;
    });

    // Top sellers by quantity
    const topSellersByQuantity = Object.values(itemStats)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);

    // Top sellers by revenue
    const topSellersByRevenue = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Category performance
    const categoryStats: {
      [key: string]: {
        categoryName: string;
        itemCount: number;
        quantitySold: number;
        revenue: number;
      };
    } = {};

    orderItems.forEach((item) => {
      const categoryName = item.menuItem.category?.name || 'Uncategorized';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          categoryName,
          itemCount: 0,
          quantitySold: 0,
          revenue: 0,
        };
      }

      categoryStats[categoryName].quantitySold += item.quantity;
      categoryStats[categoryName].revenue += item.totalPrice;
    });

    // Count unique items per category
    const uniqueItemsPerCategory: { [key: string]: Set<string> } = {};
    orderItems.forEach((item) => {
      const categoryName = item.menuItem.category?.name || 'Uncategorized';
      if (!uniqueItemsPerCategory[categoryName]) {
        uniqueItemsPerCategory[categoryName] = new Set();
      }
      uniqueItemsPerCategory[categoryName].add(item.menuItemId);
    });

    Object.keys(categoryStats).forEach((categoryName) => {
      categoryStats[categoryName].itemCount = uniqueItemsPerCategory[categoryName]?.size || 0;
    });

    const categoryPerformance = Object.values(categoryStats).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Course type breakdown
    const courseStats: {
      [key: string]: {
        quantitySold: number;
        revenue: number;
      };
    } = {};

    orderItems.forEach((item) => {
      const courseType = item.courseType;
      if (!courseStats[courseType]) {
        courseStats[courseType] = {
          quantitySold: 0,
          revenue: 0,
        };
      }

      courseStats[courseType].quantitySold += item.quantity;
      courseStats[courseType].revenue += item.totalPrice;
    });

    // Total metrics
    const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const uniqueItemsSold = new Set(orderItems.map((item) => item.menuItemId)).size;

    // Slow movers (items with low sales)
    const slowMovers = Object.values(itemStats)
      .sort((a, b) => a.quantitySold - b.quantitySold)
      .slice(0, limit);

    return successResponse({
      period: {
        from: dateFrom.toISOString().split('T')[0],
        to: dateTo.toISOString().split('T')[0],
        type: period,
      },
      summary: {
        totalItemsSold,
        totalRevenue,
        uniqueItemsSold,
        averageItemPrice: totalItemsSold > 0 ? totalRevenue / totalItemsSold : 0,
      },
      topSellersByQuantity,
      topSellersByRevenue,
      categoryPerformance,
      courseBreakdown: courseStats,
      slowMovers,
    });
  } catch (error) {
    console.error('Error fetching items report:', error);
    return serverErrorResponse('Failed to fetch items report');
  }
}
