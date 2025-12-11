import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.supplier.count({ where });

    // Fetch suppliers
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            items: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(suppliers, total, page, limit));
  } catch (error) {
    console.error('Suppliers API error:', error);
    return errorResponse('Failed to fetch suppliers', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      name,
      code,
      contactName,
      email,
      phone,
      address,
      paymentTerms,
      leadTime,
      minimumOrder,
      rating,
    } = body;

    // Validate required fields
    if (!vendorId || !name || !code) {
      return errorResponse('Missing required fields: vendorId, name, code', 400);
    }

    // Check for duplicate code
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        vendorId_code: {
          vendorId,
          code,
        },
      },
    });

    if (existingSupplier) {
      return errorResponse('A supplier with this code already exists', 400);
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        vendorId,
        name,
        code,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        paymentTerms: paymentTerms || null,
        leadTime: leadTime || null,
        minimumOrder: minimumOrder || null,
        rating: rating || 0,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            items: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResponse(supplier, 'Supplier created successfully', 201);
  } catch (error) {
    console.error('Create supplier API error:', error);
    return errorResponse('Failed to create supplier', 500);
  }
}
