import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const type = searchParams.get('type');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      vendorId,
    };

    if (type) {
      where.type = type.toUpperCase();
    }

    if (channel) {
      where.channel = channel.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get total count
    const total = await prisma.campaign.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'createdAt':
        orderBy = { createdAt: 'desc' };
        break;
      case 'scheduledAt':
        orderBy = { scheduledAt: 'desc' };
        break;
      case 'totalSent':
        orderBy = { totalSent: 'desc' };
        break;
      case 'totalOpened':
        orderBy = { totalOpened: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch campaigns
    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Calculate engagement metrics for each campaign
    const campaignsWithMetrics = campaigns.map(campaign => {
      const openRate = campaign.totalSent > 0
        ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(2)
        : '0.00';
      const clickRate = campaign.totalSent > 0
        ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(2)
        : '0.00';
      const conversionRate = campaign.totalSent > 0
        ? ((campaign.totalConverted / campaign.totalSent) * 100).toFixed(2)
        : '0.00';

      return {
        ...campaign,
        metrics: {
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          conversionRate: parseFloat(conversionRate),
        },
      };
    });

    return successResponse(paginatedResponse(campaignsWithMetrics, total, page, limit));
  } catch (error) {
    console.error('Campaigns API error:', error);
    return errorResponse('Failed to fetch campaigns', 500);
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      name,
      description,
      type,
      channel,
      subject,
      content,
      segmentRules,
      scheduledAt,
      status,
    } = body;

    // Validate required fields
    if (!vendorId || !name || !type || !channel || !content) {
      return errorResponse('Vendor ID, name, type, channel, and content are required', 400);
    }

    // Validate type
    const validTypes = ['PROMOTIONAL', 'BIRTHDAY', 'ANNIVERSARY', 'WIN_BACK', 'FEEDBACK', 'ANNOUNCEMENT'];
    if (!validTypes.includes(type.toUpperCase())) {
      return errorResponse('Invalid campaign type', 400);
    }

    // Validate channel
    const validChannels = ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'];
    if (!validChannels.includes(channel.toUpperCase())) {
      return errorResponse('Invalid campaign channel', 400);
    }

    // Validate status
    const validStatuses = ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return errorResponse('Invalid campaign status', 400);
    }

    // Validate subject for email campaigns
    if (channel.toUpperCase() === 'EMAIL' && !subject) {
      return errorResponse('Subject is required for email campaigns', 400);
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        vendorId,
        name,
        description,
        type: type.toUpperCase(),
        channel: channel.toUpperCase(),
        subject,
        content,
        segmentRules: segmentRules || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: status ? status.toUpperCase() : 'DRAFT',
      },
    });

    return successResponse(campaign, 'Campaign created successfully', 201);
  } catch (error) {
    console.error('Create campaign error:', error);
    return errorResponse('Failed to create campaign', 500);
  }
}

// PATCH - Update campaign status (send, schedule, cancel)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, action, scheduledAt } = body;

    if (!campaignId || !action) {
      return errorResponse('Campaign ID and action are required', 400);
    }

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    let updated;

    switch (action) {
      case 'schedule':
        if (!scheduledAt) {
          return errorResponse('Scheduled date is required', 400);
        }

        updated = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            scheduledAt: new Date(scheduledAt),
            status: 'SCHEDULED',
          },
        });

        return successResponse(updated, 'Campaign scheduled successfully');

      case 'send':
        // This would typically trigger the actual sending process
        // For now, we'll just update the status
        updated = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'SENDING',
            sentAt: new Date(),
          },
        });

        return successResponse(updated, 'Campaign sending initiated');

      case 'cancel':
        if (campaign.status === 'SENT') {
          return errorResponse('Cannot cancel a campaign that has already been sent', 400);
        }

        updated = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'CANCELLED',
          },
        });

        return successResponse(updated, 'Campaign cancelled successfully');

      case 'complete':
        updated = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'SENT',
          },
        });

        return successResponse(updated, 'Campaign marked as sent');

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Update campaign error:', error);
    return errorResponse('Failed to update campaign', 500);
  }
}
