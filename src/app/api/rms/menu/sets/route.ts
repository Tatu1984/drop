import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/menu/sets - Get all menu sets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const isActive = searchParams.get('isActive');

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('vendorId is required', 400);
    }

    const where: any = {
      vendorId,
    };

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [menuSets, total] = await Promise.all([
      prisma.menuSet.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          categories: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
            },
          },
          outletAssignments: {
            where: { isActive: true },
            select: {
              id: true,
              outlet: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.menuSet.count({ where }),
    ]);

    return successResponse(paginatedResponse(menuSets, total, page, limit));
  } catch (error) {
    console.error('Error fetching menu sets:', error);
    return serverErrorResponse('Failed to fetch menu sets');
  }
}

// POST /api/rms/menu/sets - Create a new menu set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      name,
      description,
      isActive = true,
      startTime,
      endTime,
      daysOfWeek,
      validFrom,
      validTo,
    } = body;

    if (!vendorId || !name) {
      return errorResponse('vendorId and name are required', 400);
    }

    const menuSet = await prisma.menuSet.create({
      data: {
        vendorId,
        name,
        description,
        isActive,
        startTime,
        endTime,
        daysOfWeek: daysOfWeek || [],
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
      },
      include: {
        categories: true,
      },
    });

    return successResponse(menuSet, 'Menu set created successfully', 201);
  } catch (error) {
    console.error('Error creating menu set:', error);
    return serverErrorResponse('Failed to create menu set');
  }
}
