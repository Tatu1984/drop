import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/vendor/menu - Get vendor's menu items
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isAvailable = searchParams.get('isAvailable');
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const where: any = { vendorId: vendor.id };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse(paginatedResponse(products, total, page, limit));
  } catch (error) {
    console.error('Vendor menu GET error:', error);
    return errorResponse('Failed to fetch menu items', 500);
  }
}

// POST /api/vendor/menu - Create menu item
export async function POST(request: NextRequest) {
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
      price,
      discountPrice,
      categoryId,
      images = [],
      isVeg = true,
      inStock = true,
    } = body;

    if (!name || !price) {
      return errorResponse('Name and price are required', 400);
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price,
        discountPrice,
        categoryId,
        images,
        isVeg,
        inStock,
      },
    });

    return successResponse(product, 'Menu item created successfully', 201);
  } catch (error) {
    console.error('Vendor menu POST error:', error);
    return errorResponse('Failed to create menu item', 500);
  }
}

// PUT /api/vendor/menu - Update menu item
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
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    // Verify product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: { id, vendorId: vendor.id },
    });

    if (!existingProduct) {
      return errorResponse('Product not found', 404);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return successResponse(product, 'Menu item updated successfully');
  } catch (error) {
    console.error('Vendor menu PUT error:', error);
    return errorResponse('Failed to update menu item', 500);
  }
}

// DELETE /api/vendor/menu - Delete menu item
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    // Verify product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: { id, vendorId: vendor.id },
    });

    if (!existingProduct) {
      return errorResponse('Product not found', 404);
    }

    await prisma.product.delete({ where: { id } });

    return successResponse(null, 'Menu item deleted successfully');
  } catch (error) {
    console.error('Vendor menu DELETE error:', error);
    return errorResponse('Failed to delete menu item', 500);
  }
}
