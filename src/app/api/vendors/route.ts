import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const rating = searchParams.get('rating');
    const isOpen = searchParams.get('isOpen');
    const sortBy = searchParams.get('sortBy') || 'rating';

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    // Get total count
    const total = await prisma.vendor.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'deliveryTime':
        orderBy = { avgDeliveryTime: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // Fetch vendors
    const vendors = await prisma.vendor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    // Calculate distance if location provided
    let vendorsWithDistance = vendors;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      vendorsWithDistance = vendors.map(v => ({
        ...v,
        distance: calculateDistance(userLat, userLng, v.latitude, v.longitude),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Filter by open status if requested
    if (isOpen === 'true') {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      vendorsWithDistance = vendorsWithDistance.filter(v => {
        return v.openingTime <= currentTime && v.closingTime >= currentTime;
      });
    }

    return successResponse(paginatedResponse(vendorsWithDistance, total, page, limit));
  } catch (error) {
    console.error('Vendors API error:', error);
    return errorResponse('Failed to fetch vendors', 500);
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Return distance in km, rounded to 2 decimals
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
