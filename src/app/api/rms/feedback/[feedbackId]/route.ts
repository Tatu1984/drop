import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET - Get specific feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const { feedbackId } = params;

    const feedback = await prisma.guestFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        guestProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            vipStatus: true,
            totalVisits: true,
            totalSpend: true,
          },
        },
      },
    });

    if (!feedback) {
      return errorResponse('Feedback not found', 404);
    }

    return successResponse(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    return errorResponse('Failed to fetch feedback', 500);
  }
}

// PATCH - Respond to feedback
export async function PATCH(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const { feedbackId } = params;
    const body = await request.json();
    const { response, respondedByEmployeeId } = body;

    // Validate required fields
    if (!response) {
      return errorResponse('Response is required', 400);
    }

    // Check if feedback exists
    const existing = await prisma.guestFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!existing) {
      return errorResponse('Feedback not found', 404);
    }

    // Update feedback with response
    const updated = await prisma.guestFeedback.update({
      where: { id: feedbackId },
      data: {
        response,
        respondedAt: new Date(),
        respondedByEmployeeId,
      },
      include: {
        guestProfile: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(updated, 'Feedback response submitted successfully');
  } catch (error) {
    console.error('Update feedback error:', error);
    return errorResponse('Failed to update feedback', 500);
  }
}
