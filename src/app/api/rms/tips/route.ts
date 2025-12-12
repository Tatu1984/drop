import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const shiftType = searchParams.get('shiftType');

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (status) {
      where.status = status;
    }

    if (shiftType) {
      where.shiftType = shiftType;
    }

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.tipPool.count({ where });

    // Fetch tip pools
    const tipPools = await prisma.tipPool.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        allocations: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return successResponse(paginatedResponse(tipPools, total, page, limit));
  } catch (error) {
    console.error('Tips GET error:', error);
    return errorResponse('Failed to fetch tip pools', 500);
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
      date,
      shiftType,
      totalTips,
      allocations, // Array of { employeeId, sharePercent?, amount }
    } = body;

    // Validate required fields
    if (!vendorId || !outletId || !date || !totalTips || !allocations || allocations.length === 0) {
      return errorResponse('Missing required fields: vendorId, outletId, date, totalTips, allocations');
    }

    // Validate allocations sum equals total tips
    const totalAllocated = allocations.reduce((sum: number, alloc: { amount: number }) => sum + alloc.amount, 0);
    if (Math.abs(totalAllocated - totalTips) > 0.01) {
      return errorResponse('Total allocated tips must equal total tips');
    }

    // Create tip pool with allocations in a transaction
    const tipPool = await prisma.$transaction(async (tx) => {
      // Create tip pool
      const pool = await tx.tipPool.create({
        data: {
          vendorId,
          outletId,
          date: new Date(date),
          shiftType: shiftType || null,
          totalTips,
          status: 'DISTRIBUTED',
          distributedAt: new Date(),
        },
      });

      // Create allocations
      const tipAllocations = await Promise.all(
        allocations.map((alloc: { employeeId: string; sharePercent?: number; amount: number }) =>
          tx.tipAllocation.create({
            data: {
              tipPoolId: pool.id,
              employeeId: alloc.employeeId,
              sharePercent: alloc.sharePercent || null,
              amount: alloc.amount,
            },
            include: {
              employee: {
                select: {
                  id: true,
                  employeeCode: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  avatar: true,
                },
              },
            },
          })
        )
      );

      return {
        ...pool,
        allocations: tipAllocations,
      };
    });

    return successResponse(tipPool, 'Tips distributed successfully', 201);
  } catch (error) {
    console.error('Tips POST error:', error);
    return errorResponse('Failed to distribute tips', 500);
  }
}
