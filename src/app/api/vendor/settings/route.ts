import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// GET /api/vendor/settings - Get vendor settings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    return successResponse({
      id: vendor.id,
      name: vendor.name,
      description: vendor.description,
      logo: vendor.logo,
      coverImage: vendor.coverImage,
      address: vendor.address,
      latitude: vendor.latitude,
      longitude: vendor.longitude,
      type: vendor.type,
      openingTime: vendor.openingTime,
      closingTime: vendor.closingTime,
      minimumOrder: vendor.minimumOrder,
      avgDeliveryTime: vendor.avgDeliveryTime,
      deliveryRadius: vendor.deliveryRadius,
      rating: vendor.rating,
      totalRatings: vendor.totalRatings,
      isVerified: vendor.isVerified,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
    });
  } catch (error) {
    console.error('Vendor settings GET error:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

// PUT /api/vendor/settings - Update vendor settings
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const body = await request.json();
    const {
      name,
      description,
      logo,
      coverImage,
      address,
      latitude,
      longitude,
      openingTime,
      closingTime,
      minimumOrder,
      avgDeliveryTime,
      deliveryRadius,
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (minimumOrder !== undefined) updateData.minimumOrder = minimumOrder;
    if (avgDeliveryTime !== undefined) updateData.avgDeliveryTime = avgDeliveryTime;
    if (deliveryRadius !== undefined) updateData.deliveryRadius = deliveryRadius;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData,
    });

    return successResponse(updatedVendor, 'Settings updated successfully');
  } catch (error) {
    console.error('Vendor settings PUT error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
