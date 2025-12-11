import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const stockStatus = searchParams.get('stockStatus') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Get the vendor first
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true, type: true },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const where: Record<string, unknown> = {
      vendorId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category !== 'all') {
      where.categoryId = category;
    }

    if (stockStatus === 'in_stock') {
      where.inStock = true;
    } else if (stockStatus === 'out_of_stock') {
      where.inStock = false;
    } else if (stockStatus === 'low_stock') {
      where.stockQuantity = { lte: 10, gt: 0 };
      where.inStock = true;
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [products, total, categories, stats] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { orderItems: true, reviews: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { vendorId },
        select: { id: true, name: true },
      }),
      Promise.all([
        prisma.product.count({ where: { vendorId } }),
        prisma.product.count({ where: { vendorId, inStock: true } }),
        prisma.product.count({ where: { vendorId, inStock: false } }),
        prisma.product.count({ where: { vendorId, stockQuantity: { lte: 10, gt: 0 }, inStock: true } }),
        prisma.product.aggregate({
          where: { vendorId },
          _avg: { price: true },
        }),
      ]),
    ]);

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      images: p.images,
      price: p.price,
      discountPrice: p.discountPrice,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      category: p.category,
      isVeg: p.isVeg,
      isVegan: p.isVegan,
      brand: p.brand,
      packSize: p.packSize,
      rating: p.rating,
      totalRatings: p.totalRatings,
      orderCount: p._count.orderItems,
      reviewCount: p._count.reviews,
      // Wine specific
      abvPercent: p.abvPercent,
      countryOfOrigin: p.countryOfOrigin,
      year: p.year,
      grapeType: p.grapeType,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return successResponse({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        type: vendor.type,
      },
      products: formattedProducts,
      categories,
      stats: {
        total: stats[0],
        inStock: stats[1],
        outOfStock: stats[2],
        lowStock: stats[3],
        avgPrice: stats[4]._avg.price || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin inventory error:', error);
    return errorResponse('Failed to fetch inventory', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { vendorId, ...productData } = body;

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const product = await prisma.product.create({
      data: {
        vendorId,
        name: productData.name,
        description: productData.description,
        images: productData.images || [],
        price: productData.price,
        discountPrice: productData.discountPrice,
        inStock: productData.inStock ?? true,
        stockQuantity: productData.stockQuantity,
        categoryId: productData.categoryId,
        isVeg: productData.isVeg ?? true,
        isVegan: productData.isVegan ?? false,
        brand: productData.brand,
        packSize: productData.packSize,
        dietType: productData.dietType,
        calories: productData.calories,
        allergens: productData.allergens || [],
        // Wine specific
        abvPercent: productData.abvPercent,
        tasteProfile: productData.tasteProfile,
        countryOfOrigin: productData.countryOfOrigin,
        year: productData.year,
        grapeType: productData.grapeType,
        pairings: productData.pairings || [],
        customizations: productData.customizations,
      },
    });

    return successResponse({ product, message: 'Product created successfully' }, undefined, 201);
  } catch (error) {
    console.error('Admin create product error:', error);
    return errorResponse('Failed to create product', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { productId, action, ...updateData } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Handle specific actions
    if (action === 'toggle_stock') {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { inStock: !product.inStock },
      });
      return successResponse({
        product: updated,
        message: `Product marked as ${updated.inStock ? 'in stock' : 'out of stock'}`
      });
    }

    if (action === 'update_stock') {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: updateData.stockQuantity,
          inStock: updateData.stockQuantity > 0,
        },
      });
      return successResponse({ product: updated, message: 'Stock updated successfully' });
    }

    if (action === 'update_price') {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          price: updateData.price,
          discountPrice: updateData.discountPrice,
        },
      });
      return successResponse({ product: updated, message: 'Price updated successfully' });
    }

    // Full product update
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: updateData.name,
        description: updateData.description,
        images: updateData.images,
        price: updateData.price,
        discountPrice: updateData.discountPrice,
        inStock: updateData.inStock,
        stockQuantity: updateData.stockQuantity,
        categoryId: updateData.categoryId,
        isVeg: updateData.isVeg,
        isVegan: updateData.isVegan,
        brand: updateData.brand,
        packSize: updateData.packSize,
        dietType: updateData.dietType,
        calories: updateData.calories,
        allergens: updateData.allergens,
        abvPercent: updateData.abvPercent,
        tasteProfile: updateData.tasteProfile,
        countryOfOrigin: updateData.countryOfOrigin,
        year: updateData.year,
        grapeType: updateData.grapeType,
        pairings: updateData.pairings,
        customizations: updateData.customizations,
      },
    });

    return successResponse({ product: updated, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Admin update product error:', error);
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    await prisma.product.delete({ where: { id: productId } });
    return successResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return errorResponse('Failed to delete product', 500);
  }
}
