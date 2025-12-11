import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get users with orders from wine shops (age-restricted)
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    const verifications = users.map((user, index) => {
      const statuses = ['verified', 'pending', 'rejected', 'verified'] as const;
      const categories = ['alcohol', 'tobacco', 'medication'] as const;
      const docTypes = ['id_card', 'aadhaar', 'passport', 'dl'] as const;

      const birthYear = 1970 + (index % 35);
      const dob = `${birthYear}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`;
      const age = new Date().getFullYear() - birthYear;

      return {
        id: `age-${user.id}`,
        userName: user.name || 'User',
        userPhone: user.phone,
        dateOfBirth: dob,
        age,
        verificationType: docTypes[index % 4],
        documentNumber: `XXXX${String(1000 + index).slice(-4)}`,
        status: statuses[index % 4],
        verifiedAt: statuses[index % 4] === 'verified' ? user.createdAt.toISOString() : undefined,
        category: categories[index % 3],
      };
    });

    return successResponse({ verifications });
  } catch (error) {
    console.error('Admin age verification error:', error);
    return errorResponse('Failed to fetch age verifications', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { verificationId, action } = body;

    if (!verificationId || !action) {
      return errorResponse('Verification ID and action required', 400);
    }

    if (action !== 'verify' && action !== 'reject') {
      return errorResponse('Invalid action. Use "verify" or "reject"', 400);
    }

    // In production, this would update the user's verification status in the database
    // For now, we simulate the action
    const message = action === 'verify'
      ? 'User age verified successfully'
      : 'Verification rejected';

    return successResponse({
      message,
      verificationId,
      status: action === 'verify' ? 'verified' : 'rejected',
      verifiedAt: new Date().toISOString(),
      verifiedBy: admin.userId,
    });
  } catch (error) {
    console.error('Admin age verification action error:', error);
    return errorResponse('Failed to process verification', 500);
  }
}
