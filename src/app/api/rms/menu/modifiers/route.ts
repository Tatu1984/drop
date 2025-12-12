import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/menu/modifiers - Get all modifier groups
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('vendorId is required', 400);
    }

    const where: any = {
      vendorId,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [modifierGroups, total] = await Promise.all([
      prisma.modifierGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        include: {
          modifiers: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          menuItemLinks: {
            select: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.modifierGroup.count({ where }),
    ]);

    return successResponse(paginatedResponse(modifierGroups, total, page, limit));
  } catch (error) {
    console.error('Error fetching modifier groups:', error);
    return serverErrorResponse('Failed to fetch modifier groups');
  }
}

// POST /api/rms/menu/modifiers - Create a new modifier group with modifiers
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
      name,
      minSelections = 0,
      maxSelections = 1,
      isRequired = false,
      modifiers = [],
    } = body;

    if (!vendorId || !name) {
      return errorResponse('vendorId and name are required', 400);
    }

    // Validate modifiers array
    if (modifiers.length > 0) {
      for (const modifier of modifiers) {
        if (!modifier.name) {
          return errorResponse('Each modifier must have a name', 400);
        }
      }
    }

    // Create modifier group with modifiers
    const modifierGroup = await prisma.modifierGroup.create({
      data: {
        vendorId,
        name,
        minSelections,
        maxSelections,
        isRequired,
        modifiers: {
          create: modifiers.map((modifier: any, index: number) => ({
            name: modifier.name,
            price: modifier.price || 0,
            isDefault: modifier.isDefault || false,
            isActive: modifier.isActive !== undefined ? modifier.isActive : true,
            sortOrder: modifier.sortOrder !== undefined ? modifier.sortOrder : index,
          })),
        },
      },
      include: {
        modifiers: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return successResponse(modifierGroup, 'Modifier group created successfully', 201);
  } catch (error) {
    console.error('Error creating modifier group:', error);
    return serverErrorResponse('Failed to create modifier group');
  }
}
