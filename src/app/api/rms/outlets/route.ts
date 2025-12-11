import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/outlets - Get all outlets for a vendor
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId') || 'vendor-1';
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [outlets, total] = await Promise.all([
      prisma.outlet.findMany({
        where: { vendorId },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              tables: true,
              floors: true,
              reservations: true,
            },
          },
          vendor: {
            select: {
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.outlet.count({ where: { vendorId } }),
    ]);

    const response = paginatedResponse(outlets, total, page, limit);
    return successResponse(response);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    return errorResponse('Failed to fetch outlets', 500);
  }
}

// POST /api/rms/outlets - Create a new outlet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId = 'vendor-1',
      name,
      code,
      address,
      latitude,
      longitude,
      phone,
      email,
      timezone = 'Asia/Kolkata',
      currency = 'INR',
      openingTime,
      closingTime,
      isOpen = true,
      taxRate = 5,
      serviceChargeRate = 0,
      settings,
    } = body;

    // Validation
    if (!name || !code || !address || latitude === undefined || longitude === undefined) {
      return errorResponse('Missing required fields: name, code, address, latitude, longitude', 400);
    }

    if (!openingTime || !closingTime) {
      return errorResponse('Missing required fields: openingTime, closingTime', 400);
    }

    // Check if code already exists
    const existingOutlet = await prisma.outlet.findUnique({
      where: { code },
    });

    if (existingOutlet) {
      return errorResponse('Outlet with this code already exists', 400);
    }

    const outlet = await prisma.outlet.create({
      data: {
        vendorId,
        name,
        code,
        address,
        latitude,
        longitude,
        phone,
        email,
        timezone,
        currency,
        openingTime,
        closingTime,
        isOpen,
        taxRate,
        serviceChargeRate,
        settings,
      },
      include: {
        _count: {
          select: {
            tables: true,
            floors: true,
            reservations: true,
          },
        },
      },
    });

    return successResponse(outlet, 'Outlet created successfully', 201);
  } catch (error) {
    console.error('Error creating outlet:', error);
    return errorResponse('Failed to create outlet', 500);
  }
}
