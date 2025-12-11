import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET /api/rms/menu/categories - Get all menu categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuSetId = searchParams.get('menuSetId');
    const parentId = searchParams.get('parentId');
    const isActive = searchParams.get('isActive');

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!menuSetId) {
      return errorResponse('menuSetId is required', 400);
    }

    const where: any = {
      menuSetId,
    };

    if (parentId !== null) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          items: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              isAvailable: true,
            },
          },
          children: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.menuCategory.count({ where }),
    ]);

    return successResponse(paginatedResponse(categories, total, page, limit));
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return serverErrorResponse('Failed to fetch menu categories');
  }
}

// POST /api/rms/menu/categories - Create a new menu category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      menuSetId,
      parentId,
      name,
      description,
      image,
      sortOrder = 0,
      isActive = true,
    } = body;

    if (!menuSetId || !name) {
      return errorResponse('menuSetId and name are required', 400);
    }

    // Verify menu set exists
    const menuSet = await prisma.menuSet.findUnique({
      where: { id: menuSetId },
    });

    if (!menuSet) {
      return errorResponse('Menu set not found', 404);
    }

    // Verify parent category exists if provided
    if (parentId) {
      const parentCategory = await prisma.menuCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return errorResponse('Parent category not found', 404);
      }

      if (parentCategory.menuSetId !== menuSetId) {
        return errorResponse('Parent category must belong to the same menu set', 400);
      }
    }

    const category = await prisma.menuCategory.create({
      data: {
        menuSetId,
        parentId,
        name,
        description,
        image,
        sortOrder,
        isActive,
      },
      include: {
        items: true,
        children: true,
      },
    });

    return successResponse(category, 'Menu category created successfully', 201);
  } catch (error) {
    console.error('Error creating menu category:', error);
    return serverErrorResponse('Failed to create menu category');
  }
}
