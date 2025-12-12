import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/rms/floors - Get all floors for an outlet
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');

    if (!outletId) {
      return errorResponse('outletId query parameter is required', 400);
    }

    const floors = await prisma.floor.findMany({
      where: { outletId },
      include: {
        _count: {
          select: {
            tables: true,
            zones: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
            color: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse(floors);
  } catch (error) {
    console.error('Error fetching floors:', error);
    return errorResponse('Failed to fetch floors', 500);
  }
}

// POST /api/rms/floors - Create a new floor
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      outletId,
      name,
      sortOrder = 0,
      isActive = true,
    } = body;

    // Validation
    if (!outletId || !name) {
      return errorResponse('Missing required fields: outletId, name', 400);
    }

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      return errorResponse('Outlet not found', 404);
    }

    const floor = await prisma.floor.create({
      data: {
        outletId,
        name,
        sortOrder,
        isActive,
      },
      include: {
        _count: {
          select: {
            tables: true,
            zones: true,
          },
        },
      },
    });

    return successResponse(floor, 'Floor created successfully', 201);
  } catch (error) {
    console.error('Error creating floor:', error);
    return errorResponse('Failed to create floor', 500);
  }
}
