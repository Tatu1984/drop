import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        wallet: true,
        subscription: true,
        loyaltyPoints: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    if (!userData) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      ...userData,
      totalOrders: userData._count.orders,
      totalReviews: userData._count.reviews,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const body = await request.json();
    const {
      name,
      email,
      avatar,
      dateOfBirth,
      preferredLanguage,
      cuisinePreferences,
      groceryBrands,
      alcoholPreferences,
    } = body;

    // Validate email uniqueness if changed
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: user.userId },
        },
      });

      if (existingUser) {
        return errorResponse('Email already in use', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        name,
        email,
        avatar,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        preferredLanguage,
        cuisinePreferences,
        groceryBrands,
        alcoholPreferences,
      },
      include: {
        addresses: true,
        wallet: true,
        subscription: true,
        loyaltyPoints: true,
      },
    });

    return successResponse({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
