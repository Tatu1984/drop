# Rider Backend API Routes Documentation

## Overview

The Rider API provides endpoints for delivery partner operations including location tracking, order management, and earnings.

**Base Path:** `/api/rider`

**Authentication:** All routes require `Authorization: Bearer <token>` header or `rider-token` cookie with rider type authentication.

---

## Table of Contents

1. [Location Management](#1-location-management)
2. [Earnings](#2-earnings)
3. [Orders](#3-orders)

---

## 1. Location Management

### POST `/api/rider/location`

Updates rider's current location.

**Input Parameters:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "isOnline": true
}
```

**Input Validations:**
- Must be authenticated as rider (user.type === 'rider')
- latitude and longitude are required
- Returns 400 if coordinates missing

**Algorithm:**
1. Extract and validate rider authentication
2. Parse latitude, longitude, and optional isOnline
3. Update rider record with new coordinates
4. Sync location to all active orders (PICKED_UP or OUT_FOR_DELIVERY status)
5. Return updated online status

**Output:**
```json
{
  "success": true,
  "data": {
    "message": "Location updated",
    "isOnline": true
  }
}
```

**Error Responses:**

Missing coordinates (400):
```json
{
  "success": false,
  "error": "Location coordinates are required"
}
```

Unauthorized (401):
```json
{
  "success": false,
  "error": "Rider authentication required"
}
```

---

### GET `/api/rider/location`

Gets rider's current status and location.

**Input Parameters:** None (authentication via cookie/header)

**Output:**
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "isAvailable": true,
    "currentLat": 12.9716,
    "currentLng": 77.5946,
    "assignedZone": "HSR Layout",
    "activeOrdersCount": 2
  }
}
```

---

## 2. Earnings

### GET `/api/rider/earnings`

Retrieves rider earnings with summary and pagination.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | today | today, week, month, all |
| page | number | 1 | Page number (min: 1) |
| limit | number | 20 | Items per page (1-100) |

**Date Range Calculation:**
- **today:** Start of current day (midnight)
- **week:** 7 days ago
- **month:** First day of current month
- **all:** Epoch (Jan 1, 1970)

**Algorithm:**
1. Authenticate rider
2. Parse query parameters
3. Calculate appropriate startDate
4. Execute parallel queries:
   - Earnings aggregation (sum of base, tips, incentives, penalties)
   - Paginated earnings list
   - Lifetime rider stats

**Output:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "baseEarning": 1500,
      "tips": 250,
      "incentives": 200,
      "penalties": 0,
      "total": 1950,
      "deliveries": 15
    },
    "earnings": {
      "items": [
        {
          "id": "earning_1",
          "riderId": "rider_123",
          "baseEarning": 120,
          "tip": 20,
          "incentive": 0,
          "penalty": 0,
          "total": 140,
          "date": "2024-01-15T10:30:00Z"
        }
      ],
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasMore": true
    },
    "lifetime": {
      "totalDeliveries": 500,
      "totalEarnings": 75000,
      "rating": 4.8
    }
  }
}
```

---

## 3. Orders

### GET `/api/rider/orders`

Retrieves orders based on type and status.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | - | available, active, completed |
| status | string | - | Specific status override |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (1-100) |

**Type Filtering:**
- **available:** Orders with `status: READY_FOR_PICKUP` and `riderId: null`
- **active:** Rider's orders with `status: PICKED_UP or OUT_FOR_DELIVERY`
- **completed:** Rider's orders with `status: DELIVERED`
- **omitted:** All orders assigned to current rider

**Output:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order_123",
        "orderNumber": "DRP1234567890",
        "riderId": "rider_123",
        "status": "OUT_FOR_DELIVERY",
        "createdAt": "2024-01-15T10:30:00Z",
        "deliveryFee": 40,
        "tip": 20,
        "currentLat": 12.9716,
        "currentLng": 77.5946,
        "vendor": {
          "id": "vendor_1",
          "name": "Pizza Palace",
          "logo": "https://...",
          "address": "123 Main St",
          "latitude": 12.9700,
          "longitude": 77.5900
        },
        "address": {
          "id": "addr_1",
          "fullAddress": "456 Oak Street",
          "landmark": "Near Park",
          "latitude": 12.9800,
          "longitude": 77.6000
        },
        "items": [
          {
            "id": "item_1",
            "product": {"name": "Margherita Pizza"},
            "quantity": 2,
            "price": 249
          }
        ],
        "user": {
          "name": "John Doe",
          "phone": "+919876543210"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2,
    "hasMore": true
  }
}
```

