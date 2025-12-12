import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// GET - List all guest profiles
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');
    const vipOnly = searchParams.get('vipOnly');
    const sortBy = searchParams.get('sortBy') || 'lastVisit';

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      vendorId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (vipOnly === 'true') {
      where.vipStatus = true;
    }

    // Get total count
    const total = await prisma.guestProfile.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'lastVisit':
        orderBy = { lastVisit: 'desc' };
        break;
      case 'totalSpend':
        orderBy = { totalSpend: 'desc' };
        break;
      case 'totalVisits':
        orderBy = { totalVisits: 'desc' };
        break;
      case 'name':
        orderBy = { firstName: 'asc' };
        break;
      default:
        orderBy = { lastVisit: 'desc' };
    }

    // Fetch guest profiles
    const guests = await prisma.guestProfile.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        totalVisits: true,
        totalSpend: true,
        averageSpend: true,
        lastVisit: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        vipStatus: true,
        tags: true,
        birthday: true,
        anniversary: true,
        createdAt: true,
      },
    });

    return successResponse(paginatedResponse(guests, total, page, limit));
  } catch (error) {
    console.error('Guest profiles API error:', error);
    return errorResponse('Failed to fetch guest profiles', 500);
  }
}

// POST - Create a new guest profile
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
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
    } = body;

    // Validate required fields
    if (!vendorId || !firstName) {
      return errorResponse('Vendor ID and first name are required', 400);
    }

    // Check if guest already exists by phone or email
    if (phone || email) {
      const existing = await prisma.guestProfile.findFirst({
        where: {
          vendorId,
          OR: [
            phone ? { phone } : {},
            email ? { email } : {},
          ].filter(obj => Object.keys(obj).length > 0),
        },
      });

      if (existing) {
        return errorResponse('Guest with this phone or email already exists', 409);
      }
    }

    // Create guest profile
    const guest = await prisma.guestProfile.create({
      data: {
        vendorId,
        firstName,
        lastName,
        email,
        phone,
        dietaryRestrictions: dietaryRestrictions || [],
        allergies: allergies || [],
        preferences,
        birthday: birthday ? new Date(birthday) : null,
        anniversary: anniversary ? new Date(anniversary) : null,
        tags: tags || [],
        vipStatus: vipStatus || false,
        notes,
        marketingConsent: marketingConsent || false,
      },
    });

    return successResponse(guest, 'Guest profile created successfully', 201);
  } catch (error) {
    console.error('Create guest profile error:', error);
    return errorResponse('Failed to create guest profile', 500);
  }
}
