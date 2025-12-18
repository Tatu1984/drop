import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/vendor/onboarding - Vendor registration/onboarding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Business Info
      businessName,
      businessType,
      cuisines,
      description,

      // Owner Details
      ownerName,
      phone,
      email,
      alternatePhone,
      password,

      // Documents
      gstin,
      fssaiLicense,
      panNumber,
      bankAccount,
      ifscCode,

      // Store Setup
      address,
      city,
      pincode,
      landmark,
      latitude,
      longitude,
      openTime,
      closeTime,
      avgPrepTime,
      minOrderValue,
      deliveryRadius,
    } = body;

    // Validate required fields
    if (!businessName || !businessType || !ownerName || !phone || !email || !password) {
      return errorResponse('Missing required fields', 400);
    }

    if (!address || !city || !pincode) {
      return errorResponse('Address information is required', 400);
    }

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { email },
          { phone },
        ],
      },
    });

    if (existingVendor) {
      return errorResponse('A vendor with this email or phone already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name: businessName,
        description: description || '',
        email,
        phone,
        password: hashedPassword,
        type: businessType,
        address: `${address}, ${city} - ${pincode}${landmark ? ', ' + landmark : ''}`,
        latitude: latitude || 0,
        longitude: longitude || 0,
        openingTime: openTime || '09:00',
        closingTime: closeTime || '22:00',
        minimumOrder: minOrderValue ? parseFloat(minOrderValue) : 100,
        avgDeliveryTime: avgPrepTime ? parseInt(avgPrepTime) : 30,
        deliveryRadius: deliveryRadius ? parseFloat(deliveryRadius) : 5,
        isActive: false, // Inactive until verified
        isVerified: false,
        rating: 0,
        totalRatings: 0,
      },
    });

    // TODO: Store documents, cuisines, and other metadata
    // You might want to create separate tables for documents and cuisines

    return successResponse(
      {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        status: 'pending_verification',
      },
      'Application submitted successfully! We will review and contact you within 24-48 hours.'
    );
  } catch (error) {
    console.error('Vendor onboarding error:', error);
    return errorResponse('Failed to submit application', 500);
  }
}
