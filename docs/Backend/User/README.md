# User Backend API Routes Documentation

## Overview

The User API provides endpoints for consumer-facing features including authentication, browsing, ordering, and account management.

**Base Path:** `/api`

**Authentication:** Most routes require `Authorization: Bearer <token>` header or `auth-token` cookie.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Vendors](#2-vendors)
3. [Products](#3-products)
4. [Orders](#4-orders)
5. [Cart](#5-cart)
6. [Wallet](#6-wallet)
7. [Notifications](#7-notifications)
8. [Search](#8-search)
9. [User Profile](#9-user-profile)
10. [Addresses](#10-addresses)
11. [Payments](#11-payments)
12. [File Upload](#12-file-upload)

---

## 1. Authentication

### POST `/api/auth/send-otp`

Sends OTP to user's phone number.

**Input Parameters:**
```json
{
  "phone": "9876543210",
  "type": "user"
}
```

**Input Validations:**
- Phone must match `/^[6-9]\d{9}$/` (10-digit Indian mobile)
- Type: 'user' or 'rider' (default: 'user')

**Algorithm:**
1. Validate phone format
2. Generate OTP
3. Store OTP with expiration
4. Send SMS
5. Check if user is new

**Output:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "isNewUser": true,
    "otp": "123456"
  }
}
```
> Note: OTP is included only in development environment

---

### POST `/api/auth/verify-otp`

Verifies OTP and authenticates user.

**Input Parameters:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe",
  "type": "user"
}
```

**Algorithm:**
1. Verify OTP validity
2. For new users:
   - Create user record
   - Create wallet (balance: 0)
   - Create loyalty points (BRONZE tier)
   - Send welcome notification with WELCOME50 code
3. Generate JWT token (7-day expiration)
4. Set httpOnly cookie

**Output:**
```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "phone": "9876543210",
      "name": "John Doe",
      "email": null,
      "avatar": null,
      "isKycVerified": false,
      "isAgeVerified": false,
      "wallet": {"balance": 0},
      "subscription": null,
      "loyaltyPoints": {"points": 0, "tier": "BRONZE"},
      "addresses": []
    },
    "isNewUser": true
  }
}
```

---

### POST `/api/auth/logout`

Clears all authentication cookies.

**Output:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### GET `/api/auth/me`

Gets current authenticated user.

**Output:**
```json
{
  "success": true,
  "data": {
    "type": "user",
    "user": {...}
  }
}
```

---

## 2. Vendors

### GET `/api/vendors`

Lists vendors with filtering and sorting.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | all | Vendor type filter |
| search | string | - | Search by name/description |
| lat | number | - | User latitude |
| lng | number | - | User longitude |
| rating | number | - | Minimum rating |
| isOpen | string | - | 'true' or 'false' |
| sortBy | string | rating | rating, deliveryTime, name |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Algorithm:**
1. Build filter query
2. If lat/lng provided, calculate Haversine distance
3. If isOpen filter, check current time vs opening/closing hours
4. Sort by specified field or distance

**Output:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "vendor_1",
        "name": "Pizza Palace",
        "type": "RESTAURANT",
        "logo": "https://...",
        "rating": 4.5,
        "avgDeliveryTime": 30,
        "minimumOrder": 99,
        "openingTime": "09:00",
        "closingTime": "22:00",
        "_count": {"products": 45, "orders": 500},
        "distance": 2.5
      }
    ],
    "pagination": {"page": 1, "limit": 10, "total": 50, "pages": 5}
  }
}
```

---

### GET `/api/vendors/[id]`

Gets vendor details with products.

**Input Parameters:**
- `id` (URL param): Vendor ID

**Algorithm:**
1. Fetch vendor with categories, products, reviews, promotions
2. Only include in-stock products
3. Include top 10 recent reviews
4. Include active promotions
5. Calculate current open status
6. Group products by category

**Output:**
```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "vendor_1",
      "name": "Pizza Palace",
      "isOpen": true,
      "totalOrders": 500,
      "totalReviews": 120,
      ...
    },
    "products": [...],
    "categories": [
      {
        "name": "Pizzas",
        "items": [...]
      }
    ]
  }
}
```

---

## 3. Products

### GET `/api/products`

Lists products with filtering.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| vendorId | string | - | Filter by vendor |
| categoryId | string | - | Filter by category |
| search | string | - | Search name/description/brand |
| minPrice | number | - | Minimum price |
| maxPrice | number | - | Maximum price |
| isVeg | string | - | 'true' or 'false' |
| inStock | string | true | Show in-stock only |
| sortBy | string | rating | rating, price_low, price_high, name |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Output:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "product_1",
        "name": "Margherita Pizza",
        "description": "Classic cheese pizza",
        "price": 299,
        "discountPrice": 249,
        "images": ["https://..."],
        "isVeg": true,
        "inStock": true,
        "rating": 4.5,
        "vendor": {"id": "...", "name": "...", "logo": "..."},
        "category": {"id": "...", "name": "...", "icon": "..."}
      }
    ],
    "pagination": {...}
  }
}
```

---

## 4. Orders

### GET `/api/orders`

Lists user's orders.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status |
| type | string | - | 'active' or 'past' |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Output:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "order_123",
        "orderNumber": "DRP1234567890",
        "status": "DELIVERED",
        "total": 599,
        "vendor": {...},
        "rider": {...},
        "address": {...},
        "items": [...],
        "statusHistory": [...],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### POST `/api/orders`

Creates a new order.

**Input Parameters:**
```json
{
  "vendorId": "vendor_123",
  "addressId": "address_123",
  "items": [
    {
      "productId": "product_1",
      "quantity": 2,
      "customizations": {"size": "large"},
      "notes": "Extra cheese"
    }
  ],
  "paymentMethod": "CARD",
  "tip": 20,
  "scheduledFor": null,
  "deliveryInstructions": "Ring doorbell",
  "couponCode": "SAVE20"
}
```

**Input Validations:**
- vendorId, items, paymentMethod required
- Items array must not be empty
- Vendor must be active
- Products must be in stock
- Subtotal must meet minimum order

**Algorithm:**
1. Validate vendor and products
2. Calculate prices (use discountPrice if available)
3. Calculate delivery fee: 40 if subtotal < 199, else free
4. Calculate platform fee: 2% of subtotal
5. Apply coupon if provided
6. Generate order number (DRP + timestamp)
7. Create order and items
8. Clear user's cart
9. Award loyalty points (1 point per 10 spent)
10. Send order notification

**Output:**
```json
{
  "success": true,
  "data": {
    "order": {...},
    "pointsEarned": 50,
    "message": "Order placed successfully"
  },
  "statusCode": 201
}
```

---

### GET `/api/orders/[id]`

Gets order details with timeline.

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "orderNumber": "DRP1234567890",
    ...
    "timeline": [
      {
        "status": "PENDING",
        "label": "Order Placed",
        "time": "2024-01-15T10:30:00Z",
        "completed": true,
        "isCurrent": false
      },
      {
        "status": "CONFIRMED",
        "label": "Confirmed",
        "time": "2024-01-15T10:32:00Z",
        "completed": true,
        "isCurrent": false
      },
      {
        "status": "PREPARING",
        "label": "Preparing",
        "time": null,
        "completed": false,
        "isCurrent": true
      }
    ]
  }
}
```

---

### PATCH `/api/orders/[id]`

Updates order (cancel, rate).

**Input Parameters:**
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Changed my mind",
  "rating": 5,
  "review": "Great food!"
}
```

