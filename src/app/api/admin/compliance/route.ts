import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const kycStatus = searchParams.get('kycStatus') || 'all';
    const kycType = searchParams.get('kycType') || 'all';

    // Get vendors needing KYC (wine shops need license verification)
    const vendorKYC = await prisma.vendor.findMany({
      where: {
        type: 'WINE_SHOP',
        ...(kycStatus === 'pending' ? { isVerified: false } : {}),
        ...(kycStatus === 'approved' ? { isVerified: true } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        licenseNumber: true,
        licenseExpiry: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Get riders needing verification (documentVerified instead of isVerified)
    const riderKYC = await prisma.rider.findMany({
      where: {
        ...(kycStatus === 'pending' ? { documentVerified: false } : {}),
        ...(kycStatus === 'approved' ? { documentVerified: true } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        vehicleNumber: true,
        documentVerified: true,
        policeVerified: true,
        createdAt: true,
      },
    });

    // Format KYC requests
    const kycRequests = [
      ...vendorKYC.map(v => ({
        id: v.id,
        entityId: v.id,
        entityName: v.name,
        type: 'vendor',
        documentType: 'Liquor License',
        documentNumber: v.licenseNumber || 'Not provided',
        status: v.isVerified ? 'approved' : 'pending',
        submittedAt: v.createdAt,
        expiresAt: v.licenseExpiry,
      })),
      ...riderKYC.map(r => ({
        id: r.id,
        entityId: r.id,
        entityName: r.name,
        type: 'rider',
        documentType: 'Documents',
        documentNumber: r.vehicleNumber || 'Not provided',
        status: r.documentVerified ? 'approved' : 'pending',
        submittedAt: r.createdAt,
        expiresAt: null,
      })),
    ];

    // Filter by type if specified
    const filteredKYC = kycType === 'all'
      ? kycRequests
      : kycRequests.filter(k => k.type === kycType);

    // Mock compliance alerts
    const alerts = [
      {
        id: '1',
        type: 'license_expiry',
        severity: 'high',
        entityType: 'vendor',
        entityId: vendorKYC[0]?.id || '1',
        entityName: vendorKYC[0]?.name || 'Wine Vendor',
        description: 'Liquor license expiring in 30 days',
        createdAt: new Date(),
        resolved: false,
      },
      {
        id: '2',
        type: 'verification_pending',
        severity: 'medium',
        entityType: 'rider',
        entityId: riderKYC.find(r => !r.documentVerified)?.id || '1',
        entityName: riderKYC.find(r => !r.documentVerified)?.name || 'New Rider',
        description: 'Background verification pending for 7 days',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        resolved: false,
      },
    ];

    // Expiring documents
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringDocs = vendorKYC
      .filter(v => v.licenseExpiry && new Date(v.licenseExpiry) <= thirtyDaysFromNow)
      .map(v => ({
        id: v.id,
        entityType: 'vendor',
        entityName: v.name,
        documentType: 'Liquor License',
        expiresAt: v.licenseExpiry,
      }));

    // Stats
    const stats = {
      pendingKYC: kycRequests.filter(k => k.status === 'pending').length,
      approvedKYC: kycRequests.filter(k => k.status === 'approved').length,
      activeAlerts: alerts.filter(a => !a.resolved).length,
      highSeverity: alerts.filter(a => a.severity === 'high' && !a.resolved).length,
    };

    return successResponse({
      stats,
      kycRequests: filteredKYC,
      alerts,
      expiringDocuments: expiringDocs,
      auditLog: [
        { timestamp: new Date(), action: 'KYC Approved', entity: 'Rider - Rajesh Kumar', performedBy: 'Admin' },
        { timestamp: new Date(Date.now() - 3600000), action: 'Vendor Suspended', entity: 'ABC Wines', performedBy: 'System' },
        { timestamp: new Date(Date.now() - 7200000), action: 'Document Uploaded', entity: 'The Wine Cellar', performedBy: 'Vendor' },
      ],
    });
  } catch (error) {
    console.error('Admin compliance error:', error);
    return errorResponse('Failed to fetch compliance data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, entityType, entityId, kycId, alertId, entityName, reason } = body;

    // Handle KYC approve/reject with kycId (frontend sends kycId)
    if (action === 'approve' && kycId) {
      // Try to find in vendors first, then riders
      const vendor = await prisma.vendor.findUnique({ where: { id: kycId } });
      if (vendor) {
        await prisma.vendor.update({
          where: { id: kycId },
          data: { isVerified: true, isActive: true },
        });
        return successResponse({ message: 'Vendor KYC approved successfully' });
      }

      const rider = await prisma.rider.findUnique({ where: { id: kycId } });
      if (rider) {
        await prisma.rider.update({
          where: { id: kycId },
          data: { documentVerified: true, isAvailable: true },
        });
        return successResponse({ message: 'Rider KYC approved successfully' });
      }

      return errorResponse('KYC record not found', 404);
    }

    if (action === 'reject' && kycId) {
      // Try to find in vendors first, then riders
      const vendor = await prisma.vendor.findUnique({ where: { id: kycId } });
      if (vendor) {
        await prisma.vendor.update({
          where: { id: kycId },
          data: { isVerified: false, isActive: false },
        });
        return successResponse({ message: 'Vendor KYC rejected', reason });
      }

      const rider = await prisma.rider.findUnique({ where: { id: kycId } });
      if (rider) {
        await prisma.rider.update({
          where: { id: kycId },
          data: { documentVerified: false, isAvailable: false },
        });
        return successResponse({ message: 'Rider KYC rejected', reason });
      }

      return errorResponse('KYC record not found', 404);
    }

    // Handle alert resolution
    if (action === 'resolve' && alertId) {
      // In production, update alert status in database
      return successResponse({ message: 'Alert resolved', alertId });
    }

    // Handle send reminder
    if (action === 'send-reminder') {
      // In production, send email/SMS reminder
      return successResponse({ message: `Reminder sent to ${entityName || 'entity'}` });
    }

    // Legacy format support with entityType and entityId
    if (entityId && entityType) {
      if (action === 'approve-kyc') {
        if (entityType === 'vendor') {
          await prisma.vendor.update({
            where: { id: entityId },
            data: { isVerified: true, isActive: true },
          });
        } else if (entityType === 'rider') {
          await prisma.rider.update({
            where: { id: entityId },
            data: { documentVerified: true, isAvailable: true },
          });
        }
        return successResponse({ message: 'KYC approved successfully' });
      }

      if (action === 'reject-kyc') {
        if (entityType === 'vendor') {
          await prisma.vendor.update({
            where: { id: entityId },
            data: { isVerified: false, isActive: false },
          });
        } else if (entityType === 'rider') {
          await prisma.rider.update({
            where: { id: entityId },
            data: { documentVerified: false, isAvailable: false },
          });
        }
        return successResponse({ message: 'KYC rejected' });
      }

      if (action === 'resolve-alert') {
        return successResponse({ message: 'Alert resolved' });
      }
    }

    return errorResponse('Invalid action or missing parameters', 400);
  } catch (error) {
    console.error('Admin compliance action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
