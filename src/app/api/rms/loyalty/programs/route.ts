import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET - List all loyalty programs
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const isActive = searchParams.get('isActive');

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      vendorId,
    };

    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    // Get total count
    const total = await prisma.loyaltyProgram.count({ where });

    // Fetch loyalty programs
    const programs = await prisma.loyaltyProgram.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            tiers: true,
            rewards: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(programs, total, page, limit));
  } catch (error) {
    console.error('Loyalty programs API error:', error);
    return errorResponse('Failed to fetch loyalty programs', 500);
  }
}

// POST - Create a new loyalty program
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
      name,
      pointsPerCurrency,
      tiers,
      rewards,
      isActive,
    } = body;

    // Validate required fields
    if (!vendorId || !name) {
      return errorResponse('Vendor ID and name are required', 400);
    }

    if (pointsPerCurrency && pointsPerCurrency <= 0) {
      return errorResponse('Points per currency must be greater than 0', 400);
    }

    // Create loyalty program with tiers and rewards
    const program = await prisma.loyaltyProgram.create({
      data: {
        vendorId,
        name,
        pointsPerCurrency: pointsPerCurrency || 1,
        isActive: isActive !== undefined ? isActive : true,
        ...(tiers && tiers.length > 0 && {
          tiers: {
            create: tiers.map((tier: {
              name: string;
              minPoints: number;
              multiplier?: number;
              benefits?: string[];
            }) => ({
              name: tier.name,
              minPoints: tier.minPoints,
              multiplier: tier.multiplier || 1,
              benefits: tier.benefits || [],
            })),
          },
        }),
        ...(rewards && rewards.length > 0 && {
          rewards: {
            create: rewards.map((reward: {
              name: string;
              description?: string;
              pointsCost: number;
              rewardType: string;
              rewardValue: number;
              isActive?: boolean;
            }) => ({
              name: reward.name,
              description: reward.description,
              pointsCost: reward.pointsCost,
              rewardType: reward.rewardType,
              rewardValue: reward.rewardValue,
              isActive: reward.isActive !== undefined ? reward.isActive : true,
            })),
          },
        }),
      },
      include: {
        tiers: {
          orderBy: { minPoints: 'asc' },
        },
        rewards: {
          where: { isActive: true },
        },
      },
    });

    return successResponse(program, 'Loyalty program created successfully', 201);
  } catch (error) {
    console.error('Create loyalty program error:', error);
    return errorResponse('Failed to create loyalty program', 500);
  }
}