**Validations:**
- Can only cancel: PENDING, CONFIRMED, PREPARING
- Can only rate: DELIVERED orders

**Algorithm (Cancel):**
1. Update status to CANCELLED
2. Create status history
3. If paid, refund to wallet
4. Send notification

**Algorithm (Rate):**
1. Create review record
2. Recalculate vendor average rating
3. Update vendor rating and totalRatings

---

## 5. Cart

### GET `/api/cart`

Gets user's cart with summary.

**Output:**
```json
{
  "success": true,
  "data": {
    "cartItems": [...],
    "groupedByVendor": [
      {
        "vendor": {...},
        "items": [
          {
            "id": "cart_1",
            "product": {...},
            "quantity": 2,
            "itemTotal": 498
          }
        ],
        "subtotal": 498
      }
    ],
    "summary": {
      "totalItems": 2,
      "subtotal": 498,
      "deliveryFee": 0,
      "platformFee": 10,
      "total": 508
    }
  }
}
```

---

### POST `/api/cart`

Adds item to cart.

**Input Parameters:**
```json
{
  "productId": "product_1",
  "quantity": 1,
  "customizations": {"size": "large"},
  "notes": "Extra spicy"
}
```

**Validations:**
- Product must exist and be in stock
- Vendor must be active

---

### PUT `/api/cart`

Updates cart item.

**Input Parameters:**
```json
{
  "cartItemId": "cart_1",
  "quantity": 3,
  "customizations": {...},
  "notes": "..."
}
```

---

### DELETE `/api/cart`

Clears cart or removes item.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| itemId | string | Specific item to remove (optional) |

---

## 6. Wallet

### GET `/api/wallet`

Gets wallet balance and transactions.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Output:**
```json
{
  "success": true,
  "data": {
    "balance": 500,
    "transactions": {
      "data": [
        {
          "id": "tx_1",
          "amount": 100,
          "type": "CREDIT",
          "description": "Order refund",
          "orderId": "order_123",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "pagination": {...}
    }
  }
}
```

---

### POST `/api/wallet`

Adds money or creates transaction.

**Input Parameters:**
```json
{
  "amount": 500,
  "type": "TOP_UP",
  "description": "Wallet top-up",
  "orderId": null
}
```

