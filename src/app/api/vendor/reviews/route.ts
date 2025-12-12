import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/vendor/reviews - Get vendor's reviews
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (!user || user.type !== 'vendor') {
      return unauthorizedResponse(error || 'Vendor access required');
    }

    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const hasReply = searchParams.get('hasReply');
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { id: user.userId },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const where: Record<string, unknown> = { vendorId: vendor.id };

    if (rating) {
      where.rating = parseInt(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { vendorId: vendor.id },
      _count: true,
    });

    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
    };
    ratingDistribution.forEach(r => {
      distribution[r.rating as keyof typeof distribution] = r._count;
    });

    const avgRating = total > 0
      ? Object.entries(distribution).reduce((sum, [rating, count]) => sum + parseInt(rating) * count, 0) / total
      : 0;

    return successResponse({
      ...paginatedResponse(reviews, total, page, limit),
      stats: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: total,
        distribution,
      },
    });
  } catch (error) {
    console.error('Vendor reviews GET error:', error);
    return errorResponse('Failed to fetch reviews', 500);
  }
}

// Note: Review reply functionality would require adding 'reply' and 'repliedAt' fields to the Review model
// POST endpoint removed - schema doesn't support replies yet
