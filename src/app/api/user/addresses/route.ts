import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Get user addresses
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.userId },
      orderBy: { isDefault: 'desc' },
    });

    return successResponse({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return errorResponse('Failed to fetch addresses', 500);
  }
}

// Add new address
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const body = await request.json();
    const { label, fullAddress, landmark, latitude, longitude, isDefault } = body;

    if (!label || !fullAddress || latitude === undefined || longitude === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address
    const addressCount = await prisma.address.count({
      where: { userId: user.userId },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.userId,
        label,
        fullAddress,
        landmark,
        latitude,
        longitude,
        isDefault: isDefault || addressCount === 0, // Make first address default
      },
    });

    return successResponse({
      address,
      message: 'Address added successfully',
    }, undefined, 201);
  } catch (error) {
    console.error('Add address error:', error);
    return errorResponse('Failed to add address', 500);
  }
}

// Update address
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const body = await request.json();
    const { id, label, fullAddress, landmark, latitude, longitude, isDefault } = body;

    if (!id) {
      return errorResponse('Address ID is required', 400);
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingAddress) {
      return errorResponse('Address not found', 404);
    }

    // If setting as default, unset other defaults
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label,
        fullAddress,
        landmark,
        latitude,
        longitude,
        isDefault,
      },
    });

    return successResponse({
      address,
      message: 'Address updated successfully',
    });
  } catch (error) {
    console.error('Update address error:', error);
    return errorResponse('Failed to update address', 500);
  }
}

// Delete address
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Address ID is required', 400);
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, make another one default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.userId },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return errorResponse('Failed to delete address', 500);
  }
}
