import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get rider and order counts
    const [totalRiders, onlineRiders, todayOrders] = await Promise.all([
      prisma.rider.count({ where: { documentVerified: true } }),
      prisma.rider.count({ where: { isOnline: true } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
    ]);

    // Define delivery zones (simulated - in production would come from database)
    const zones = [
      {
        id: 'zone-a',
        name: 'Zone A - Downtown',
        area: 'Central Business District',
        ridersAssigned: Math.floor(totalRiders * 0.25),
        ridersActive: Math.floor(onlineRiders * 0.3),
        ordersToday: Math.floor(todayOrders * 0.3),
        avgDeliveryTime: 22,
        demand: 'high' as const,
        status: 'active' as const,
      },
      {
        id: 'zone-b',
        name: 'Zone B - North Side',
        area: 'Residential North',
        ridersAssigned: Math.floor(totalRiders * 0.2),
        ridersActive: Math.floor(onlineRiders * 0.2),
        ordersToday: Math.floor(todayOrders * 0.2),
        avgDeliveryTime: 28,
        demand: 'medium' as const,
        status: 'active' as const,
      },
      {
        id: 'zone-c',
        name: 'Zone C - South Side',
        area: 'Residential South',
        ridersAssigned: Math.floor(totalRiders * 0.2),
        ridersActive: Math.floor(onlineRiders * 0.2),
        ordersToday: Math.floor(todayOrders * 0.18),
        avgDeliveryTime: 30,
        demand: 'medium' as const,
        status: 'active' as const,
      },
      {
        id: 'zone-d',
        name: 'Zone D - East Side',
        area: 'Commercial East',
        ridersAssigned: Math.floor(totalRiders * 0.15),
        ridersActive: Math.floor(onlineRiders * 0.15),
        ordersToday: Math.floor(todayOrders * 0.15),
        avgDeliveryTime: 25,
        demand: 'high' as const,
        status: 'active' as const,
      },
      {
        id: 'zone-e',
        name: 'Zone E - West Side',
        area: 'Industrial West',
        ridersAssigned: Math.floor(totalRiders * 0.1),
        ridersActive: Math.floor(onlineRiders * 0.1),
        ordersToday: Math.floor(todayOrders * 0.1),
        avgDeliveryTime: 35,
        demand: 'low' as const,
        status: 'active' as const,
      },
      {
        id: 'zone-f',
        name: 'Zone F - Suburbs',
        area: 'Outer Suburbs',
        ridersAssigned: Math.floor(totalRiders * 0.1),
        ridersActive: Math.floor(onlineRiders * 0.05),
        ordersToday: Math.floor(todayOrders * 0.07),
        avgDeliveryTime: 45,
        demand: 'low' as const,
        status: 'active' as const,
      },
    ];

    return successResponse({ zones });
  } catch (error) {
    console.error('Admin fleet zones error:', error);
    return errorResponse('Failed to fetch zone data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { name, area, polygon } = body;

    if (!name || !area) {
      return errorResponse('Name and area required', 400);
    }

    // In a real implementation, this would create a zone in the database
    return successResponse({
      message: 'Zone created successfully',
      zone: {
        id: `zone-${Date.now()}`,
        name,
        area,
        polygon,
        ridersAssigned: 0,
        ridersActive: 0,
        ordersToday: 0,
        avgDeliveryTime: 0,
        demand: 'low',
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Admin create zone error:', error);
    return errorResponse('Failed to create zone', 500);
  }
}
