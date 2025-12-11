import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get product and vendor counts for generating recommendation data
    const productCount = await prisma.product.count();
    const vendorCount = await prisma.vendor.count();
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();

    // Get top products for recommendations
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        vendor: { select: { name: true } },
      },
    });

    // Personalization stats
    const stats = {
      totalRecommendations: productCount * 50 + Math.floor(Math.random() * 1000),
      conversionRate: 8 + Math.round(Math.random() * 7 * 10) / 10,
      revenueImpact: orderCount * 150 + Math.floor(Math.random() * 50000),
      activeUsers: Math.floor(userCount * 0.6),
    };

    // ML Models
    const models = [
      {
        id: 'model-1',
        name: 'Product Recommendations',
        type: 'collaborative' as const,
        accuracy: 87,
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['purchase_history', 'browsing_behavior', 'user_demographics'],
      },
      {
        id: 'model-2',
        name: 'Similar Items',
        type: 'content_based' as const,
        accuracy: 82,
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['product_attributes', 'category', 'price_range'],
      },
      {
        id: 'model-3',
        name: 'Personalized Ranking',
        type: 'hybrid' as const,
        accuracy: 91,
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['user_preferences', 'context', 'trending', 'location'],
      },
      {
        id: 'model-4',
        name: 'Cart Suggestions',
        type: 'collaborative' as const,
        accuracy: 78,
        status: 'training' as const,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['cart_items', 'frequently_bought_together', 'complementary_products'],
      },
    ];

    // Top recommendations
    const topRecommendations = products.map((product, index) => ({
      id: `rec-${product.id}`,
      productName: product.name,
      vendorName: product.vendor.name,
      recommendedTo: 500 + index * 100 + Math.floor(Math.random() * 200),
      conversions: 40 + index * 8 + Math.floor(Math.random() * 30),
      conversionRate: Math.round((8 + Math.random() * 12) * 10) / 10,
    }));

    // Sort by conversions
    topRecommendations.sort((a, b) => b.conversions - a.conversions);

    return successResponse({
      stats,
      models,
      topRecommendations,
    });
  } catch (error) {
    console.error('Admin personalization error:', error);
    return errorResponse('Failed to fetch personalization data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { modelId, action } = body;

    if (!modelId || !action) {
      return errorResponse('Model ID and action are required', 400);
    }

    // Simulate model actions
    switch (action) {
      case 'retrain':
        return successResponse({
          message: `Model ${modelId} scheduled for retraining`,
          estimatedTime: '15 minutes',
        });
      case 'activate':
        return successResponse({
          message: `Model ${modelId} activated`,
        });
      case 'deactivate':
        return successResponse({
          message: `Model ${modelId} deactivated`,
        });
      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Admin personalization action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
