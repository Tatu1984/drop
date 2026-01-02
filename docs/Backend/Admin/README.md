# Admin Backend API Routes Documentation

## Overview

The Admin API provides comprehensive management tools for platform operations. All routes require admin authentication via JWT token.

**Base Path:** `/api/admin`

**Authentication:** All routes require `Authorization: Bearer <token>` header or `admin-token` cookie.

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Vendors Management](#2-vendors-management)
3. [Orders Management](#3-orders-management)
4. [Users Management](#4-users-management)
5. [Riders Management](#5-riders-management)
6. [Zones Management](#6-zones-management)
7. [Finance](#7-finance)
8. [Marketing](#8-marketing)
9. [Departments](#9-departments)
10. [Inventory](#10-inventory)
11. [Analytics](#11-analytics)
12. [Settings](#12-settings)
13. [Fleet Management](#13-fleet-management)
14. [AI Features](#14-ai-features)
15. [Compliance](#15-compliance)

---

## 1. Dashboard

### GET `/api/admin/dashboard`

Fetches real-time platform statistics and metrics.

**Input Parameters:** None

**Input Validations:**
- Admin authentication required

**Algorithm:**
1. Fetches today's and yesterday's statistics using date range filtering
2. Calculates growth percentages for revenue, orders, and users
3. Aggregates order data by status
4. Identifies top-rated vendors
5. Filters online riders

**Output:**
```json
{
  "stats": {
    "todayRevenue": 125000,
    "revenueGrowth": 12.5,
    "totalOrders": 450,
    "ordersGrowth": 8.3,
    "activeUsers": 1200,
    "usersGrowth": 5.2,
    "onlineRiders": 45,
    "ridersChange": 3
  },
  "recentOrders": [
    {
      "id": "order_123",
      "orderNumber": "DRP1234567890",
      "customer": "John Doe",
      "vendor": "Pizza Palace",
      "total": 599,
      "status": "PREPARING",
      "time": "2024-01-15T10:30:00Z"
    }
  ],
  "statusSummary": {
    "pending": 12,
    "confirmed": 25,
    "preparing": 18,
    "picked_up": 8,
    "out_for_delivery": 15,
    "delivered": 350,
    "cancelled": 22
  },
  "topVendors": [
    {
      "id": "vendor_1",
      "name": "Pizza Palace",
      "orders": 120,
      "rating": 4.8
    }
  ]
}
```

---

## 2. Vendors Management

### GET `/api/admin/vendors`

Lists all vendors with filtering and pagination.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |
| search | string | - | Search by name |
| status | string | all | all, active, pending, suspended |
| type | string | - | Vendor type filter |

**Output:**
```json
{
  "items": [
    {
      "id": "vendor_1",
      "name": "Pizza Palace",
      "type": "RESTAURANT",
      "logo": "https://...",
      "rating": 4.5,
      "orders": 500,
      "products": 45,
      "revenue": 250000,
      "status": "active",
      "commissionRate": 15,
      "isVerified": true,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 12,
  "totalPages": 13,
  "stats": {
    "total": 150,
    "active": 120,
    "pending": 20,
    "suspended": 10
  }
}
```

### POST `/api/admin/vendors`

Creates a new vendor or performs vendor actions.

**Input Parameters:**
```json
{
  "action": "approve|reject|suspend|activate|create",
  "vendorId": "vendor_123",
  "name": "New Restaurant",
  "description": "Description",
  "type": "RESTAURANT",
  "address": "123 Main St",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "openingTime": "09:00",
  "closingTime": "22:00",
  "minimumOrder": 99,
  "commissionRate": 15
}
```

**Input Validations:**
- Vendor ID required for actions
- Unique vendor per type
- Required fields for create: name, type, address

### PUT `/api/admin/vendors`

Updates vendor details.

### DELETE `/api/admin/vendors`

Removes vendor from platform.

---

## 3. Orders Management

### GET `/api/admin/orders`

Lists all orders with filtering.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| search | string | - | Order number, customer, vendor |
| status | string | all | Order status filter |

**Output:**
```json
{
  "items": [
    {
      "id": "order_123",
      "orderNumber": "DRP1234567890",
      "customer": "John Doe",
      "customerPhone": "+919876543210",
      "vendor": "Pizza Palace",
      "vendorType": "RESTAURANT",
      "items": [{"name": "Margherita Pizza", "qty": 2}],
      "itemCount": 2,
      "total": 599,
      "status": "PREPARING",
      "rider": "Rider Name",
      "riderPhone": "+919876543211",
      "createdAt": "2024-01-15T10:30:00Z",
      "deliveryAddress": "456 Oak Street",
      "paymentMethod": "CARD",
      "paymentStatus": "COMPLETED"
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 20,
  "totalPages": 25,
  "stats": {
    "total": 500,
    "active": 50,
    "delivered": 420,
    "cancelled": 30
  }
}
```

### PUT `/api/admin/orders`

Updates order status.

**Input Parameters:**
```json
{
  "orderId": "order_123",
  "status": "CONFIRMED"
}
```

**Algorithm:**
1. Updates order status
2. Creates status history entry
3. Sends notification to user

### POST `/api/admin/orders`

Performs order actions (assign rider, cancel).

**Input Parameters:**
```json
{
  "orderId": "order_123",
  "action": "assign-rider|cancel",
  "riderId": "rider_123",
  "reason": "Customer requested"
}
```

**Algorithm (Cancel):**
1. Updates status to CANCELLED
2. If payment completed, refunds to wallet
3. Creates refund transaction
4. Sends cancellation notification

---

## 4. Users Management

### GET `/api/admin/users`

Lists all users with filtering.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Name, email, phone |
| status | string | all | all, verified, unverified |

**Output:**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "status": "verified",
      "orders": 25,
      "spent": 15000,
      "joinedAt": "2024-01-01T00:00:00Z",
      "lastOrder": "2024-01-15T00:00:00Z",
      "isKycVerified": true,
      "isAgeVerified": true
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 10,
  "totalPages": 100,
  "hasMore": true
}
```

### POST `/api/admin/users`

Creates user or performs verification actions.

**Input Parameters:**
```json
{
  "action": "create|verify-kyc|revoke-kyc|verify-age|revoke-age",
  "userId": "user_123",
  "name": "New User",
  "phone": "+919876543210",
  "email": "user@example.com"
}
```

---

## 5. Riders Management

### GET `/api/admin/riders`

Lists all riders.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Name, phone, zone |
| status | string | all | online, busy, offline, pending |

**Output:**
```json
{
  "items": [
    {
      "id": "rider_123",
      "name": "Rahul Kumar",
      "phone": "+919876543210",
      "status": "online",
      "rating": 4.8,
      "totalDeliveries": 500,
      "todayDeliveries": 12,
      "earnings": 50000,
      "todayEarnings": 1200,
      "vehicle": "BIKE",
      "vehicleNumber": "KA01AB1234",
      "zone": "HSR Layout",
      "isVerified": true,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "stats": {
    "total": 200,
    "online": 45,
    "busy": 30,
    "pending": 15
  }
}
```

### POST `/api/admin/riders`

Creates rider or performs actions.

**Input Parameters:**
```json
{
  "action": "create|approve|reject|suspend|activate",
  "riderId": "rider_123",
  "name": "New Rider",
  "phone": "+919876543210",
  "vehicleType": "BIKE",
  "vehicleNumber": "KA01AB1234",
  "assignedZone": "HSR Layout"
}
```

---

## 6. Zones Management

### GET `/api/admin/zones`

Lists all delivery zones.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Zone name filter |

**Output:**
```json
{
  "zones": [
    {
      "id": "zone_1",
      "name": "HSR Layout",
      "area": "HSR Layout, Sector 1-7",
      "status": "active",
      "riders": 15,
      "activeOrders": 25,
      "avgDeliveryTime": 28,
      "surgeMultiplier": 1.0,
      "coordinates": {"lat": 12.9116, "lng": 77.6389},
      "radius": 5
    }
  ],
  "stats": {
    "totalZones": 10,
    "activeZones": 8,
    "totalRiders": 100,
    "avgDeliveryTime": 30,
    "surgeZones": 2
  }
}
```

### POST `/api/admin/zones`

Creates zone or manages surge pricing.

**Input Parameters:**
```json
{
  "action": "start-surge|toggle-surge|end-surge|activate|deactivate",
  "zoneId": "zone_1",
  "name": "New Zone",
  "polygon": {"type": "Polygon", "coordinates": [...]},
  "deliveryFee": 40,
  "surgePricing": 1.5
}
```

---

## 7. Finance

### GET `/api/admin/finance`

Fetches financial overview.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| dateRange | string | week | today, week, month, year |
| tab | string | overview | Tab to display |

**Output:**
```json
{
  "overview": {
    "totalRevenue": 5000000,
    "todayRevenue": 125000,
    "commission": 750000,
    "pendingPayouts": 250000,
    "growthPercentage": 12.5
  },
  "transactions": [...],
  "paymentDistribution": [
    {"method": "CARD", "count": 500, "percentage": 45},
    {"method": "UPI", "count": 400, "percentage": 35}
  ],
  "revenueByMonth": [
    {"month": "Jan", "revenue": 800000}
  ]
}
```

### Sub-routes:

#### GET `/api/admin/finance/vendor-payouts`
Calculates vendor payouts based on commission rates.

#### GET `/api/admin/finance/rider-payouts`
Calculates rider earnings (base: 30/delivery + 5/km + tips + incentives).

#### GET/PUT `/api/admin/finance/commissions`
Manages commission rates by vendor type.

#### GET/POST `/api/admin/finance/invoices`
Generates and manages vendor invoices with 18% GST.

---

## 8. Marketing

### GET `/api/admin/marketing`

Fetches marketing overview with campaigns and coupons.

**Output:**
```json
{
  "stats": {
    "totalCampaigns": 10,
    "activeCampaigns": 5,
    "totalReach": 50000,
    "avgOpenRate": 35.5,
    "totalCoupons": 25,
    "activeCoupons": 15
  },
  "campaigns": [...],
  "coupons": [
    {
      "id": "coupon_1",
      "code": "SAVE20",
      "title": "20% Off",
      "type": "percentage",
      "value": 20,
      "minOrder": 199,
      "maxDiscount": 100,
      "usageLimit": 1000,
      "usedCount": 450,
      "validFrom": "2024-01-01",
      "validTo": "2024-01-31",
      "status": "active"
    }
  ]
}
```

### POST `/api/admin/marketing`

Creates coupons or campaigns.

**Input Parameters:**
```json
{
  "type": "coupon|campaign|referral-settings",
  "code": "SAVE20",
  "description": "Get 20% off",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrder": 199,
  "maxDiscount": 100,
  "usageLimit": 1000,
  "validFrom": "2024-01-01",
  "validTo": "2024-01-31"
}
```

### Sub-routes:

#### `/api/admin/marketing/coupons` - Coupon management
#### `/api/admin/marketing/notifications` - Push notification campaigns
#### `/api/admin/marketing/referrals` - Referral program settings
#### `/api/admin/marketing/segments` - User segmentation

---

## 9. Departments

### GET/POST `/api/admin/departments/restaurants`
Manages restaurant vendors with today's orders and revenue tracking.

### GET/POST `/api/admin/departments/grocery`
Manages grocery stores with low stock alerts (stockQuantity <= 10).

### GET/POST `/api/admin/departments/wine`
Manages wine shops with liquor license validation and 30-day expiry alerts.

### GET/POST `/api/admin/departments/dine-in`
Manages dine-in restaurants with seating capacity and occupancy tracking.

### GET/POST `/api/admin/departments/genie`
Manages on-demand delivery tasks with rider assignment.

### GET/POST `/api/admin/departments/hyperlocal`
Manages hyperlocal vendors (pharmacy, meat, dairy, pets, flowers, general store).

### GET/POST `/api/admin/hyperlocal/pharmacy`
Pharmacy-specific management with drug license requirements.

---

## 10. Inventory

### GET `/api/admin/inventory`

Fetches vendor inventory.

**Input Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vendorId | string | Yes | Vendor ID |
| page | number | No | Page number |
| limit | number | No | Items per page |
| search | string | No | Product name |
| category | string | No | Category filter |
| stockStatus | string | No | in_stock, out_of_stock, low_stock |
| sortBy | string | No | Sort field |
| sortOrder | string | No | asc, desc |

**Output:**
```json
{
  "vendor": {"id": "...", "name": "...", "type": "..."},
  "products": [
    {
      "id": "product_1",
      "name": "Margherita Pizza",
      "price": 299,
      "discountPrice": 249,
      "inStock": true,
      "stockQuantity": 50,
      "category": {"id": "cat_1", "name": "Pizzas"},
      "rating": 4.5,
      "orderCount": 120
    }
  ],
  "categories": [...],
  "stats": {
    "total": 100,
    "inStock": 85,
    "outOfStock": 5,
    "lowStock": 10,
    "avgPrice": 350
  },
  "pagination": {...}
}
```

### POST/PUT/DELETE `/api/admin/inventory`

Creates, updates, or deletes products.

---

## 11. Analytics

### GET `/api/admin/analytics`

Fetches platform analytics.

**Input Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| dateRange | string | 7days | 7days, month, 3months, year |

**Output:**
```json
{
  "kpis": {
    "avgOrderValue": 450,
    "completionRate": 94.5,
    "avgDeliveryTime": 32,
    "satisfaction": 4.6
  },
  "quickStats": {
    "newUsers": 150,
    "activeVendors": 120,
    "activeRiders": 80
  },
  "hourlyDistribution": [
    {"hour": 12, "orders": 85}
  ],
  "topVendors": [...],
  "topRiders": [...],
  "zonePerformance": [...]
}
```

---

## 12. Settings

### GET `/api/admin/settings`

Fetches platform settings by tab.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tab | string | general, delivery, payments, notifications, commissions, security |

**Output:**
```json
{
  "settings": {
    "general": {
      "platformName": "Drop",
      "supportEmail": "support@drop.com",
      "currency": "INR",
      "timezone": "Asia/Kolkata"
    },
    "delivery": {
      "baseFee": 40,
      "freeDeliveryAbove": 199,
      "perKmCharge": 5,
      "maxDistance": 15
    },
    "payments": {
      "enabledMethods": ["CARD", "UPI", "WALLET", "COD"],
      "cod": {"enabled": true, "maxAmount": 5000}
    },
    "commissions": {
      "riderEarnings": {
        "basePerDelivery": 30,
        "perKm": 5,
        "peakBonus": 20
      }
    }
  }
}
```

### PUT `/api/admin/settings`

Updates platform settings.

---

## 13. Fleet Management

### GET `/api/admin/fleet/bike`
Fetches bike fleet with today's deliveries and maintenance status.

### GET `/api/admin/fleet/ev`
Fetches EV fleet with battery levels and charging status.
- Battery simulation: 0-100%
- Range calculation: batteryLevel * 0.8 km

### GET `/api/admin/fleet/live`
Real-time rider tracking with locations, zones, and unassigned orders.

### GET/POST `/api/admin/fleet/shifts`
Manages rider shifts (Morning, Afternoon, Evening, Night).

### GET/POST `/api/admin/fleet/zones`
Manages delivery zones with demand data.

---

## 14. AI Features

### GET/PUT `/api/admin/ai/assignment`
Configures auto-assignment algorithm settings.

**Settings:**
```json
{
  "enabled": true,
  "maxDistance": 5,
  "maxWaitTime": 120,
  "prioritizeRating": true,
  "prioritizeProximity": true,
  "allowBatching": true,
  "batchWindow": 5
}
```

### GET/POST `/api/admin/ai/fraud`
Fraud detection alerts with severity levels.

**Alert Types:**
- suspicious_order
- multiple_accounts
- coupon_abuse
- payment_fraud
- fake_review

### GET/POST `/api/admin/ai/demand`
Demand prediction by zone and hour.

### GET/POST `/api/admin/ai/personalization`
ML model management for recommendations.

---

## 15. Compliance

### GET/POST `/api/admin/compliance`
KYC verification and compliance alerts.

**Actions:**
- approve/reject KYC
- resolve alerts
- send reminders

### GET `/api/admin/compliance/audit`
Audit logs with severity and category filters.

### GET/POST `/api/admin/compliance/liquor`
Liquor license management for wine shops.

### GET/POST `/api/admin/compliance/age`
Age verification for age-restricted products.

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

### Pagination Response
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |
