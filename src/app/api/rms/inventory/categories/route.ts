import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const parentId = searchParams.get('parentId');
    const includeChildren = searchParams.get('includeChildren') === 'true';

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (parentId === 'null' || parentId === null) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    // Get total count
    const total = await prisma.inventoryCategory.count({ where });

    // Fetch categories
    const categories = await prisma.inventoryCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        parent: true,
        children: includeChildren,
        _count: {
          select: { items: true },
        },
      },
    });

    return successResponse(paginatedResponse(categories, total, page, limit));
  } catch (error) {
    console.error('Inventory categories API error:', error);
    return errorResponse('Failed to fetch inventory categories', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, name, parentId } = body;

    // Validate required fields
    if (!vendorId || !name) {
      return errorResponse('Missing required fields: vendorId, name', 400);
    }

    // Create inventory category
    const category = await prisma.inventoryCategory.create({
      data: {
        vendorId,
        name,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        _count: {
          select: { items: true },
        },
      },
    });

    return successResponse(category, 'Inventory category created successfully', 201);
  } catch (error) {
    console.error('Create inventory category API error:', error);
    return errorResponse('Failed to create inventory category', 500);
  }
}
