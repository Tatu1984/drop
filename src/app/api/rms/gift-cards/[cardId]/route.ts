import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET - Get gift card with transaction history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const { searchParams } = new URL(request.url);
    const cardNumber = searchParams.get('cardNumber');

    let giftCard;

    if (cardNumber) {
      // Look up by card number
      giftCard = await prisma.giftCard.findUnique({
        where: { cardNumber },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } else {
      // Look up by ID
      giftCard = await prisma.giftCard.findUnique({
        where: { id: cardId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!giftCard) {
      return errorResponse('Gift card not found', 404);
    }

    // Check if expired
    const isExpired = giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date();

    return successResponse({
      ...giftCard,
      isExpired,
    });
  } catch (error) {
    console.error('Get gift card error:', error);
    return errorResponse('Failed to fetch gift card', 500);
  }
}

// POST - Redeem gift card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { amount, pin, orderId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return errorResponse('Valid amount is required', 400);
    }

    // Fetch gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: cardId },
    });

    if (!giftCard) {
      return errorResponse('Gift card not found', 404);
    }

    // Verify card is active
    if (!giftCard.isActive) {
      return errorResponse('Gift card is not active', 400);
    }

    // Check expiry
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return errorResponse('Gift card has expired', 400);
    }

    // Verify PIN if provided
    if (pin && giftCard.pin && pin !== giftCard.pin) {
      return errorResponse('Invalid PIN', 401);
    }

    // Check balance
    if (giftCard.currentBalance < amount) {
      return errorResponse('Insufficient balance', 400);
    }

    // Calculate new balance
    const newBalance = giftCard.currentBalance - amount;

    // Update gift card and create transaction in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update gift card balance
      const updated = await tx.giftCard.update({
        where: { id: cardId },
        data: {
          currentBalance: newBalance,
        },
      });

      // Create redemption transaction
      const transaction = await tx.giftCardTransaction.create({
        data: {
          giftCardId: cardId,
          type: 'REDEMPTION',
          amount: -amount,
          balance: newBalance,
          orderId,
        },
      });

      return { giftCard: updated, transaction };
    });

    return successResponse(result, 'Gift card redeemed successfully');
  } catch (error) {
    console.error('Redeem gift card error:', error);
    return errorResponse('Failed to redeem gift card', 500);
  }
}

// PATCH - Update gift card (reload balance, deactivate, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { action, amount } = body;

    // Fetch gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: cardId },
    });

    if (!giftCard) {
      return errorResponse('Gift card not found', 404);
    }

    let result;

    switch (action) {
      case 'reload':
        if (!amount || amount <= 0) {
          return errorResponse('Valid amount is required for reload', 400);
        }

        // Reload balance
        result = await prisma.$transaction(async (tx) => {
          const newBalance = giftCard.currentBalance + amount;

          const updated = await tx.giftCard.update({
            where: { id: cardId },
            data: {
              currentBalance: newBalance,
            },
          });

          const transaction = await tx.giftCardTransaction.create({
            data: {
              giftCardId: cardId,
              type: 'RELOAD',
              amount,
              balance: newBalance,
            },
          });

          return { giftCard: updated, transaction };
        });

        return successResponse(result, 'Gift card reloaded successfully');

      case 'deactivate':
        // Deactivate card
        result = await prisma.giftCard.update({
          where: { id: cardId },
          data: {
            isActive: false,
          },
        });

        return successResponse(result, 'Gift card deactivated successfully');

      case 'activate':
        // Activate card
        result = await prisma.giftCard.update({
          where: { id: cardId },
          data: {
            isActive: true,
          },
        });

        return successResponse(result, 'Gift card activated successfully');

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Update gift card error:', error);
    return errorResponse('Failed to update gift card', 500);
  }
}
