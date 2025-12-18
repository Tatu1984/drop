import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, verifyPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/vendor/login - Vendor login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    if (!password) {
      return errorResponse('Password is required', 400);
    }

    if (!email && !phone) {
      return errorResponse('Email or phone is required', 400);
    }

    // Find vendor by email or phone
    const vendor = await prisma.vendor.findFirst({
      where: email
        ? { email }
        : { phone },
    });

    if (!vendor) {
      return errorResponse('Invalid credentials', 401);
    }

    // Verify password
    if (!vendor.password) {
      return errorResponse('Invalid credentials', 401);
    }

    const isValidPassword = await verifyPassword(password, vendor.password);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return errorResponse('Your account is inactive. Please contact support.', 403);
    }

    // Generate token
    const token = generateToken({
      userId: vendor.id,
      email: vendor.email || undefined,
      phone: vendor.phone || undefined,
      type: 'vendor',
    });

    return successResponse({
      token,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        logo: vendor.logo,
        type: vendor.type,
        isVerified: vendor.isVerified,
        isActive: vendor.isActive,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Vendor login error:', error);
    return errorResponse('Failed to login', 500);
  }
}
