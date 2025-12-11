import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET - Get guest profile with full visit history
export async function GET(
  request: NextRequest,
  { params }: { params: { guestId: string } }
) {
  try {
    const { guestId } = params;

    const guest = await prisma.guestProfile.findUnique({
      where: { id: guestId },
      include: {
        reservations: {
          orderBy: { date: 'desc' },
          include: {
            table: {
              select: {
                tableNumber: true,
                floor: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            outlet: {
              select: {
                name: true,
              },
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            table: {
              select: {
                tableNumber: true,
              },
            },
            outlet: {
              select: {
                name: true,
              },
            },
          },
        },
        feedbacks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guest) {
      return errorResponse('Guest not found', 404);
    }

    // Calculate lifetime value and metrics
    const lifetimeValue = guest.totalSpend;
    const visitFrequency = guest.totalVisits;
    const averageOrderValue = guest.averageSpend;

    // Get visit dates for recency analysis
    const lastVisitDate = guest.lastVisit;
    const daysSinceLastVisit = lastVisitDate
      ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Aggregate feedback ratings
    const averageFeedbackRating = guest.feedbacks.length > 0
      ? guest.feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / guest.feedbacks.length
      : null;

    const guestWithMetrics = {
      ...guest,
      metrics: {
        lifetimeValue,
        visitFrequency,
        averageOrderValue,
        daysSinceLastVisit,
        averageFeedbackRating,
      },
    };

    return successResponse(guestWithMetrics);
  } catch (error) {
    console.error('Get guest profile error:', error);
    return errorResponse('Failed to fetch guest profile', 500);
  }
}

// PUT - Update guest profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { guestId: string } }
) {
  try {
    const { guestId } = params;
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dietaryRestrictions,
      allergies,
      preferences,
      birthday,
      anniversary,
      tags,
      vipStatus,
      notes,
      marketingConsent,
      loyaltyTier,
    } = body;

    // Check if guest exists
    const existing = await prisma.guestProfile.findUnique({
      where: { id: guestId },
    });

    if (!existing) {
      return errorResponse('Guest not found', 404);
    }

    // Check for duplicate phone/email if being updated
    if (phone && phone !== existing.phone) {
      const duplicate = await prisma.guestProfile.findFirst({
        where: {
          vendorId: existing.vendorId,
          phone,
          id: { not: guestId },
        },
      });

      if (duplicate) {
        return errorResponse('Another guest with this phone already exists', 409);
      }
    }

    if (email && email !== existing.email) {
      const duplicate = await prisma.guestProfile.findFirst({
        where: {
          vendorId: existing.vendorId,
          email,
          id: { not: guestId },
        },
      });

      if (duplicate) {
        return errorResponse('Another guest with this email already exists', 409);
      }
    }

    // Update guest profile
    const updated = await prisma.guestProfile.update({
      where: { id: guestId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(dietaryRestrictions && { dietaryRestrictions }),
        ...(allergies && { allergies }),
        ...(preferences !== undefined && { preferences }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(anniversary !== undefined && { anniversary: anniversary ? new Date(anniversary) : null }),
        ...(tags && { tags }),
        ...(vipStatus !== undefined && { vipStatus }),
        ...(notes !== undefined && { notes }),
        ...(marketingConsent !== undefined && { marketingConsent }),
        ...(loyaltyTier !== undefined && { loyaltyTier }),
      },
    });

    return successResponse(updated, 'Guest profile updated successfully');
  } catch (error) {
    console.error('Update guest profile error:', error);
    return errorResponse('Failed to update guest profile', 500);
  }
}

// DELETE - Delete guest profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { guestId: string } }
) {
  try {
    const { guestId } = params;

    // Check if guest exists
    const guest = await prisma.guestProfile.findUnique({
      where: { id: guestId },
      include: {
        _count: {
          select: {
            orders: true,
            reservations: true,
          },
        },
      },
    });

    if (!guest) {
      return errorResponse('Guest not found', 404);
    }

    // Optionally, prevent deletion if guest has orders/reservations
    // Uncomment if you want to enforce this business rule:
    // if (guest._count.orders > 0 || guest._count.reservations > 0) {
    //   return errorResponse('Cannot delete guest with existing orders or reservations', 400);
    // }

    // Delete guest profile (cascade will handle related records based on schema)
    await prisma.guestProfile.delete({
      where: { id: guestId },
    });

    return successResponse(null, 'Guest profile deleted successfully');
  } catch (error) {
    console.error('Delete guest profile error:', error);
    return errorResponse('Failed to delete guest profile', 500);
  }
}
