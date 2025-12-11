import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET - Search guest by phone or email for quick lookup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    if (!phone && !email) {
      return errorResponse('Phone or email is required for search', 400);
    }

    // Search for guest by phone or email
    const guest = await prisma.guestProfile.findFirst({
      where: {
        vendorId,
        OR: [
          phone ? { phone } : {},
          email ? { email } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
      include: {
        reservations: {
          take: 5,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            timeSlot: true,
            guestCount: true,
            status: true,
            occasion: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        feedbacks: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            overallRating: true,
            comments: true,
            createdAt: true,
          },
        },
      },
    });

    if (!guest) {
      return errorResponse('Guest not found', 404);
    }

    return successResponse(guest, 'Guest found successfully');
  } catch (error) {
    console.error('Guest search error:', error);
    return errorResponse('Failed to search guest', 500);
  }
}
