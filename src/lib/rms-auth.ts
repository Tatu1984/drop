import { NextRequest } from 'next/server';
import { getCurrentUser, JWTPayload } from './auth';
import { errorResponse, unauthorizedResponse } from './api-response';
import prisma from './prisma';

export interface RMSAuthResult {
  user: JWTPayload;
  vendorId: string;
  outletId?: string;
}

/**
 * Authenticate RMS API requests
 * Validates that the user is a vendor and has access to the requested outlet
 */
export async function authenticateRMS(
  request: NextRequest
): Promise<{ auth: RMSAuthResult | null; error?: Response }> {
  try {
    // Get current user from JWT
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return {
        auth: null,
        error: unauthorizedResponse(error || 'Authentication required'),
      };
    }

    // Must be a vendor
    if (user.type !== 'vendor' && user.type !== 'admin') {
      return {
        auth: null,
        error: unauthorizedResponse('Access denied. Vendor or admin access required.'),
      };
    }

    // For vendors, get their vendor record
    // user.userId is the vendor ID for vendor auth
    if (user.type === 'vendor') {
      const vendor = await prisma.vendor.findFirst({
        where: { id: user.userId },
        select: { id: true },
      });

      if (!vendor) {
        return {
          auth: null,
          error: unauthorizedResponse('Vendor account not found'),
        };
      }

      // Check for outletId in query params
      const outletId = request.nextUrl.searchParams.get('outletId');

      // If outletId is provided, verify vendor has access
      if (outletId) {
        const outlet = await prisma.outlet.findFirst({
          where: {
            id: outletId,
            vendorId: vendor.id,
          },
        });

        if (!outlet) {
          return {
            auth: null,
            error: errorResponse('Access denied to this outlet', 403),
          };
        }
      }

      return {
        auth: {
          user,
          vendorId: vendor.id,
          outletId: outletId || undefined,
        },
      };
    }

    // Admin users have full access
    return {
      auth: {
        user,
        vendorId: 'admin', // Special marker for admin access
        outletId: request.nextUrl.searchParams.get('outletId') || undefined,
      },
    };
  } catch (error) {
    console.error('RMS Auth error:', error);
    return {
      auth: null,
      error: errorResponse('Authentication failed', 500),
    };
  }
}

/**
 * Helper to require RMS authentication in API routes
 */
export async function requireRMSAuth(request: NextRequest) {
  const { auth, error } = await authenticateRMS(request);

  if (!auth) {
    return { authorized: false as const, response: error! };
  }

  return { authorized: true as const, auth };
}
