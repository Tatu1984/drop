import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Get wallet balance and transactions
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Get wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
    });

    // Create wallet if not exists
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.userId,
          balance: 0,
        },
      });
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return successResponse({
      balance: wallet.balance,
      transactions: paginatedResponse(transactions, total, page, limit),
    });
  } catch (error) {
    console.error('Wallet API error:', error);
    return errorResponse('Failed to fetch wallet', 500);
  }
}

// Add money to wallet (after payment verification)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { amount, type = 'TOP_UP', description, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return errorResponse('Invalid amount', 400);
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.userId,
          balance: 0,
        },
      });
    }

    // For debit transactions, check balance
    if ((type === 'DEBIT') && wallet.balance < amount) {
      return errorResponse('Insufficient wallet balance', 400);
    }

    // Update balance
    const newBalance = (type === 'CREDIT' || type === 'TOP_UP' || type === 'CASHBACK' || type === 'REFUND')
      ? wallet.balance + amount
      : wallet.balance - amount;

    // Create transaction and update balance
    const [transaction] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: type as 'CREDIT' | 'DEBIT' | 'CASHBACK' | 'REFUND' | 'TOP_UP',
          description: description || getDefaultDescription(type, amount),
          orderId,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
    ]);

    return successResponse({
      balance: newBalance,
      transaction,
      message: type === 'TOP_UP' ? 'Money added successfully' : 'Transaction completed',
    });
  } catch (error) {
    console.error('Wallet transaction error:', error);
    return errorResponse('Transaction failed', 500);
  }
}

function getDefaultDescription(type: string, amount: number): string {
  switch (type) {
    case 'TOP_UP':
      return `Added ₹${amount} to wallet`;
    case 'CREDIT':
      return `Credited ₹${amount}`;
    case 'DEBIT':
      return `Paid ₹${amount}`;
    case 'CASHBACK':
      return `Cashback of ₹${amount}`;
    case 'REFUND':
      return `Refund of ₹${amount}`;
    default:
      return `Transaction of ₹${amount}`;
  }
}
