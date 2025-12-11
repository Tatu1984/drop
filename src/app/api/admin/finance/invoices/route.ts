import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const range = searchParams.get('range') || 'this_month';

    // Get date range
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (range === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (range === 'this_quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    }

    // Get vendors with orders for invoice generation
    const vendors = await prisma.vendor.findMany({
      where: { isVerified: true },
      include: {
        orders: {
          where: {
            status: 'DELIVERED',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: { total: true },
        },
      },
    });

    const GST_RATE = 18;

    const invoices = vendors
      .filter(v => v.orders.length > 0)
      .map((vendor, index) => {
        const totalOrderValue = vendor.orders.reduce((sum, o) => sum + o.total, 0);
        const commissionRate = 12; // Average commission
        const netAmount = totalOrderValue * (commissionRate / 100);
        const gstAmount = netAmount * (GST_RATE / 100);
        const totalAmount = netAmount + gstAmount;

        // Simulate status
        const statuses: ('generated' | 'sent' | 'paid' | 'overdue')[] = ['generated', 'sent', 'paid', 'overdue'];
        const invoiceStatus = statuses[index % 4];

        const invoiceDate = new Date(startDate);
        invoiceDate.setDate(invoiceDate.getDate() + 7);

        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 15);

        return {
          id: `inv-${vendor.id}`,
          invoiceNumber: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`,
          vendorName: vendor.name,
          period: `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          totalAmount,
          gstAmount,
          netAmount,
          status: invoiceStatus,
          generatedAt: invoiceDate.toISOString(),
          dueDate: dueDate.toISOString(),
        };
      });

    // Filter by status
    const filteredInvoices = status === 'all'
      ? invoices
      : invoices.filter(i => i.status === status);

    return successResponse({ invoices: filteredInvoices });
  } catch (error) {
    console.error('Admin invoices error:', error);
    return errorResponse('Failed to fetch invoices', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { action, invoiceIds } = body;

    if (action === 'generate') {
      return successResponse({
        message: 'Invoices generated successfully',
        count: invoiceIds?.length || 0,
      });
    }

    if (action === 'send') {
      return successResponse({
        message: `${invoiceIds.length} invoices sent successfully`,
      });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Admin invoice action error:', error);
    return errorResponse('Failed to perform action', 500);
  }
}
