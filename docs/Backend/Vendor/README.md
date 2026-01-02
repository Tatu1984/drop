# Vendor/RMS Backend API Routes Documentation

## Overview

The Vendor API provides a comprehensive Restaurant Management System (RMS) with endpoints for outlet management, table operations, orders, menu management, inventory, staff, and analytics.

**Base Path:** `/api/rms`

**Authentication:** All routes require vendor authentication via `requireRMSAuth()` middleware.

---

## Table of Contents

1. [Outlets](#1-outlets)
2. [Tables](#2-tables)
3. [Floors & Zones](#3-floors--zones)
4. [Reservations](#4-reservations)
5. [Waitlist](#5-waitlist)
6. [Dine-In Orders](#6-dine-in-orders)
7. [Menu Management](#7-menu-management)
8. [KDS (Kitchen Display)](#8-kds-kitchen-display)
9. [Inventory](#9-inventory)
10. [Employees](#10-employees)
11. [Time Tracking](#11-time-tracking)
12. [Suppliers](#12-suppliers)
13. [Recipes](#13-recipes)
14. [Waste Management](#14-waste-management)
15. [Gift Cards](#15-gift-cards)
16. [Guests & CRM](#16-guests--crm)
17. [Loyalty & Marketing](#17-loyalty--marketing)
18. [Printers](#18-printers)
19. [Analytics & Reports](#19-analytics--reports)

---

## 1. Outlets

### GET `/api/rms/outlets`

Lists all outlets for a vendor.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| vendorId | string | Vendor ID |
| page | number | Page number |
| limit | number | Items per page |

**Output:**
```json
{
  "success": true,
  "data": {
    "outlets": [
      {
        "id": "outlet_1",
        "name": "Downtown Branch",
        "code": "BLR-001",
        "address": "123 Main St",
        "isOpen": true,
        "taxRate": 5,
        "serviceChargeRate": 10,
        "_count": {"tables": 20, "floors": 2, "reservations": 15}
      }
    ]
  }
}
```

### POST `/api/rms/outlets`

Creates a new outlet.

**Input Parameters:**
```json
{
  "vendorId": "vendor_123",
  "name": "New Branch",
  "code": "BLR-002",
  "address": "456 Oak St",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "openingTime": "09:00",
  "closingTime": "22:00",
  "taxRate": 5,
  "serviceChargeRate": 10
}
```

**Validations:**
- name, code, address, coordinates required
- Unique code validation

---

## 2. Tables

### GET `/api/rms/tables`

Lists tables for an outlet.

**Input Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| outletId | string | Yes | Outlet ID |
| floorId | string | No | Filter by floor |
| status | string | No | Table status filter |

### POST `/api/rms/tables`

Creates a new table.

**Input Parameters:**
```json
{
  "outletId": "outlet_1",
  "tableNumber": "T1",
  "floorId": "floor_1",
  "zoneId": "zone_1",
  "capacity": 4,
  "minCapacity": 2,
  "shape": "RECTANGLE",
  "positionX": 100,
  "positionY": 200
}
```

### PATCH `/api/rms/tables/[tableId]`

Updates table status.

**Input Parameters:**
```json
{
  "status": "OCCUPIED"
}
```

**Valid Statuses:** AVAILABLE, OCCUPIED, RESERVED, CLEANING, BLOCKED

---

## 3. Floors & Zones

### GET/POST `/api/rms/floors`

Manages floor layouts.

**Output:**
```json
{
  "floors": [
    {
      "id": "floor_1",
      "name": "Ground Floor",
      "sortOrder": 0,
      "_count": {"tables": 10, "zones": 3},
      "zones": [{"id": "zone_1", "name": "Window"}]
    }
  ]
}
```

---

## 4. Reservations

### GET `/api/rms/reservations`

Lists reservations with filtering.

**Input Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| outletId | string | Yes | Outlet ID |
| date | string | No | Filter by date |
| status | string | No | Reservation status |
| guestPhone | string | No | Search by phone |

### POST `/api/rms/reservations`

Creates a reservation.

**Input Parameters:**
```json
{
  "outletId": "outlet_1",
  "guestName": "John Doe",
  "guestPhone": "+919876543210",
  "guestCount": 4,
  "date": "2024-01-20",
  "timeSlot": "19:00",
  "tableId": "table_1",
  "duration": 90,
  "specialRequests": "Birthday celebration"
}
```

**Algorithm:**
1. Check table availability for time slot
2. Detect conflicts with existing reservations
3. Create reservation
4. Update table status if confirmed

### PATCH `/api/rms/reservations/[reservationId]`

Updates reservation status.

**Valid Statuses:** PENDING, CONFIRMED, SEATED, COMPLETED, NO_SHOW, CANCELLED

---

## 5. Waitlist

### GET `/api/rms/waitlist`

Gets current waitlist with positions.

**Output:**
```json
{
  "waitlist": [
    {
      "id": "wait_1",
      "guestName": "Jane Doe",
      "guestPhone": "+919876543210",
      "guestCount": 2,
      "estimatedWait": 15,
      "position": 1,
      "waitTime": 10
    }
  ]
}
```

### POST `/api/rms/waitlist`

Adds to waitlist.

**Algorithm:**
- Auto-calculates wait time (15 min per party ahead)
- Returns position in queue

### PATCH `/api/rms/waitlist/[waitlistId]`

Updates waitlist entry status.

**Valid Statuses:** WAITING, NOTIFIED, SEATED, LEFT, CANCELLED

---

## 6. Dine-In Orders

### GET `/api/rms/orders`

Lists dine-in orders.

**Input Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| outletId | string | Yes | Outlet ID |
| tableId | string | No | Filter by table |
| status | string | No | Order status |
| date | string | No | Filter by date |

### POST `/api/rms/orders`

Creates a dine-in order.

**Input Parameters:**
```json
{
  "outletId": "outlet_1",
  "tableId": "table_1",
  "serverEmployeeId": "emp_1",
  "createdByEmployeeId": "emp_1",
  "guestCount": 4,
  "orderType": "DINE_IN",
  "items": [
    {
      "menuItemId": "item_1",
      "quantity": 2,
      "seatNumber": 1,
      "courseNumber": 1,
      "modifiers": [{"name": "Extra cheese", "price": 30}],
      "specialInstructions": "No onions"
    }
  ]
}
```

**Algorithm:**
1. Generate order number (DIN-timestamp)
2. Calculate totals (subtotal, tax, service charge)
3. Create order items
4. Update table to OCCUPIED

**Order Types:** DINE_IN, TAKEAWAY, BAR_TAB, ROOM_SERVICE

**Order Statuses:** OPEN, PRINTED, PARTIALLY_PAID, PAID, CLOSED, VOID

### Order Items

#### POST `/api/rms/orders/[orderId]/items`

Adds items to order.

#### PATCH `/api/rms/orders/[orderId]/items/[itemId]`

Updates item status.

**Item Statuses:** PENDING, SENT, ACKNOWLEDGED, PREPARING, READY, SERVED, VOID

### Payments

#### POST `/api/rms/orders/[orderId]/payment`

Processes payment.

**Input Parameters:**
```json
{
  "method": "CARD",
  "amount": 599,
  "tipAmount": 50,
  "processedByEmployeeId": "emp_1",
  "cardLastFour": "1234",
  "cardType": "VISA"
}
```

**Payment Methods:** CASH, CARD, UPI, WALLET, GIFT_CARD, CREDIT, COMPLIMENTARY

### Split Bills

#### POST `/api/rms/orders/[orderId]/split`

Splits bill for the table.

**Split Types:** EQUAL, BY_SEAT, BY_ITEM, CUSTOM

### Discounts

#### POST `/api/rms/orders/[orderId]/discount`

Applies discount to order.

**Input Parameters:**
```json
{
  "name": "Happy Hour",
  "type": "PERCENTAGE",
  "value": 20,
  "appliedByEmployeeId": "emp_1",
  "requiresApproval": false,
  "reason": "Loyalty discount"
}
```

---

## 7. Menu Management

### Menu Items

#### GET/POST `/api/rms/menu/items`

**Input Parameters (POST):**
```json
{
  "categoryId": "cat_1",
  "name": "Margherita Pizza",
  "price": 299,
  "description": "Classic cheese pizza",
  "isVeg": true,
  "isVegan": false,
  "isGlutenFree": false,
  "spiceLevel": 1,
  "calories": 250,
  "prepTime": 15,
  "allergens": ["dairy", "gluten"],
  "tags": ["Popular", "Chef's Special"],
  "modifierGroupIds": ["mod_1", "mod_2"]
}
```

#### PATCH `/api/rms/menu/items/[itemId]`

Toggles availability (86'd items).

### Menu Categories

#### GET/POST `/api/rms/menu/categories`

Manages menu categories with hierarchy support.

### Menu Sets

#### GET/POST `/api/rms/menu/sets`

Manages menu sets (Lunch, Dinner, Happy Hour) with time restrictions.

### Modifiers

#### GET/POST `/api/rms/menu/modifiers`

Manages modifier groups and options.

**Input Parameters:**
```json
{
  "vendorId": "vendor_1",
  "name": "Size",
  "minSelections": 1,
  "maxSelections": 1,
  "isRequired": true,
  "modifiers": [
    {"name": "Small", "price": 0, "isDefault": true},
    {"name": "Large", "price": 50}
  ]
}
```

---

## 8. KDS (Kitchen Display)

### Stations

#### GET/POST `/api/rms/kds/stations`

Manages KDS stations.

**Station Types:** HOT, COLD, GRILL, FRY, SALAD, DESSERT, BAR, EXPO, PACKAGING

### Tickets

#### GET/POST `/api/rms/kds/tickets`

Manages kitchen tickets.

#### PATCH `/api/rms/kds/tickets/[ticketId]`

Updates ticket status.

**Ticket Statuses:** NEW, ACKNOWLEDGED, IN_PROGRESS, READY, SERVED, RECALLED

**Item Status Mapping:**
- ACKNOWLEDGED → ACKNOWLEDGED
- IN_PROGRESS → PREPARING
- READY → READY
- SERVED → SERVED

---

## 9. Inventory

### GET/POST `/api/rms/inventory/items`

Manages inventory items.

**Input Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| vendorId/outletId | string | Filter scope |
| categoryId | string | Category filter |
| lowStock | boolean | Filter low stock items |
| search | string | Search by name/SKU |

**Output includes:**
- `isLowStock`: Current stock < reorder point
- `needsReorder`: Current stock < safety stock

### Categories

#### GET/POST `/api/rms/inventory/categories`

Manages inventory categories with hierarchy.

---

## 10. Employees

### GET/POST `/api/rms/employees`

Manages staff members.

**Employee Roles:** OWNER, MANAGER, SUPERVISOR, HOST, SERVER, BARTENDER, CHEF, LINE_COOK, CASHIER, BUSSER, RUNNER, DISHWASHER

**Input Parameters (POST):**
```json
{
  "vendorId": "vendor_1",
  "outletId": "outlet_1",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210",
  "role": "SERVER",
  "hourlyRate": 150,
  "pin": "1234"
}
```

---

## 11. Time Tracking

### Schedules

#### GET/POST `/api/rms/schedules`

Manages employee schedules.

**Schedule Statuses:** SCHEDULED, CONFIRMED, SWAP_REQUESTED, CANCELLED

### Shifts

#### GET/POST `/api/rms/shifts`

Manages POS shifts with cash management.

**Shift Statuses:** OPEN, CLOSED, RECONCILED

### Time Entries

#### GET/POST `/api/rms/time-entries`

Clock in/out management.

---

## 12. Suppliers

### GET/POST `/api/rms/suppliers`

Manages suppliers for procurement.

**Input Parameters:**
```json
{
  "vendorId": "vendor_1",
  "name": "Fresh Produce Co",
  "code": "FPC001",
  "contactName": "Jane Smith",
  "email": "jane@freshproduce.com",
  "paymentTerms": 30,
  "leadTime": 2
}
```

---

## 13. Recipes

### GET/POST `/api/rms/recipes`

Manages recipes with cost calculation.

**Input Parameters:**
```json
{
  "vendorId": "vendor_1",
  "name": "Pizza Dough",
  "yieldQuantity": 10,
  "yieldUnit": "portions",
  "prepTime": 30,
  "cookTime": 0,
  "ingredients": [
    {
      "inventoryItemId": "inv_1",
      "quantity": 1,
      "unit": "kg",
      "wastagePercent": 5
    }
  ]
}
```

**Algorithm:**
- Calculates totalCost from ingredients
- Calculates costPerServing (totalCost / yieldQuantity)

---

## 14. Waste Management

### GET/POST `/api/rms/waste`

Logs waste for compliance and cost tracking.

**Waste Reasons:** EXPIRED, SPOILED, OVERPRODUCTION, CUSTOMER_RETURN, DROPPED, BURNT, QUALITY_ISSUE, OTHER

**Algorithm:**
1. Create waste log with items
2. Update inventory stock levels
3. Create stock movements for tracking

---

## 15. Gift Cards

### GET/POST `/api/rms/gift-cards`

Manages gift card program.

**Algorithm (Create):**
1. Generate unique card number (GC + 12 digits)
2. Generate 4-digit PIN
3. Create card with initial balance
4. Create PURCHASE transaction

---

## 16. Guests & CRM

### Guest Profiles

#### GET/POST `/api/rms/guests`

Manages customer profiles.

**Output includes:**
- totalVisits, totalSpend, averageSpend
- loyaltyTier, loyaltyPoints
- VIP status, tags

### Guest Search

#### GET `/api/rms/guests/search`

Quick search by name/phone/email.

### Feedback

#### GET/POST `/api/rms/feedback`

Collects and manages customer feedback.

**Ratings:** overallRating, foodRating, serviceRating, ambienceRating (1-5)

---

## 17. Loyalty & Marketing

### Loyalty Programs

#### GET/POST `/api/rms/loyalty/programs`

Manages loyalty programs with tiers and rewards.

**Reward Types:** DISCOUNT_FIXED, DISCOUNT_PERCENT, FREE_ITEM, UPGRADE

### Campaigns

#### GET/POST/PATCH `/api/rms/campaigns`

Manages marketing campaigns.

**Campaign Types:** PROMOTIONAL, BIRTHDAY, ANNIVERSARY, WIN_BACK, FEEDBACK, ANNOUNCEMENT

**Channels:** EMAIL, SMS, PUSH, WHATSAPP

**Campaign Statuses:** DRAFT, SCHEDULED, SENDING, SENT, CANCELLED

---

## 18. Printers

### GET/POST/PUT/DELETE `/api/rms/printers`

Manages printer configurations.

**Printer Types:** RECEIPT, KITCHEN, BAR, LABEL

**Connection Types:** USB, NETWORK, BLUETOOTH

---

## 19. Analytics & Reports

### Dashboard

#### GET `/api/rms/analytics/dashboard`

Real-time dashboard KPIs.

**Output:**
```json
{
  "todaysSales": 125000,
  "todaysOrders": 85,
  "todaysCovers": 180,
  "tableOccupancy": 75,
  "paymentBreakdown": {...},
  "topItems": [...],
  "activeOrders": [...],
  "hourlySales": [...],
  "upcomingReservations": [...]
}
```

### Trends

#### GET `/api/rms/analytics/trends`

Trend analysis over time.

**Parameters:**
- period: week, month, quarter, year
- groupBy: hour, day, week, month

### Reports

#### Daily Sales
`GET /api/rms/reports/daily-sales`

#### Revenue
`GET /api/rms/reports/revenue`
- Revenue by category, order type, payment method

#### Items
`GET /api/rms/reports/items`
- Top sellers, slow movers, category performance

#### Staff
`GET /api/rms/reports/staff`
- Sales per employee, tips, labor hours

#### Inventory
`GET /api/rms/reports/inventory`
- Valuation, waste analysis, stock movements

---

## Common Response Format

### Success
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error
```json
{
  "success": false,
  "error": "Error description"
}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Summary Statistics

- **Total Endpoints:** 60+
- **Authentication:** All protected by RMS auth middleware
- **Database:** Prisma ORM with transactions
- **Validations:** Input validation, relational integrity, conflict detection
