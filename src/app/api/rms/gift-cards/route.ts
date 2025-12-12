import { NextRequest } from 'next/server';
import { requireRMSAuth } from '@/lib/rms-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

// Helper function to generate a unique gift card number
function generateCardNumber(): string {
  const prefix = 'GC';
  const randomNum = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  return `${prefix}${randomNum}`;
}

// Helper function to generate a 4-digit PIN
function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// GET - List all gift cards
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'purchasedAt';

    const { page, limit, skip } = getPaginationParams(searchParams);

    if (!vendorId) {
      return errorResponse('Vendor ID is required', 400);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      vendorId,
    };

    if (isActive === 'true') {
      where.isActive = true;
      where.currentBalance = { gt: 0 };
    } else if (isActive === 'false') {
      where.OR = [
        { isActive: false },
        { currentBalance: 0 },
      ];
    }

    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { purchaserName: { contains: search, mode: 'insensitive' } },
        { purchaserEmail: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.giftCard.count({ where });

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'purchasedAt':
        orderBy = { purchasedAt: 'desc' };
        break;
      case 'balance':
        orderBy = { currentBalance: 'desc' };
        break;
      case 'expiresAt':
        orderBy = { expiresAt: 'asc' };
        break;
      default:
        orderBy = { purchasedAt: 'desc' };
    }

    // Fetch gift cards
    const giftCards = await prisma.giftCard.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return successResponse(paginatedResponse(giftCards, total, page, limit));
  } catch (error) {
    console.error('Gift cards API error:', error);
    return errorResponse('Failed to fetch gift cards', 500);
  }
}

// POST - Create/Issue a new gift card
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRMSAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const {
      vendorId,
      initialValue,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
      expiresAt,
    } = body;

    // Validate required fields
    if (!vendorId || !initialValue) {
      return errorResponse('Vendor ID and initial value are required', 400);
    }

    if (initialValue <= 0) {
      return errorResponse('Initial value must be greater than 0', 400);
    }

    // Generate unique card number and PIN
    let cardNumber = generateCardNumber();
    let exists = await prisma.giftCard.findUnique({
      where: { cardNumber },
    });

    // Ensure unique card number
    while (exists) {
      cardNumber = generateCardNumber();
      exists = await prisma.giftCard.findUnique({
        where: { cardNumber },
      });
    }

    const pin = generatePIN();

    // Create gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        vendorId,
        cardNumber,
        pin,
        initialValue,
        currentBalance: initialValue,
        purchaserName,
        purchaserEmail,
        recipientName,
        recipientEmail,
        message,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    // Create initial transaction record
    await prisma.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        type: 'PURCHASE',
        amount: initialValue,
        balance: initialValue,
      },
    });

    return successResponse(giftCard, 'Gift card created successfully', 201);
  } catch (error) {
    console.error('Create gift card error:', error);
    return errorResponse('Failed to create gift card', 500);
  }
}
