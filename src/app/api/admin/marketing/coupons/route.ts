import { NextRequest } from 'next/server';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// Mock coupon data - in production, this would be stored in database
const mockCoupons = [
  {
    id: 'coupon-1',
    code: 'WELCOME50',
    description: '50% off on first order',
    type: 'percentage' as const,
    value: 50,
    minOrder: 199,
    maxDiscount: 150,
    usageLimit: 10000,
    usedCount: 4523,
    startDate: new Date(2024, 0, 1).toISOString(),
    endDate: new Date(2025, 11, 31).toISOString(),
    status: 'active' as const,
    applicableTo: ['All Categories'],
  },
  {
    id: 'coupon-2',
    code: 'FLAT100',
    description: 'Flat Rs.100 off on orders above Rs.500',
    type: 'flat' as const,
    value: 100,
    minOrder: 500,
    maxDiscount: 100,
    usageLimit: 5000,
    usedCount: 2156,
    startDate: new Date(2024, 0, 1).toISOString(),
    endDate: new Date(2025, 5, 30).toISOString(),
    status: 'active' as const,
    applicableTo: ['Food', 'Grocery'],
  },
  {
    id: 'coupon-3',
    code: 'WEEKEND20',
    description: '20% off on weekends',
    type: 'percentage' as const,
    value: 20,
    minOrder: 299,
    maxDiscount: 200,
    usageLimit: 3000,
    usedCount: 1876,
    startDate: new Date(2024, 0, 1).toISOString(),
    endDate: new Date(2025, 11, 31).toISOString(),
    status: 'active' as const,
    applicableTo: ['All Categories'],
  },
  {
    id: 'coupon-4',
    code: 'FREESHIP',
    description: 'Free delivery on all orders',
    type: 'flat' as const,
    value: 40,
    minOrder: 0,
    maxDiscount: 40,
    usageLimit: 20000,
    usedCount: 15678,
    startDate: new Date(2023, 0, 1).toISOString(),
    endDate: new Date(2023, 11, 31).toISOString(),
    status: 'expired' as const,
    applicableTo: ['All Categories'],
  },
  {
    id: 'coupon-5',
    code: 'GROCERY15',
    description: '15% off on grocery orders',
    type: 'percentage' as const,
    value: 15,
    minOrder: 399,
    maxDiscount: 100,
    usageLimit: 2000,
    usedCount: 890,
    startDate: new Date(2024, 0, 1).toISOString(),
    endDate: new Date(2025, 11, 31).toISOString(),
    status: 'disabled' as const,
    applicableTo: ['Grocery'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const filteredCoupons = status === 'all'
      ? mockCoupons
      : mockCoupons.filter(c => c.status === status);

    return successResponse({ coupons: filteredCoupons });
  } catch (error) {
    console.error('Admin coupons error:', error);
    return errorResponse('Failed to fetch coupons', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { code, type, value, minOrder, maxDiscount, usageLimit, startDate, endDate, description } = body;

    if (!code || !type || value === undefined) {
      return errorResponse('Code, type, and value required', 400);
    }

    // In production, this would create a coupon in the database
    const newCoupon = {
      id: `coupon-${Date.now()}`,
      code: code.toUpperCase(),
      description: description || `${type === 'percentage' ? `${value}%` : `Rs.${value}`} off`,
      type,
      value,
      minOrder: minOrder || 0,
      maxDiscount: maxDiscount || (type === 'percentage' ? 500 : value),
      usageLimit: usageLimit || 9999,
      usedCount: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
      status: 'active' as const,
      applicableTo: ['All Categories'],
    };

    return successResponse({ coupon: newCoupon, message: 'Coupon created successfully' });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return errorResponse('Failed to create coupon', 500);
  }
}
