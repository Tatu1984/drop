import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';
import { sendOrderNotification, createNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // active or past

    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build where clause
    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type === 'active') {
      where.status = {
        in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'],
      };
    } else if (type === 'past') {
      where.status = {
        in: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
      };
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        vendor: {
          select: { id: true, name: true, logo: true, address: true },
        },
        rider: {
          select: { id: true, name: true, phone: true, avatar: true, vehicleNumber: true, rating: true },
        },
        address: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, isVeg: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(paginatedResponse(orders, total, page, limit));
  } catch (error) {
    console.error('Orders API error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse(error);
    }

    const body = await request.json();
    const {
      vendorId,
      addressId,
      items,
      paymentMethod,
      tip = 0,
      scheduledFor,
      deliveryInstructions,
      couponCode,
    } = body;

    // Validate required fields
    if (!vendorId || !items || items.length === 0 || !paymentMethod) {
      return errorResponse('Missing required fields', 400);
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.isActive) {
      return errorResponse('Vendor not found or inactive', 404);
    }

    // Verify products and calculate prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.inStock) {
        return errorResponse(`Product ${item.productId} not available`, 400);
      }

      const itemPrice = product.discountPrice || product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice,
        customizations: item.customizations || null,
        notes: item.notes || null,
      });
    }

    // Check minimum order
    if (subtotal < vendor.minimumOrder) {
      return errorResponse(`Minimum order amount is ₹${vendor.minimumOrder}`, 400);
    }

    // Calculate fees
    const deliveryFee = subtotal >= 199 ? 0 : 40;
    const platformFee = Math.round(subtotal * 0.02); // 2% platform fee

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.promotion.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round(subtotal * coupon.discountValue / 100);
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          } else if (coupon.discountType === 'FLAT') {
            discount = coupon.discountValue;
          } else if (coupon.discountType === 'FREE_DELIVERY') {
            discount = deliveryFee;
          }

          // Increment coupon usage
          await prisma.promotion.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = subtotal + deliveryFee + platformFee + tip - discount;

    // Generate order number
    const orderNumber = `DRP${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.userId,
        vendorId,
        addressId,
        status: 'PENDING',
        type: addressId ? 'DELIVERY' : 'PICKUP',
        subtotal,
        deliveryFee,
        platformFee,
        discount,
        tip,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        estimatedDelivery: new Date(Date.now() + vendor.avgDeliveryTime * 60 * 1000),
        deliveryInstructions,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order placed',
          },
        },
      },
      include: {
        vendor: {
          select: { id: true, name: true, logo: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true },
            },
          },
        },
        address: true,
      },
    });

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.userId },
    });

    // Award loyalty points (1 point per ₹10 spent)
    const pointsEarned = Math.floor(total / 10);
    if (pointsEarned > 0) {
      await prisma.loyaltyPoints.update({
        where: { userId: user.userId },
        data: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
        },
      });

      await prisma.pointsHistory.create({
        data: {
          loyaltyPointsId: (await prisma.loyaltyPoints.findUnique({ where: { userId: user.userId } }))!.id,
          points: pointsEarned,
          type: 'EARNED',
          description: `Order #${orderNumber}`,
        },
      });
    }

    // Send notification
    await createNotification(
      user.userId,
      'Order Placed!',
      `Your order #${orderNumber} has been placed successfully.`,
      'ORDER_UPDATE',
      { orderId: order.id }
    );

    return successResponse({
      order,
      pointsEarned,
      message: 'Order placed successfully',
    }, undefined, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse('Failed to create order', 500);
  }
}
