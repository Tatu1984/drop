import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { inStock: true },
          orderBy: { rating: 'desc' },
          include: {
            category: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
        promotions: {
          where: {
            isActive: true,
            endDate: { gte: new Date() },
          },
        },
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    if (!vendor) {
      return notFoundResponse('Vendor not found');
    }

    // Check if vendor is currently open
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isOpen = vendor.openingTime <= currentTime && vendor.closingTime >= currentTime;

    // Group products by category
    const productsByCategory = vendor.products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Other';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, typeof vendor.products>);

    return successResponse({
      vendor: {
        ...vendor,
        isOpen,
        totalOrders: vendor._count.orders,
        totalReviews: vendor._count.reviews,
      },
      products: vendor.products,
      categories: Object.entries(productsByCategory).map(([name, items]) => ({
        name,
        items,
      })),
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    return errorResponse('Failed to fetch vendor', 500);
  }
}
