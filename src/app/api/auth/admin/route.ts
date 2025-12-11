import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken, hashPassword, verifyPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (action === 'register') {
      // Only allow registration in development or by super admin
      if (process.env.NODE_ENV !== 'development') {
        return errorResponse('Registration not allowed', 403);
      }

      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        return errorResponse('Admin already exists', 400);
      }

      const hashedPassword = await hashPassword(password);
      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0],
          role: 'ADMIN',
        },
      });

      return successResponse({
        message: 'Admin created successfully',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    }

    // Login
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return errorResponse('Invalid credentials', 401);
    }

    if (!admin.isActive) {
      return errorResponse('Account is disabled', 403);
    }

    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      type: 'admin',
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        entity: 'admin',
        entityId: admin.id,
        details: {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    return successResponse({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}
