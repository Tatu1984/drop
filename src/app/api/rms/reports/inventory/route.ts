import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/rms/reports/inventory - Get inventory valuation and waste report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const reportType = searchParams.get('type') || 'valuation'; // valuation, waste, movement
    const period = searchParams.get('period') || 'month';

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
      default:
        dateFrom.setMonth(dateTo.getMonth() - 1);
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    if (reportType === 'valuation') {
      // Get current inventory
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          outletId,
          isActive: true,
        },
        include: {
          inventoryCategory: true,
        },
      });

      // Calculate total value
      const totalValue = inventoryItems.reduce(
        (sum, item) => sum + item.currentStock * item.averageCost,
        0
      );

      // Group by category
      const categoryValuation: {
        [key: string]: {
          categoryName: string;
          itemCount: number;
          totalValue: number;
          totalQuantity: number;
        };
      } = {};

      inventoryItems.forEach((item) => {
        const categoryName = item.inventoryCategory?.name || 'Uncategorized';
        if (!categoryValuation[categoryName]) {
          categoryValuation[categoryName] = {
            categoryName,
            itemCount: 0,
            totalValue: 0,
            totalQuantity: 0,
          };
        }

        categoryValuation[categoryName].itemCount += 1;
        categoryValuation[categoryName].totalValue += item.currentStock * item.averageCost;
        categoryValuation[categoryName].totalQuantity += item.currentStock;
      });

      // Low stock items
      const lowStockItems = inventoryItems
        .filter((item) => {
          if (!item.reorderPoint) return false;
          return item.currentStock <= item.reorderPoint;
        })
        .map((item) => ({
          id: item.id,
          name: item.name,
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          unit: item.unitOfMeasure,
          value: item.currentStock * item.averageCost,
        }));

      // Out of stock items
      const outOfStockItems = inventoryItems
        .filter((item) => item.currentStock <= 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          lastCost: item.lastCost || item.averageCost,
        }));

      return successResponse({
        reportType: 'valuation',
        summary: {
          totalItems: inventoryItems.length,
          totalValue,
          lowStockItemsCount: lowStockItems.length,
          outOfStockItemsCount: outOfStockItems.length,
        },
        categoryValuation: Object.values(categoryValuation),
        lowStockItems,
        outOfStockItems,
      });
    } else if (reportType === 'waste') {
      // Get waste logs
      const wasteLogs = await prisma.wasteLog.findMany({
        where: {
          outletId,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          items: true,
          loggedBy: true,
        },
      });

      const totalWasteValue = wasteLogs.reduce((sum, log) => sum + log.totalValue, 0);
      const totalWasteItems = wasteLogs.reduce((sum, log) => sum + log.items.length, 0);

      // Waste by reason
      const wasteByReason: { [key: string]: { count: number; value: number } } = {};

      wasteLogs.forEach((log) => {
        log.items.forEach((item) => {
          if (!wasteByReason[item.reason]) {
            wasteByReason[item.reason] = { count: 0, value: 0 };
          }
          wasteByReason[item.reason].count += 1;
          wasteByReason[item.reason].value += item.value;
        });
      });

      // Top wasted items
      const itemWaste: {
        [key: string]: {
          itemName: string;
          quantity: number;
          unit: string;
          value: number;
        };
      } = {};

      wasteLogs.forEach((log) => {
        log.items.forEach((item) => {
          const key = item.itemName;
          if (!itemWaste[key]) {
            itemWaste[key] = {
              itemName: item.itemName,
              quantity: 0,
              unit: item.unit,
              value: 0,
            };
          }
          itemWaste[key].quantity += item.quantity;
          itemWaste[key].value += item.value;
        });
      });

      const topWastedItems = Object.values(itemWaste)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Daily waste trend
      const dailyWaste: { [key: string]: number } = {};
      wasteLogs.forEach((log) => {
        const day = log.date.toISOString().split('T')[0];
        dailyWaste[day] = (dailyWaste[day] || 0) + log.totalValue;
      });

      const wasteTrend = Object.entries(dailyWaste).map(([date, value]) => ({
        date,
        value,
      }));

      return successResponse({
        reportType: 'waste',
        period: {
          from: dateFrom.toISOString().split('T')[0],
          to: dateTo.toISOString().split('T')[0],
          type: period,
        },
        summary: {
          totalWasteValue,
          totalWasteItems,
          totalWasteLogs: wasteLogs.length,
          averageWastePerDay:
            wasteTrend.length > 0 ? totalWasteValue / wasteTrend.length : 0,
        },
        wasteByReason,
        topWastedItems,
        wasteTrend,
      });
    } else if (reportType === 'movement') {
      // Get stock movements
      const movements = await prisma.stockMovement.findMany({
        where: {
          inventoryItem: {
            outletId,
          },
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          inventoryItem: true,
          performedBy: true,
        },
      });

      // Movement by type
      const movementByType: {
        [key: string]: {
          count: number;
          totalQuantity: number;
          totalValue: number;
        };
      } = {};

      movements.forEach((movement) => {
        const type = movement.type;
        if (!movementByType[type]) {
          movementByType[type] = { count: 0, totalQuantity: 0, totalValue: 0 };
        }
        movementByType[type].count += 1;
        movementByType[type].totalQuantity += Math.abs(movement.quantity);
        movementByType[type].totalValue += movement.totalCost || 0;
      });

      // Recent movements
      const recentMovements = movements
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20)
        .map((m) => ({
          id: m.id,
          type: m.type,
          itemName: m.inventoryItem.name,
          quantity: m.quantity,
          unit: m.inventoryItem.unitOfMeasure,
          totalCost: m.totalCost,
          performedBy: m.performedBy
            ? `${m.performedBy.firstName} ${m.performedBy.lastName}`
            : 'System',
          createdAt: m.createdAt,
        }));

      return successResponse({
        reportType: 'movement',
        period: {
          from: dateFrom.toISOString().split('T')[0],
          to: dateTo.toISOString().split('T')[0],
          type: period,
        },
        summary: {
          totalMovements: movements.length,
        },
        movementByType,
        recentMovements,
      });
    }

    return errorResponse('Invalid report type', 400);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    return serverErrorResponse('Failed to fetch inventory report');
  }
}
