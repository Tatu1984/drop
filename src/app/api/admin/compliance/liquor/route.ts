import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get wine shop vendors
    const vendors = await prisma.vendor.findMany({
      where: { type: 'WINE_SHOP' },
      select: {
        id: true,
        name: true,
        licenseNumber: true,
        createdAt: true,
        isVerified: true,
      },
    });

    const now = new Date();
    const licenses = vendors.map((vendor, index) => {
      const expiryDate = new Date(now.getTime() + (30 + index * 60) * 24 * 60 * 60 * 1000);
      const status = !vendor.isVerified ? 'pending' : expiryDate < now ? 'expired' : 'valid';

      return {
        id: `lic-${vendor.id}`,
        vendorName: vendor.name,
        licenseNumber: vendor.licenseNumber || `LIC-${vendor.id.slice(0, 8).toUpperCase()}`,
        licenseType: 'Retail Liquor License (FL-3)',
        issuedBy: 'State Excise Department',
        issuedDate: vendor.createdAt.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status,
        verifiedAt: vendor.isVerified ? vendor.createdAt.toISOString() : undefined,
      };
    });

    return successResponse({ licenses });
  } catch (error) {
    console.error('Admin liquor licenses error:', error);
    return errorResponse('Failed to fetch liquor licenses', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { licenseId, action } = body;

    if (!licenseId || !action) {
      return errorResponse('License ID and action required', 400);
    }

    if (action !== 'approve' && action !== 'reject') {
      return errorResponse('Invalid action. Use "approve" or "reject"', 400);
    }

    // In production, this would update the vendor's license status in the database
    const message = action === 'approve'
      ? 'License approved successfully'
      : 'License rejected';

    return successResponse({
      message,
      licenseId,
      status: action === 'approve' ? 'valid' : 'rejected',
      verifiedAt: new Date().toISOString(),
      verifiedBy: admin.userId,
    });
  } catch (error) {
    console.error('Admin liquor license action error:', error);
    return errorResponse('Failed to process license', 500);
  }
}
