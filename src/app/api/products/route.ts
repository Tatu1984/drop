import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isVeg = searchParams.get('isVeg');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'rating';

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    if (isVeg === 'true') {
      where.isVeg = true;
    } else if (isVeg === 'false') {
      where.isVeg = false;
    }

    if (inStock !== 'false') {
      where.inStock = true;
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        vendor: {
          select: { id: true, name: true, logo: true, rating: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    return successResponse(paginatedResponse(products, total, page, limit));
  } catch (error) {
    console.error('Products API error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}
