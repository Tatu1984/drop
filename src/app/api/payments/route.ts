import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/razorpay';

// Create payment order
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { orderId, amount, type = 'order' } = await request.json();

    if (!amount || amount <= 0) {
      return errorResponse('Invalid amount', 400);
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount,
      receipt: orderId || `rcpt_${Date.now()}`,
      notes: {
        userId: user.userId,
        orderId: orderId || '',
        type,
      },
    });

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return errorResponse('Failed to create payment order', 500);
  }
}

// Verify payment
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      type = 'order',
    } = await request.json();

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return errorResponse('Invalid payment signature', 400);
    }

    if (type === 'order' && orderId) {
      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });

      // Add to order status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          note: 'Payment received',
        },
      });
    } else if (type === 'wallet') {
      // Top up wallet - fetch actual amount from Razorpay for security
      const { fetchPayment } = await import('@/lib/razorpay');

      // Fetch payment from Razorpay to get verified amount
      const razorpayOrderDetails = await fetchPayment(razorpayPaymentId);
      const verifiedAmount = razorpayOrderDetails.amount; // Amount in paise from Razorpay

      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.userId },
      });

      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: verifiedAmount / 100 }, // Convert from paise
          },
        });

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: verifiedAmount / 100,
            type: 'TOP_UP',
            description: `Wallet top-up via Razorpay (Payment: ${razorpayPaymentId})`,
          },
        });
      }
    }

    return successResponse({
      message: 'Payment verified successfully',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return errorResponse('Failed to verify payment', 500);
  }
}
