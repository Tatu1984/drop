import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter based on KYC verification
    if (status !== 'all') {
      if (status === 'verified') where.isKycVerified = true;
      else if (status === 'unverified') where.isKycVerified = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, total: true },
          },
          addresses: { take: 1, where: { isDefault: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      status: user.isKycVerified ? 'verified' : 'active',
      orders: user._count.orders,
      spent: user.orders.reduce((sum, o) => sum + o.total, 0),
      joinedAt: user.createdAt,
      lastOrder: user.orders[0]?.createdAt || null,
      address: user.addresses[0]?.fullAddress || null,
      isKycVerified: user.isKycVerified,
      isAgeVerified: user.isAgeVerified,
    }));

    return successResponse({
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { userId, action } = body;

    // Create new user
    if (action === 'create') {
      const { name, phone, email } = body;

      if (!name || !phone) {
        return errorResponse('Name and phone are required', 400);
      }

      // Check if phone already exists
      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        return errorResponse('A user with this phone number already exists', 400);
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          isKycVerified: false,
          isAgeVerified: false,
        },
      });

      return successResponse({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
        }
      });
    }

    if (!userId || !action) {
      return errorResponse('User ID and action required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (action === 'verify-kyc') {
      await prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: true },
      });
      return successResponse({ message: 'User KYC verified successfully' });
    }

    if (action === 'revoke-kyc') {
      await prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: false },
      });
      return successResponse({ message: 'User KYC revoked' });
    }

    if (action === 'verify-age') {
      await prisma.user.update({
        where: { id: userId },
        data: { isAgeVerified: true },
      });
      return successResponse({ message: 'User age verified successfully' });
    }

    if (action === 'revoke-age') {
      await prisma.user.update({
        where: { id: userId },
        data: { isAgeVerified: false },
      });
      return successResponse({ message: 'User age verification revoked' });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin user action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return errorResponse('User ID required', 400);
    }

    await prisma.user.delete({ where: { id: userId } });
    return successResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
