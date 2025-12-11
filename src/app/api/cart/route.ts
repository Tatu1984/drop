import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Get cart items
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: {
            vendor: {
              select: { id: true, name: true, logo: true, minimumOrder: true, avgDeliveryTime: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by vendor
    type CartItemWithTotal = typeof cartItems[0] & { itemTotal: number };
    const groupedByVendor = cartItems.reduce((acc, item) => {
      const vendorId = item.product.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: item.product.vendor,
          items: [] as CartItemWithTotal[],
          subtotal: 0,
        };
      }
      const price = item.product.discountPrice || item.product.price;
      acc[vendorId].items.push({
        ...item,
        itemTotal: price * item.quantity,
      });
      acc[vendorId].subtotal += price * item.quantity;
      return acc;
    }, {} as Record<string, { vendor: typeof cartItems[0]['product']['vendor']; items: CartItemWithTotal[]; subtotal: number }>);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = Object.values(groupedByVendor).reduce((sum, group) => sum + group.subtotal, 0);

    return successResponse({
      cartItems,
      groupedByVendor: Object.values(groupedByVendor),
      summary: {
        totalItems,
        subtotal: grandTotal,
        deliveryFee: grandTotal >= 199 ? 0 : 40,
        platformFee: Math.round(grandTotal * 0.02),
        total: grandTotal + (grandTotal >= 199 ? 0 : 40) + Math.round(grandTotal * 0.02),
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse('Failed to fetch cart', 500);
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { productId, quantity = 1, customizations, notes } = await request.json();

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: {
          select: { id: true, name: true, isActive: true },
        },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (!product.inStock) {
      return errorResponse('Product is out of stock', 400);
    }

    if (!product.vendor.isActive) {
      return errorResponse('Vendor is currently unavailable', 400);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          customizations: customizations || existingItem.customizations,
          notes: notes || existingItem.notes,
        },
        include: {
          product: {
            include: {
              vendor: {
                select: { id: true, name: true, logo: true },
              },
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId,
          quantity,
          customizations,
          notes,
        },
        include: {
          product: {
            include: {
              vendor: {
                select: { id: true, name: true, logo: true },
              },
            },
          },
        },
      });
    }

    return successResponse({ cartItem, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse('Failed to add item to cart', 500);
  }
}

// Update cart item
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { cartItemId, quantity, customizations, notes } = await request.json();

    if (!cartItemId) {
      return errorResponse('Cart item ID is required', 400);
    }

    // Verify cart item belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.userId,
      },
    });

    if (!existingItem) {
      return errorResponse('Cart item not found', 404);
    }

    if (quantity <= 0) {
      // Delete item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
      return successResponse({ message: 'Item removed from cart' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        customizations: customizations !== undefined ? customizations : existingItem.customizations,
        notes: notes !== undefined ? notes : existingItem.notes,
      },
      include: {
        product: true,
      },
    });

    return successResponse({ cartItem, message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    return errorResponse('Failed to update cart', 500);
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('itemId');

    if (cartItemId) {
      // Delete specific item
      await prisma.cartItem.deleteMany({
        where: {
          id: cartItemId,
          userId: user.userId,
        },
      });
      return successResponse({ message: 'Item removed from cart' });
    }

    // Clear entire cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.userId },
    });

    return successResponse({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse('Failed to clear cart', 500);
  }
}