---

### POST `/api/rider/orders`

Accepts or updates order status.

**Input Parameters:**
```json
{
  "orderId": "order_123",
  "action": "accept"
}
```

**Actions:**
| Action | Description |
|--------|-------------|
| accept | Accept order from available pool |
| pickup | Mark order as picked up from vendor |
| deliver | Mark order as delivered to customer |

**Input Validations:**
- orderId and action are required
- Order must exist
- Action-specific validations (see below)

---

### Accept Action

**Validations:**
- Order must not have riderId (not assigned)
- Order status must be READY_FOR_PICKUP

**Algorithm:**
1. Assign riderId to current rider
2. Update status to PICKED_UP
3. Create status history entry

**Output:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "riderId": "rider_123",
      "status": "PICKED_UP",
      ...
    },
    "message": "Order accepted"
  }
}
```

**Error Responses:**

Already assigned (400):
```json
{
  "success": false,
  "error": "Order already assigned to a rider"
}
```

Not ready (400):
```json
{
  "success": false,
  "error": "Order is not ready for pickup"
}
```

---

### Pickup Action

**Validations:**
- Current rider must be assigned (order.riderId === user.userId)

**Algorithm:**
1. Update status to OUT_FOR_DELIVERY
2. Create status history entry

**Output:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "status": "OUT_FOR_DELIVERY",
      ...
    },
    "message": "Order marked as out for delivery"
  }
}
```

---

### Deliver Action

**Validations:**
- Current rider must be assigned (order.riderId === user.userId)

**Algorithm:**
1. Update order:
   - status: DELIVERED
   - deliveredAt: current timestamp
   - paymentStatus: COMPLETED (if COD)
2. Create status history entry
3. Calculate earnings:
   - baseEarning = deliveryFee * 0.8 (80%)
   - total = baseEarning + tip
4. Create riderEarning record
5. Update rider stats:
   - Increment totalDeliveries
   - Increment totalEarnings

**Output:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "status": "DELIVERED",
      "deliveredAt": "2024-01-15T11:30:00Z",
      "paymentStatus": "COMPLETED",
      ...
    },
    "earning": 52,
    "message": "Order delivered successfully"
  }
}
```

---

## Error Responses

### Authentication Errors

Unauthorized (401):
```json
{
  "success": false,
  "error": "Rider authentication required"
}
```

### Authorization Errors

Forbidden (403):
```json
{
  "success": false,
  "error": "Not authorized"
}
```

### Validation Errors

Missing fields (400):
```json
{
  "success": false,
  "error": "Order ID and action are required"
}
```

Invalid action (400):
```json
{
  "success": false,
  "error": "Invalid action"
}
```

### Not Found Errors

Order not found (404):
```json
{
  "success": false,
  "error": "Order not found"
}
```

### Server Errors

Server error (500):
```json
{
  "success": false,
  "error": "Failed to update order"
}
```

---

## Business Rules

### Location Sync
When rider location is updated, it automatically syncs to all their active orders (PICKED_UP or OUT_FOR_DELIVERY status) for real-time tracking.

### Order State Machine
```
READY_FOR_PICKUP
       │
       ▼ (accept)
   PICKED_UP
       │
       ▼ (pickup)
OUT_FOR_DELIVERY
       │
       ▼ (deliver)
   DELIVERED
```

### Earnings Calculation
- **Base earning:** 80% of delivery fee
- **Total earning:** base earning + full tip amount
- Earnings record created only on delivery completion

### Rider Stats Update
On each delivery:
- `totalDeliveries` incremented by 1
- `totalEarnings` incremented by calculated earnings

### Payment Handling
- **COD orders:** paymentStatus set to COMPLETED upon delivery
- **Prepaid orders:** paymentStatus preserved from previous state

### Available Orders Pool
GET with `type=available` shows all READY_FOR_PICKUP orders without assigned riders. Any online rider can accept these orders on first-come-first-served basis.

---

## Summary

| Route | Method | Purpose | Key Features |
|-------|--------|---------|--------------|
| `/api/rider/location` | POST | Update location | Real-time sync to active orders |
| `/api/rider/location` | GET | Get status | Position, online status, active orders |
| `/api/rider/earnings` | GET | Earnings history | Period filtering, aggregation, pagination |
| `/api/rider/orders` | GET | List orders | Type filtering, nested relations |
| `/api/rider/orders` | POST | Order actions | Accept/pickup/deliver with earnings |
