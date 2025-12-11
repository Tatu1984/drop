import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Get vendors with their order totals
    const vendors = await prisma.vendor.findMany({
      where: { isVerified: true },
      include: {
        orders: {
          where: {
            status: 'DELIVERED',
            paymentStatus: 'COMPLETED',
          },
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    // Calculate payouts
    const commissionRates: Record<string, number> = {
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

    const payouts = vendors.map(vendor => {
      const totalAmount = vendor.orders.reduce((sum, o) => sum + o.total, 0);
      const commissionRate = commissionRates[vendor.type] || 10;
      const commission = totalAmount * (commissionRate / 100);
      const netAmount = totalAmount - commission;

      // Simulate status based on amount
      let payoutStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
      if (netAmount > 50000) payoutStatus = 'completed';
      else if (netAmount > 20000) payoutStatus = 'processing';

      return {
        id: `payout-${vendor.id}`,
        vendorName: vendor.name,
        vendorType: vendor.type.replace(/_/g, ' '),
        amount: totalAmount,
        orders: vendor.orders.length,
        commission,
        netAmount,
        period: 'Dec 1-7, 2024',
        status: payoutStatus,
        bankAccount: 'XXXX1234',
        scheduledDate: new Date().toISOString(),
      };
    }).filter(p => p.orders > 0);

    // Filter by status
    const filteredPayouts = status === 'all'
      ? payouts
      : payouts.filter(p => p.status === status);

    return successResponse({ payouts: filteredPayouts });
  } catch (error) {
    console.error('Admin vendor payouts error:', error);
    return errorResponse('Failed to fetch vendor payouts', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { payoutIds, action } = body;

    if (!payoutIds || !action) {
      return errorResponse('Payout IDs and action required', 400);
    }

    // In production, this would process actual payouts
    return successResponse({
      message: `${payoutIds.length} payouts ${action === 'process' ? 'processed' : 'marked'} successfully`,
    });
  } catch (error) {
    console.error('Admin process payouts error:', error);
    return errorResponse('Failed to process payouts', 500);
  }
}
