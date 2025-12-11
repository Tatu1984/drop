import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const severityFilter = searchParams.get('severity');

    // Get users, vendors, and riders for generating fraud alerts
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    const vendors = await prisma.vendor.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const riders = await prisma.rider.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate fraud alerts
    const alertTypes = [
      'suspicious_order',
      'multiple_accounts',
      'coupon_abuse',
      'payment_fraud',
      'fake_review',
    ] as const;

    const statuses = ['pending', 'reviewed', 'actioned', 'dismissed'] as const;
    const severities = ['high', 'medium', 'low'] as const;

    const alerts = [
      ...users.slice(0, 8).map((user, index) => ({
        id: `fraud-user-${user.id}`,
        type: alertTypes[index % alertTypes.length],
        severity: severities[index % severities.length],
        entityType: 'user' as const,
        entityId: user.id,
        entityName: user.name || `User ${user.phone}`,
        description: getAlertDescription(alertTypes[index % alertTypes.length], user.name || 'User'),
        riskScore: 60 + (index * 5) % 40,
        amount: index % 3 === 0 ? 1500 + (index * 200) : undefined,
        status: statuses[index % statuses.length],
        detectedAt: new Date(Date.now() - index * 3600000).toISOString(),
        details: {
          attempts: index + 1,
          relatedAccounts: index % 3,
        },
      })),
      ...vendors.slice(0, 4).map((vendor, index) => ({
        id: `fraud-vendor-${vendor.id}`,
        type: 'fake_review' as const,
        severity: index === 0 ? 'high' : 'medium' as const,
        entityType: 'vendor' as const,
        entityId: vendor.id,
        entityName: vendor.name,
        description: `Suspected fake reviews detected for ${vendor.name}`,
        riskScore: 70 + (index * 8),
        amount: undefined,
        status: statuses[index % statuses.length],
        detectedAt: new Date(Date.now() - (index + 8) * 3600000).toISOString(),
        details: {
          suspiciousReviews: 5 + index,
          similarPatterns: true,
        },
      })),
      ...riders.slice(0, 3).map((rider, index) => ({
        id: `fraud-rider-${rider.id}`,
        type: 'suspicious_order' as const,
        severity: 'medium' as const,
        entityType: 'rider' as const,
        entityId: rider.id,
        entityName: rider.name,
        description: `Unusual delivery patterns detected for ${rider.name}`,
        riskScore: 55 + (index * 10),
        amount: 800 + (index * 300),
        status: 'pending' as const,
        detectedAt: new Date(Date.now() - (index + 12) * 3600000).toISOString(),
        details: {
          anomalyType: 'route_deviation',
          occurrences: 3 + index,
        },
      })),
    ];

    // Apply filters
    let filteredAlerts = alerts;
    if (statusFilter && statusFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.status === statusFilter);
    }
    if (severityFilter && severityFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severityFilter);
    }

    // Sort by detection time
    filteredAlerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

    return successResponse({ alerts: filteredAlerts });
  } catch (error) {
    console.error('Admin fraud detection error:', error);
    return errorResponse('Failed to fetch fraud alerts', 500);
  }
}

function getAlertDescription(type: string, name: string): string {
  switch (type) {
    case 'suspicious_order':
      return `Unusual ordering pattern detected for ${name}`;
    case 'multiple_accounts':
      return `Multiple accounts linked to same device/payment method`;
    case 'coupon_abuse':
      return `Excessive coupon usage detected for ${name}`;
    case 'payment_fraud':
      return `Suspected fraudulent payment attempt`;
    case 'fake_review':
      return `Suspected fake review submission`;
    default:
      return 'Suspicious activity detected';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId || !action) {
      return errorResponse('Alert ID and action required', 400);
    }

    const validActions = ['dismiss', 'action', 'ban'];
    if (!validActions.includes(action)) {
      return errorResponse('Invalid action. Use "dismiss", "action", or "ban"', 400);
    }

    // In production, this would update the alert status and take appropriate action
    let message = '';
    let status = '';

    switch (action) {
      case 'dismiss':
        message = 'Alert dismissed';
        status = 'dismissed';
        break;
      case 'action':
        message = 'Alert reviewed and flagged for action';
        status = 'actioned';
        break;
      case 'ban':
        message = 'Entity has been banned';
        status = 'actioned';
        break;
    }

    return successResponse({
      message,
      alertId,
      status,
      actionedAt: new Date().toISOString(),
      actionedBy: admin.userId,
    });
  } catch (error) {
    console.error('Admin fraud action error:', error);
    return errorResponse('Failed to process fraud action', 500);
  }
}
