import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type'); // 'all', 'vendors', 'products'
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Try to get user for personalization
    const { user } = await getCurrentUser(request);

    // Empty query - return suggestions
    if (!query) {
      // Get trending searches
      const trendingSearches = await prisma.searchHistory.groupBy({
        by: ['query'],
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      });

      return successResponse({
        vendors: [],
        products: [],
        suggestions: trendingSearches.map(s => s.query),
        trending: ['Pizza', 'Burger', 'Biryani', 'Chinese', 'Coffee'],
      });
    }

    let vendors: unknown[] = [];
    let products: unknown[] = [];

    // Search vendors
    if (!type || type === 'all' || type === 'vendors') {
      vendors = await prisma.vendor.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          coverImage: true,
          type: true,
          rating: true,
          avgDeliveryTime: true,
          minimumOrder: true,
          latitude: true,
          longitude: true,
        },
      });
    }

    // Search products
    if (!type || type === 'all' || type === 'products') {
      products = await prisma.product.findMany({
        where: {
          inStock: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          vendor: {
            select: { id: true, name: true, logo: true, rating: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      });
    }

    // Save search history if user is logged in
    if (user && query.length >= 2) {
      await prisma.searchHistory.create({
        data: {
          userId: user.userId,
          query,
        },
      }).catch(() => {}); // Ignore errors for search history
    }

    // Get related categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, name: true, icon: true },
    });

    return successResponse({
      vendors,
      products,
      categories,
      totalVendors: vendors.length,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return errorResponse('Search failed', 500);
  }
}

// Get search history
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return successResponse({ history: [] });
    }

    const { action } = await request.json();

    if (action === 'clear') {
      await prisma.searchHistory.deleteMany({
        where: { userId: user.userId },
      });
      return successResponse({ message: 'Search history cleared' });
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      distinct: ['query'],
    });

    return successResponse({ history: history.map(h => h.query) });
  } catch (error) {
    console.error('Search history error:', error);
    return errorResponse('Failed to get search history', 500);
  }
}
