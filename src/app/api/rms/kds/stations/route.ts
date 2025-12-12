import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/rms/kds/stations - Get all KDS stations for outlet
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get('outletId');

    if (!outletId) {
      return errorResponse('outletId is required', 400);
    }

    const stations = await prisma.kDSStation.findMany({
      where: {
        outletId,
        isActive: true,
      },
      include: {
        routingRules: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  in: ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return successResponse(stations);
  } catch (error) {
    console.error('Error fetching KDS stations:', error);
    return errorResponse('Failed to fetch KDS stations', 500);
  }
}

// POST /api/rms/kds/stations - Create new KDS station
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      outletId,
      name,
      stationType,
      displayOrder,
      defaultPrepTime,
      alertThreshold,
      routingRules = [],
    } = body;

    // Validation
    if (!outletId || !name || !stationType) {
      return errorResponse('outletId, name, and stationType are required', 400);
    }

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      return errorResponse('Outlet not found', 404);
    }

    // Create station
    const station = await prisma.kDSStation.create({
      data: {
        outletId,
        name,
        stationType,
        displayOrder: displayOrder || 0,
        defaultPrepTime: defaultPrepTime || 15,
        alertThreshold: alertThreshold || 10,
      },
      include: {
        routingRules: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create routing rules if provided
    if (routingRules.length > 0) {
      for (const rule of routingRules) {
        const { categoryId, menuItemId } = rule;

        // Validate that at least one is provided
        if (!categoryId && !menuItemId) {
          continue;
        }

        await prisma.kDSRoutingRule.create({
          data: {
            stationId: station.id,
            categoryId: categoryId || null,
            menuItemId: menuItemId || null,
          },
        });
      }
    }

    // Fetch station with updated routing rules
    const updatedStation = await prisma.kDSStation.findUnique({
      where: { id: station.id },
      include: {
        routingRules: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(updatedStation, 'KDS station created successfully', 201);
  } catch (error) {
    console.error('Error creating KDS station:', error);
    return errorResponse('Failed to create KDS station', 500);
  }
}
