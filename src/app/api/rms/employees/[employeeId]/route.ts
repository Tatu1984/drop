import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
        shifts: {
          take: 5,
          orderBy: { startTime: 'desc' },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            totalSales: true,
            status: true,
          },
        },
        schedules: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          take: 10,
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!employee) {
      return notFoundResponse('Employee not found');
    }

    // Remove sensitive data
    const { pin, passwordHash, ...employeeData } = employee;

    return successResponse(employeeData);
  } catch (error) {
    console.error('Employee GET error:', error);
    return errorResponse('Failed to fetch employee', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      hireDate,
      terminationDate,
      hourlyRate,
      salary,
      permissions,
      isActive,
      outletId,
      pin,
      password,
    } = body;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existingEmployee) {
      return notFoundResponse('Employee not found');
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department || null;
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate);
    if (terminationDate !== undefined) updateData.terminationDate = terminationDate ? new Date(terminationDate) : null;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate || null;
    if (salary !== undefined) updateData.salary = salary || null;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (outletId !== undefined) updateData.outletId = outletId || null;

    // Hash PIN if provided
    if (pin !== undefined) {
      updateData.pin = pin ? await bcrypt.hash(pin, 10) : null;
    }

    // Hash password if provided
    if (password !== undefined) {
      updateData.passwordHash = password ? await bcrypt.hash(password, 10) : null;
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove sensitive data
    const { pin: _, passwordHash: __, ...employeeData } = employee;

    return successResponse(employeeData, 'Employee updated successfully');
  } catch (error) {
    console.error('Employee PUT error:', error);
    return errorResponse('Failed to update employee', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = params;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return notFoundResponse('Employee not found');
    }

    // Soft delete by setting isActive to false and adding termination date
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: false,
        terminationDate: new Date(),
      },
    });

    return successResponse({ id: employeeId }, 'Employee deleted successfully');
  } catch (error) {
    console.error('Employee DELETE error:', error);
    return errorResponse('Failed to delete employee', 500);
  }
}
