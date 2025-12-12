import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return errorResponse('PIN is required');
    }

    // Fetch employee with PIN
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        pin: true,
        permissions: true,
        outletId: true,
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!employee) {
      return notFoundResponse('Employee not found');
    }

    if (!employee.isActive) {
      return unauthorizedResponse('Employee account is inactive');
    }

    if (!employee.pin) {
      return errorResponse('PIN not set for this employee');
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, employee.pin);

    if (!isPinValid) {
      return unauthorizedResponse('Invalid PIN');
    }

    // Remove PIN from response
    const { pin: _, ...employeeData } = employee;

    return successResponse(
      {
        employee: employeeData,
        accessGranted: true,
      },
      'PIN verified successfully'
    );
  } catch (error) {
    console.error('PIN verification error:', error);
    return errorResponse('Failed to verify PIN', 500);
  }
}
