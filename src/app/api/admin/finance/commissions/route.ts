import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurants',
  GROCERY: 'Grocery Stores',
  WINE_SHOP: 'Wine & Liquor',
  PHARMACY: 'Pharmacies',
  MEAT_SHOP: 'Meat & Fish',
  MILK_DAIRY: 'Dairy & Milk',
  PET_SUPPLIES: 'Pet Supplies',
  FLOWERS: 'Flowers & Gifts',
  GENERAL_STORE: 'General Stores',
};

const DEFAULT_RATES: Record<string, number> = {
  RESTAURANT: 15,
  GROCERY: 12,
  WINE_SHOP: 10,
  PHARMACY: 8,
  MEAT_SHOP: 12,
  MILK_DAIRY: 10,
  PET_SUPPLIES: 12,
  FLOWERS: 15,
  GENERAL_STORE: 10,
};

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get vendor counts and order stats by category
    const vendorCounts = await prisma.vendor.groupBy({
      by: ['type'],
      _count: true,
      where: { isVerified: true },
    });

    // Get order stats by vendor type
    const orderStats = await prisma.order.groupBy({
      by: ['vendorId'],
      _count: true,
      _sum: { total: true },
      where: { status: 'DELIVERED' },
    });

    // Get vendor types for orders
    const vendorIds = orderStats.map(s => s.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, type: true },
    });

    const vendorTypeMap = new Map(vendors.map(v => [v.id, v.type]));

    // Aggregate by type
    const typeStats: Record<string, { orders: number; total: number }> = {};
    orderStats.forEach(stat => {
      const type = vendorTypeMap.get(stat.vendorId) || 'GENERAL_STORE';
      if (!typeStats[type]) {
        typeStats[type] = { orders: 0, total: 0 };
      }
      typeStats[type].orders += stat._count;
      typeStats[type].total += stat._sum.total || 0;
    });

    // Build commission data
    const commissions = Object.keys(CATEGORY_LABELS).map(category => {
      const vendorCount = vendorCounts.find(v => v.type === category)?._count || 0;
      const stats = typeStats[category] || { orders: 0, total: 0 };
      const commissionRate = DEFAULT_RATES[category];
      const totalCommission = stats.total * (commissionRate / 100);

      return {
        id: category,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        commissionRate,
        vendorCount,
        totalOrders: stats.orders,
        totalCommission,
        avgOrderValue: stats.orders > 0 ? stats.total / stats.orders : 0,
      };
    });

    return successResponse({ commissions });
  } catch (error) {
    console.error('Admin commissions error:', error);
    return errorResponse('Failed to fetch commissions', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { id, rate } = body;

    if (!id || rate === undefined) {
      return errorResponse('Category ID and rate required', 400);
    }

    // In production, this would update the commission rate in the database
    // For now, we'll just return success
    await prisma.systemConfig.upsert({
      where: { key: `commission_${id.toLowerCase()}` },
      update: { value: String(rate) },
      create: { key: `commission_${id.toLowerCase()}`, value: String(rate) },
    });

    return successResponse({
      message: 'Commission rate updated successfully',
      category: id,
      newRate: rate,
    });
  } catch (error) {
    console.error('Admin update commission error:', error);
    return errorResponse('Failed to update commission', 500);
  }
}