**Transaction Types:**
- TOP_UP: Add money
- CREDIT: Receive money
- DEBIT: Spend money
- CASHBACK: Cashback credit
- REFUND: Order refund

---

## 7. Notifications

### GET `/api/notifications`

Gets user notifications.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| unreadOnly | string | 'true' to show unread only |
| page | number | Page number |
| limit | number | Items per page |

**Output:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "notif_1",
        "title": "Order Delivered",
        "body": "Your order has been delivered",
        "type": "ORDER_UPDATE",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...},
    "unreadCount": 5
  }
}
```

---

### PUT `/api/notifications`

Marks notifications as read.

**Input Parameters:**
```json
{
  "notificationId": "notif_1",
  "markAllRead": false
}
```

---

### DELETE `/api/notifications`

Deletes notifications.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification ID |
| clearAll | string | 'true' to clear all |

---

## 8. Search

### GET `/api/search`

Searches vendors and products.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | - | Search query |
| type | string | all | all, vendors, products |
| limit | number | 20 | Max results (max 50) |
| lat | number | - | User latitude |
| lng | number | - | User longitude |

**Algorithm:**
1. If empty query: return trending searches
2. Search vendors by name/description
3. Search products by name/description/brand
4. Search categories by name
5. Save to search history if logged in

**Output:**
```json
{
  "success": true,
  "data": {
    "vendors": [...],
    "products": [...],
    "categories": [...],
    "totalVendors": 10,
    "totalProducts": 25,
    "suggestions": [...],
    "trending": ["Biryani", "Pizza", "Burger"]
  }
}
```

---

### POST `/api/search`

Manages search history.

**Input Parameters:**
```json
{
  "action": "clear"
}
```

---

## 9. User Profile

### GET `/api/user/profile`

Gets user profile.

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phone": "9876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "dateOfBirth": "1990-01-15",
    "preferredLanguage": "en",
    "cuisinePreferences": ["Italian", "Indian"],
    "isKycVerified": true,
    "isAgeVerified": true,
    "addresses": [...],
    "wallet": {"balance": 500},
    "subscription": {...},
    "loyaltyPoints": {"points": 1000, "tier": "SILVER"},
    "totalOrders": 50,
    "totalReviews": 10
  }
}
```

---

### PUT `/api/user/profile`

Updates user profile.

**Input Parameters:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://...",
  "dateOfBirth": "1990-01-15",
  "preferredLanguage": "en",
  "cuisinePreferences": ["Italian", "Indian"],
  "groceryBrands": ["Brand A"],
  "alcoholPreferences": {...}
}
```

**Validations:**
- Email must be unique

---

## 10. Addresses

### GET `/api/user/addresses`

Gets user addresses.

**Output:**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "addr_1",
        "label": "Home",
        "fullAddress": "123 Main St, Bangalore",
        "landmark": "Near Park",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "isDefault": true
      }
    ]
  }
}
```

---

### POST `/api/user/addresses`

Adds new address.

**Input Parameters:**
```json
{
  "label": "Home",
  "fullAddress": "123 Main St, Bangalore",
  "landmark": "Near Park",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "isDefault": true
}
```

**Algorithm:**
1. If isDefault, unset other defaults
2. If first address, auto-set as default
3. Create address

---

### PUT `/api/user/addresses`

Updates address.

**Input Parameters:**
```json
{
  "id": "addr_1",
  "label": "Office",
  "fullAddress": "456 Work St",
  "isDefault": true
}
```

---

### DELETE `/api/user/addresses`

Deletes address.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Address ID |

---

## 11. Payments

### POST `/api/payments`

Creates Razorpay payment order.

**Input Parameters:**
```json
{
  "orderId": "order_123",
  "amount": 599,
  "type": "order"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_123abc",
    "amount": 59900,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

---

### PUT `/api/payments`

Verifies payment.

**Input Parameters:**
```json
{
  "razorpayOrderId": "order_123abc",
  "razorpayPaymentId": "pay_123xyz",
  "razorpaySignature": "signature",
  "orderId": "order_123",
  "type": "order"
}
```

**Algorithm:**
1. Verify signature using HMAC SHA256
2. For order: update paymentStatus to COMPLETED, status to CONFIRMED
3. For wallet: fetch amount from Razorpay, credit wallet

**Output:**
```json
{
  "success": true,
  "data": {
    "message": "Payment verified successfully",
    "paymentId": "pay_123xyz"
  }
}
```

---

## 12. File Upload

### POST `/api/upload`

Uploads file.

**Input Parameters:** (FormData)
- `file`: File to upload
- `folder`: Upload folder (default: 'uploads')

**Output:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "publicId": "uploads/file_123",
    "format": "jpg",
    "message": "File uploaded successfully"
  }
}
```

---

### GET `/api/upload`

Gets signed upload URL for client-side upload.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| folder | string | uploads | Upload folder |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

OTP endpoints are rate-limited to prevent abuse:
- 3 OTP requests per phone number per 5 minutes
- 10 verification attempts per phone per 15 minutes
