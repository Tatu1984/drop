import { NextRequest } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/auth';
import { sendOTPSMS } from '@/lib/notifications';
import { successResponse, errorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { phone, type = 'user' } = await request.json();

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return errorResponse('Invalid phone number. Must be a 10-digit Indian mobile number.', 400);
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(phone, otp);

    // Send OTP via SMS
    const sent = await sendOTPSMS(phone, otp);

    if (!sent) {
      return errorResponse('Failed to send OTP. Please try again.', 500);
    }

    // Check if user exists
    let isNewUser = false;
    if (type === 'user') {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });
      isNewUser = !existingUser;
    }

    // In development, include OTP in response for testing
    const response: Record<string, unknown> = {
      message: 'OTP sent successfully',
      isNewUser,
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
    }

    return successResponse(response);
  } catch (error) {
    console.error('Send OTP error:', error);
    return errorResponse('Failed to send OTP. Please try again later.', 500);
  }
}
