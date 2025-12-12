import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET - Get loyalty program with tiers and rewards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: {
        tiers: {
          orderBy: { minPoints: 'asc' },
        },
        rewards: {
          orderBy: { pointsCost: 'asc' },
        },
      },
    });

    if (!program) {
      return errorResponse('Loyalty program not found', 404);
    }

    return successResponse(program);
  } catch (error) {
    console.error('Get loyalty program error:', error);
    return errorResponse('Failed to fetch loyalty program', 500);
  }
}

// PUT - Update loyalty program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const body = await request.json();
    const {
      name,
      pointsPerCurrency,
      isActive,
      addTiers,
      updateTiers,
      removeTiers,
      addRewards,
      updateRewards,
      removeRewards,
    } = body;

    // Check if program exists
    const existing = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
    });

    if (!existing) {
      return errorResponse('Loyalty program not found', 404);
    }

    // Validate pointsPerCurrency if provided
    if (pointsPerCurrency !== undefined && pointsPerCurrency <= 0) {
      return errorResponse('Points per currency must be greater than 0', 400);
    }

    // Update program using transaction for complex updates
    const updated = await prisma.$transaction(async (tx) => {
      // Update basic program details
      const program = await tx.loyaltyProgram.update({
        where: { id: programId },
        data: {
          ...(name && { name }),
          ...(pointsPerCurrency !== undefined && { pointsPerCurrency }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      // Handle tier operations
      if (addTiers && addTiers.length > 0) {
        await tx.loyaltyProgramTier.createMany({
          data: addTiers.map((tier: {
            name: string;
            minPoints: number;
            multiplier?: number;
            benefits?: string[];
          }) => ({
            programId,
            name: tier.name,
            minPoints: tier.minPoints,
            multiplier: tier.multiplier || 1,
            benefits: tier.benefits || [],
          })),
        });
      }

      if (updateTiers && updateTiers.length > 0) {
        for (const tier of updateTiers) {
          await tx.loyaltyProgramTier.update({
            where: { id: tier.id },
            data: {
              ...(tier.name && { name: tier.name }),
              ...(tier.minPoints !== undefined && { minPoints: tier.minPoints }),
              ...(tier.multiplier !== undefined && { multiplier: tier.multiplier }),
              ...(tier.benefits && { benefits: tier.benefits }),
            },
          });
        }
      }

      if (removeTiers && removeTiers.length > 0) {
        await tx.loyaltyProgramTier.deleteMany({
          where: {
            id: { in: removeTiers },
          },
        });
      }

      // Handle reward operations
      if (addRewards && addRewards.length > 0) {
        await tx.loyaltyReward.createMany({
          data: addRewards.map((reward: {
            name: string;
            description?: string;
            pointsCost: number;
            rewardType: string;
            rewardValue: number;
            isActive?: boolean;
          }) => ({
            programId,
            name: reward.name,
            description: reward.description,
            pointsCost: reward.pointsCost,
            rewardType: reward.rewardType,
            rewardValue: reward.rewardValue,
            isActive: reward.isActive !== undefined ? reward.isActive : true,
          })),
        });
      }

      if (updateRewards && updateRewards.length > 0) {
        for (const reward of updateRewards) {
          await tx.loyaltyReward.update({
            where: { id: reward.id },
            data: {
              ...(reward.name && { name: reward.name }),
              ...(reward.description !== undefined && { description: reward.description }),
              ...(reward.pointsCost !== undefined && { pointsCost: reward.pointsCost }),
              ...(reward.rewardType && { rewardType: reward.rewardType }),
              ...(reward.rewardValue !== undefined && { rewardValue: reward.rewardValue }),
              ...(reward.isActive !== undefined && { isActive: reward.isActive }),
            },
          });
        }
      }

      if (removeRewards && removeRewards.length > 0) {
        await tx.loyaltyReward.deleteMany({
          where: {
            id: { in: removeRewards },
          },
        });
      }

      return program;
    });

    // Fetch updated program with relations
    const programWithRelations = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: {
        tiers: {
          orderBy: { minPoints: 'asc' },
        },
        rewards: {
          orderBy: { pointsCost: 'asc' },
        },
      },
    });

    return successResponse(programWithRelations, 'Loyalty program updated successfully');
  } catch (error) {
    console.error('Update loyalty program error:', error);
    return errorResponse('Failed to update loyalty program', 500);
  }
}
