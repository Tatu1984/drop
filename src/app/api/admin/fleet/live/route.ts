import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get all riders with location data
    const riders = await prisma.rider.findMany({
      where: {
        documentVerified: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        vehicleType: true,
        vehicleNumber: true,
        isOnline: true,
        isAvailable: true,
        currentLat: true,
        currentLng: true,
        assignedZone: true,
        rating: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          where: {
            status: {
              in: ['PICKED_UP', 'OUT_FOR_DELIVERY'],
            },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            currentLat: true,
            currentLng: true,
            vendor: {
              select: {
                name: true,
                latitude: true,
                longitude: true,
              },
            },
            address: {
              select: {
                fullAddress: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    // Get zones for map overlay
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        polygon: true,
        deliveryFee: true,
      },
    });

    // Get active orders without assigned riders
    const unassignedOrders = await prisma.order.findMany({
      where: {
        riderId: null,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'],
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        vendor: {
          select: {
            name: true,
            latitude: true,
            longitude: true,
          },
        },
        address: {
          select: {
            fullAddress: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      take: 50,
    });

    // Format rider data
    const formattedRiders = riders.map(rider => ({
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      avatar: rider.avatar,
      vehicle: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber,
      status: !rider.isOnline ? 'offline' : !rider.isAvailable ? 'busy' : 'online',
      lat: rider.currentLat || 12.9716 + (Math.random() - 0.5) * 0.1, // Fallback with slight randomization for demo
      lng: rider.currentLng || 77.5946 + (Math.random() - 0.5) * 0.1,
      zone: rider.assignedZone,
      rating: rider.rating,
      totalDeliveries: rider._count.orders,
      activeOrder: rider.orders[0] ? {
        id: rider.orders[0].id,
        orderNumber: rider.orders[0].orderNumber,
        status: rider.orders[0].status,
        pickup: {
          name: rider.orders[0].vendor?.name,
          lat: rider.orders[0].vendor?.latitude,
          lng: rider.orders[0].vendor?.longitude,
        },
        dropoff: {
          address: rider.orders[0].address?.fullAddress,
          lat: rider.orders[0].address?.latitude,
          lng: rider.orders[0].address?.longitude,
        },
      } : null,
    }));

    // Calculate stats
    const stats = {
      totalRiders: riders.length,
      online: formattedRiders.filter(r => r.status === 'online').length,
      busy: formattedRiders.filter(r => r.status === 'busy').length,
      offline: formattedRiders.filter(r => r.status === 'offline').length,
      unassignedOrders: unassignedOrders.length,
    };

    return successResponse({
      riders: formattedRiders,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        polygon: z.polygon,
        deliveryFee: z.deliveryFee,
      })),
      unassignedOrders: unassignedOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        vendor: {
          name: order.vendor?.name,
          lat: order.vendor?.latitude,
          lng: order.vendor?.longitude,
        },
        dropoff: {
          address: order.address?.fullAddress,
          lat: order.address?.latitude,
          lng: order.address?.longitude,
        },
      })),
      stats,
    });
  } catch (error) {
    console.error('Live fleet error:', error);
    return errorResponse('Failed to fetch live fleet data', 500);
  }
}
