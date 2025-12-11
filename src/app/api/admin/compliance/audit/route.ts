import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');

    // Get recent orders and admin actions for audit log simulation
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        user: { select: { name: true } },
        vendor: { select: { name: true } },
      },
    });

    const vendors = await prisma.vendor.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        isVerified: true,
      },
    });

    // Severity helper
    const getSeverity = (index: number): 'high' | 'medium' | 'low' => {
      if (index % 5 === 0) return 'high';
      if (index % 3 === 0) return 'medium';
      return 'low';
    };

    // Generate audit log entries
    const auditLogs = [
      ...orders.map((order, index) => ({
        id: `audit-order-${order.id}`,
        action: index % 3 === 0 ? 'order_status_changed' : index % 3 === 1 ? 'order_assigned' : 'order_created',
        category: 'orders',
        severity: getSeverity(index),
        actorType: index % 2 === 0 ? 'admin' : 'system',
        actorName: index % 2 === 0 ? 'Admin User' : 'System',
        entityType: 'Order',
        entityId: order.id,
        entityName: order.orderNumber,
        description: index % 3 === 0
          ? `Order status changed to ${order.status}`
          : index % 3 === 1
            ? 'Order assigned to rider'
            : 'New order created',
        metadata: {
          vendorName: order.vendor.name,
          userName: order.user?.name,
        },
        ipAddress: `192.168.1.${10 + index}`,
        timestamp: order.createdAt.toISOString(),
      })),
      ...vendors.map((vendor, index) => ({
        id: `audit-vendor-${vendor.id}`,
        action: vendor.isVerified ? 'vendor_verified' : 'vendor_registered',
        category: 'vendors',
        severity: vendor.isVerified ? 'medium' as const : 'low' as const,
        actorType: vendor.isVerified ? 'admin' : 'system',
        actorName: vendor.isVerified ? 'Admin User' : 'System',
        entityType: 'Vendor',
        entityId: vendor.id,
        entityName: vendor.name,
        description: vendor.isVerified
          ? `Vendor ${vendor.name} verified`
          : `New vendor ${vendor.name} registered`,
        metadata: {},
        ipAddress: `192.168.1.${50 + index}`,
        timestamp: vendor.createdAt.toISOString(),
      })),
    ];

    // Sort by timestamp
    auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filters
    let filteredLogs = auditLogs;
    if (severity && severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return successResponse({ logs: filteredLogs.slice(0, 50) });
  } catch (error) {
    console.error('Admin audit logs error:', error);
    return errorResponse('Failed to fetch audit logs', 500);
  }
}
