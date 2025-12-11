import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET - List all feedback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const guestProfileId = searchParams.get('guestProfileId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const responded = searchParams.get('responded');
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (guestProfileId) {
      where.guestProfileId = guestProfileId;
    }

    if (minRating) {
      where.overallRating = {
        ...(where.overallRating as object || {}),
        gte: parseInt(minRating),
      };
    }

    if (maxRating) {
      where.overallRating = {
        ...(where.overallRating as object || {}),
        lte: parseInt(maxRating),
      };
    }

    if (responded === 'true') {
      where.respondedAt = { not: null };
    } else if (responded === 'false') {
      where.respondedAt = null;
    }

    // Get total count
    const total = await prisma.guestFeedback.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { overallRating: 'desc' };
        break;
      case 'createdAt':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch feedback
    const feedbacks = await prisma.guestFeedback.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        guestProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            vipStatus: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(feedbacks, total, page, limit));
  } catch (error) {
    console.error('Feedback API error:', error);
    return errorResponse('Failed to fetch feedback', 500);
  }
}

// POST - Create feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestProfileId,
      outletId,
      orderId,
      overallRating,
      foodRating,
      serviceRating,
      ambienceRating,
      comments,
    } = body;

    // Validate required fields
    if (!outletId || !overallRating) {
      return errorResponse('Outlet ID and overall rating are required', 400);
    }

    if (overallRating < 1 || overallRating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    // Validate optional ratings
    if (foodRating && (foodRating < 1 || foodRating > 5)) {
      return errorResponse('Food rating must be between 1 and 5', 400);
    }
    if (serviceRating && (serviceRating < 1 || serviceRating > 5)) {
      return errorResponse('Service rating must be between 1 and 5', 400);
    }
    if (ambienceRating && (ambienceRating < 1 || ambienceRating > 5)) {
      return errorResponse('Ambience rating must be between 1 and 5', 400);
    }

    // Create feedback
    const feedback = await prisma.guestFeedback.create({
      data: {
        guestProfileId,
        outletId,
        orderId,
        overallRating,
        foodRating,
        serviceRating,
        ambienceRating,
        comments,
      },
      include: {
        guestProfile: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(feedback, 'Feedback submitted successfully', 201);
  } catch (error) {
    console.error('Create feedback error:', error);
    return errorResponse('Failed to create feedback', 500);
  }
}
