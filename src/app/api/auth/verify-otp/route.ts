import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyOTP, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createNotification } from '@/lib/notifications';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, name, type = 'user' } = await request.json();

    // Validate input
    if (!phone || !otp) {
      return errorResponse('Phone and OTP are required', 400);
    }

    // Verify OTP
    const verification = verifyOTP(phone, otp);
    if (!verification.valid) {
      return errorResponse(verification.error || 'Invalid OTP', 400);
    }

    let userData;
    let isNewUser = false;

    if (type === 'user') {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { phone },
        include: {
          addresses: true,
          wallet: true,
          subscription: true,
          loyaltyPoints: true,
        },
      });

      if (!user) {
        isNewUser = true;
        // Create new user
        user = await prisma.user.create({
          data: {
            phone,
            name: name || null,
            // Create wallet for new user
            wallet: {
              create: {
                balance: 0,
              },
            },
            // Create loyalty points for new user
            loyaltyPoints: {
              create: {
                points: 0,
                lifetimePoints: 0,
                tier: 'BRONZE',
              },
            },
          },
          include: {
            addresses: true,
            wallet: true,
            subscription: true,
            loyaltyPoints: true,
          },
        });

        // Send welcome notification
        await createNotification(
          user.id,
          'Welcome to Drop!',
          'Thanks for joining. Use code WELCOME50 for 50% off your first order!',
          'SYSTEM'
        );
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        phone: user.phone || undefined,
        type: 'user',
      });

      userData = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isKycVerified: user.isKycVerified,
        isAgeVerified: user.isAgeVerified,
        wallet: user.wallet,
        subscription: user.subscription,
        loyaltyPoints: user.loyaltyPoints,
        addresses: user.addresses,
      };

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return successResponse({
        message: 'Login successful',
        token,
        user: userData,
        isNewUser,
      });
    } else if (type === 'rider') {
      // Find rider
      const rider = await prisma.rider.findUnique({
        where: { phone },
      });

      if (!rider) {
        return errorResponse('Rider account not found. Please register first.', 404);
      }

      // Generate token
      const token = generateToken({
        userId: rider.id,
        phone: rider.phone,
        type: 'rider',
      });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('rider-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return successResponse({
        message: 'Login successful',
        token,
        rider: {
          id: rider.id,
          phone: rider.phone,
          name: rider.name,
          avatar: rider.avatar,
          rating: rider.rating,
          isOnline: rider.isOnline,
          documentVerified: rider.documentVerified,
          vehicleType: rider.vehicleType,
          vehicleNumber: rider.vehicleNumber,
        },
      });
    }

    return errorResponse('Invalid account type', 400);
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse('Failed to verify OTP. Please try again.', 500);
  }
}
