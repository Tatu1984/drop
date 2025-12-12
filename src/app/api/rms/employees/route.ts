import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';
import { requireRMSAuth } from '@/lib/rms-auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.employee.count({ where });

    // Fetch employees
    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        hireDate: true,
        terminationDate: true,
        hourlyRate: true,
        salary: true,
        isActive: true,
        permissions: true,
        outletId: true,
        createdAt: true,
        updatedAt: true,
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(employees, total, page, limit));
  } catch (error) {
    console.error('Employees GET error:', error);
    return errorResponse('Failed to fetch employees', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
      outletId,
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      hireDate,
      hourlyRate,
      salary,
      permissions,
      pin,
      password,
    } = body;

    // Validate required fields
    if (!vendorId || !firstName || !lastName || !phone || !role) {
      return errorResponse('Missing required fields: vendorId, firstName, lastName, phone, role');
    }

    // Generate employee code
    const lastEmployee = await prisma.employee.findFirst({
      where: { vendorId },
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true },
    });

    let nextNumber = 1;
    if (lastEmployee?.employeeCode) {
      const match = lastEmployee.employeeCode.match(/EMP-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const employeeCode = `EMP-${nextNumber.toString().padStart(3, '0')}`;

    // Hash PIN if provided
    let hashedPin: string | undefined;
    if (pin) {
      hashedPin = await bcrypt.hash(pin, 10);
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        vendorId,
        outletId: outletId || null,
        employeeCode,
        firstName,
        lastName,
        email: email || null,
        phone,
        role,
        department: department || null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        hourlyRate: hourlyRate || null,
        salary: salary || null,
        permissions: permissions || [],
        pin: hashedPin,
        passwordHash,
        isActive: true,
      },
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

    // Remove sensitive data from response
    const { pin: _, passwordHash: __, ...employeeData } = employee;

    return successResponse(employeeData, 'Employee created successfully', 201);
  } catch (error) {
    console.error('Employees POST error:', error);
    return errorResponse('Failed to create employee', 500);
  }
}
