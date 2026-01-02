# Vendor Client Pages Documentation

## Overview

The Vendor portal provides a comprehensive interface for restaurant and store owners to manage their online presence, handle orders, and access the full Restaurant Management System (RMS) for dine-in operations.

**Base Path:** `/vendor`

**Authentication:** All pages require vendor authentication via phone OTP login.

---

## Table of Contents

1. [Login](#1-login)
2. [Onboarding](#2-onboarding)
3. [Dashboard](#3-dashboard)
4. [Orders](#4-orders)
5. [Menu Management](#5-menu-management)
6. [Analytics](#6-analytics)
7. [Earnings](#7-earnings)
8. [Reviews](#8-reviews)
9. [Settings](#9-settings)
10. [RMS - Restaurant Management System](#10-rms---restaurant-management-system)

---

## 1. Login

**Path:** `/vendor/login`

### User Flow
1. Vendor enters registered phone number
2. Receives OTP via SMS
3. Verifies OTP
4. If approved vendor → redirect to dashboard
5. If new/pending → redirect to onboarding

### UX Elements
- **Phone Input:** Country code + 10-digit number
- **OTP Input:** 6-digit verification code
- **Resend Timer:** 60-second countdown
- **Error States:** Invalid OTP, account not found

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Send OTP | `/api/auth/otp` | POST |
| Verify OTP | `/api/auth/otp` | POST |

---

## 2. Onboarding

**Path:** `/vendor/onboarding`

### User Flow
1. Enter business details (name, type, address)
2. Upload documents (FSSAI, GST, license)
3. Add bank account details
4. Set business hours
5. Upload menu (optional)
6. Submit for approval
7. Wait for admin verification

### UX Elements
- **Progress Stepper:** 5 steps with completion status
- **Business Details Form:**
  - Business name
  - Business type (Restaurant, Grocery, Wine Shop, etc.)
  - Address with map picker
  - Contact details
- **Document Upload:**
  - FSSAI license
  - GST certificate
  - Shop license
  - Owner ID proof
  - Bank statement
- **Bank Details:**
  - Account holder name
  - Account number
  - IFSC code
  - UPI ID (optional)
- **Business Hours:**
  - Day-wise open/close times
  - Holiday settings
- **Menu Upload:**
  - Bulk upload via CSV
  - Manual item addition

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Submit application | `/api/vendor/onboarding` | POST |
| Upload document | `/api/upload` | POST |

---

## 3. Dashboard

**Path:** `/vendor/dashboard`

### User Flow
1. View today's performance at a glance
2. Monitor active orders requiring attention
3. Quick access to order management
4. View top-selling items and recent reviews

### UX Elements
- **Stats Grid (4 cards):**
  - Today's Orders (count + growth %)
  - Today's Revenue (amount + growth %)
  - Average Rating (last 30 days)
  - Avg Prep Time (minutes)
- **Order Status Summary (3 cards):**
  - Orders need attention (red) - pending/new
  - Being prepared (yellow) - in progress
  - Completed today (green) - delivered
- **Active Orders List:**
  - Order number + status badge
  - Customer name
  - Items summary
  - Order total
  - Time since order
  - Accept/Reject buttons (new orders)
  - Mark Ready button (preparing orders)
  - Waiting indicator (ready orders)
- **Top Selling Items:**
  - Rank, item name, orders, revenue
  - Top 5 items
- **Recent Reviews:**
  - Customer name
  - Star rating
  - Comment preview
  - Time ago

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Dashboard stats | `/api/vendor/dashboard` | GET |
| Active orders | `/api/vendor/orders?status=active` | GET |
| Update order | `/api/vendor/orders/[id]` | PUT |

### Actions
- Accept new order
- Reject new order
- Mark order as preparing
- Mark order as ready
- Navigate to full order list
- View top selling items
- View all reviews

---

## 4. Orders

**Path:** `/vendor/orders`

### User Flow
1. View all orders with status tabs
2. Filter by date and status
3. Accept/reject incoming orders
4. Update order preparation status
5. View order details

### UX Elements
- **Tabs:** New / Preparing / Ready / Completed / Cancelled
- **Date Filter:** Today, yesterday, custom range
- **Order Cards:**
  - Order number
  - Customer name
  - Items list with quantities
  - Order total
  - Order type (Delivery, Takeaway, Dine-in)
  - Payment status (Paid, COD)
  - Status badge
  - Action buttons
- **Order Details Modal:**
  - Full item list with modifiers
  - Customer details (masked phone)
  - Delivery address
  - Special instructions
  - Order timeline
  - Print button
- **Sound Alert:** Audio notification for new orders
- **Empty State:** "No orders in this tab"

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List orders | `/api/vendor/orders` | GET |
| Order details | `/api/vendor/orders/[id]` | GET |
| Update order | `/api/vendor/orders/[id]` | PUT |

### Actions
- Filter orders by status/date
- Accept order → status: CONFIRMED
- Reject order → status: CANCELLED
- Start preparing → status: PREPARING
- Mark ready → status: READY_FOR_PICKUP
- Print order ticket
- View order details

---

## 5. Menu Management

**Path:** `/vendor/menu`

### User Flow
1. View all menu categories
2. Add/edit/delete menu items
3. Set availability (in-stock/out-of-stock)
4. Manage pricing and variations
5. Upload item images

### UX Elements
- **Category Sidebar:** List of menu categories
- **Category Management:**
  - Add new category
  - Reorder categories (drag-drop)
  - Edit/delete category
- **Item Grid/List:**
  - Item image
  - Name
  - Price
  - Veg/Non-veg indicator
  - Availability toggle
  - Edit/delete buttons
- **Item Form Modal:**
  - Item name
  - Description
  - Category selection
  - Price
  - Discounted price
  - Veg/Non-veg toggle
  - Preparation time
  - Image upload
  - Variants (Size, etc.)
  - Add-ons/Modifiers
  - Allergen info
  - Calories
- **Bulk Actions:**
  - Mark multiple items out of stock
  - Delete multiple items
- **Search:** Find items by name

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List menu | `/api/vendor/menu` | GET |
| Add item | `/api/vendor/menu` | POST |
| Update item | `/api/vendor/menu/[id]` | PUT |
| Delete item | `/api/vendor/menu/[id]` | DELETE |
| Toggle availability | `/api/vendor/menu/[id]/stock` | PUT |

### Actions
- Add menu category
- Add menu item
- Edit item details
- Toggle item availability (86'd)
- Delete item
- Reorder items/categories
- Upload item images
- Bulk stock management

---

## 6. Analytics

**Path:** `/vendor/analytics`

### User Flow
1. Select time period
2. View revenue and order trends
3. Analyze top-performing items
4. Track customer patterns
5. Export reports

### UX Elements
- **Date Range Picker:** Today, Week, Month, Custom
- **Revenue Chart:** Line/bar chart over time
- **Order Volume Chart:** Orders per day/hour
- **Summary Stats:**
  - Total revenue
  - Total orders
  - Average order value
  - Repeat customer %
- **Top Items Table:**
  - Item name
  - Quantity sold
  - Revenue generated
  - % of total
- **Peak Hours Heatmap:** Orders by day and hour
- **Customer Insights:**
  - New vs returning
  - Geographic distribution
- **Export Button:** Download CSV/PDF

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Analytics data | `/api/vendor/analytics` | GET |
| Export report | `/api/vendor/analytics/export` | POST |

---

## 7. Earnings

**Path:** `/vendor/earnings`

### User Flow
1. View earnings summary
2. See payout history
3. Track pending amounts
4. Download invoices

### UX Elements
- **Balance Card:**
  - Available balance
  - Pending settlement
  - Next payout date
- **Earnings Breakdown:**
  - Total orders
  - Gross revenue
  - Platform commission
  - Payment gateway fees
  - Net earnings
- **Payout History:**
  - Date
  - Amount
  - Status (Processed, Pending)
  - Reference number
- **Invoice List:**
  - Invoice number
  - Period
  - Amount
  - Download button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Earnings summary | `/api/vendor/earnings` | GET |
| Payout history | `/api/vendor/payouts` | GET |
| Invoices | `/api/vendor/invoices` | GET |

---

## 8. Reviews

**Path:** `/vendor/reviews`

### User Flow
1. View all customer reviews
2. Filter by rating
3. Respond to reviews
4. Flag inappropriate reviews

### UX Elements
- **Rating Summary:**
  - Overall rating
  - Star distribution (5,4,3,2,1)
  - Total reviews
- **Filter Tabs:** All, 5★, 4★, 3★, 2★, 1★
- **Review Cards:**
  - Customer name (first name + initial)
  - Star rating
  - Comment
  - Order items
  - Date
  - Reply button
  - Reply section (if responded)
- **Reply Modal:**
  - Original review display
  - Reply text input
  - Submit button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List reviews | `/api/vendor/reviews` | GET |
| Reply to review | `/api/vendor/reviews/[id]/reply` | POST |

---

## 9. Settings

**Path:** `/vendor/settings`

### User Flow
1. Update business information
2. Manage business hours
3. Configure order settings
4. Set notification preferences
5. Manage team access

### UX Elements
- **Business Details:**
  - Business name
  - Description
  - Logo upload
  - Cover image upload
  - Contact info
- **Address:**
  - Full address
  - Map location
  - Delivery radius
- **Business Hours:**
  - Day-wise schedule
  - Break times
  - Holiday mode
- **Order Settings:**
  - Minimum order value
  - Preparation time
  - Auto-accept orders
  - Max concurrent orders
- **Notifications:**
  - New order alerts
  - Review notifications
  - Payout updates
- **Team Management:**
  - Add staff members
  - Set permissions

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get settings | `/api/vendor/settings` | GET |
| Update settings | `/api/vendor/settings` | PUT |

---

## 10. RMS - Restaurant Management System

The RMS module provides a complete solution for managing dine-in restaurant operations.

### 10.1 RMS Dashboard
**Path:** `/vendor/rms`

Overview of dine-in operations with table status, reservations, and KDS summary.

### 10.2 Tables
**Path:** `/vendor/rms/tables`

#### User Flow
1. View floor plan with table layout
2. See table status at a glance
3. Open/close tables
4. Assign tables to orders/reservations

#### UX Elements
- **Floor Tabs:** Ground Floor, First Floor, Outdoor
- **Table Grid:**
  - Visual table representation
  - Color-coded status (Available, Occupied, Reserved, Cleaning)
  - Covers count
  - Current order info
- **Table Actions:**
  - Open table → create order
  - Close table → settle bill
  - Change status
  - View order details

### 10.3 POS (Point of Sale)
**Path:** `/vendor/rms/pos`

#### User Flow
1. Select table or start takeaway order
2. Browse menu categories
3. Add items with modifiers
4. Apply discounts
5. Process payment (cash, card, UPI)
6. Print receipt

#### UX Elements
- **Left Panel:** Menu categories and items
- **Right Panel:** Current order
- **Quick Keys:** Frequently ordered items
- **Modifier Selection:** Pop-up for customizations
- **Discount Modal:** Percentage or fixed discount
- **Payment Modal:** Split payment, payment methods
- **Receipt Preview:** Print or email

### 10.4 Orders (Dine-in)
**Path:** `/vendor/rms/orders`

Active dine-in orders with table assignment and status.

### 10.5 KDS (Kitchen Display System)
**Path:** `/vendor/rms/kds`

#### User Flow
1. View incoming tickets by station
2. Acknowledge new orders
3. Mark items as preparing
4. Mark items as ready
5. Recall completed items

#### UX Elements
- **Station Filter:** All, Hot, Cold, Grill, Bar, etc.
- **Ticket Cards:**
  - Order number + table number
  - Order type (Dine-in, Delivery, Takeaway)
  - Items with modifiers
  - Course number
  - Timer since order
  - Status buttons
- **Color Coding:**
  - New (red): Needs attention
  - Acknowledged (yellow): Being worked on
  - Ready (green): Completed
- **Bump Bar:** Quick action buttons

### 10.6 Menu
**Path:** `/vendor/rms/menu`

Full menu management with categories, items, modifiers, and pricing.

### 10.7 Inventory
**Path:** `/vendor/rms/inventory`

#### UX Elements
- **Item List:** Name, SKU, current stock, reorder level
- **Low Stock Alerts:** Highlighted items below threshold
- **Stock Adjustment:** Add/remove stock with reason
- **Purchase Orders:** Create orders to suppliers
- **Stock Movement History:** Track all changes

### 10.8 Reservations
**Path:** `/vendor/rms/reservations`

#### User Flow
1. View reservation calendar
2. Create new reservation
3. Assign table
4. Confirm or cancel reservation
5. Mark as seated/completed

#### UX Elements
- **Calendar View:** Week/day view with time slots
- **Reservation Form:**
  - Guest name and phone
  - Party size
  - Date and time
  - Table selection
  - Special requests
- **Reservation Card:**
  - Guest details
  - Status badge
  - Table assignment
  - Action buttons

### 10.9 Waitlist
**Path:** `/vendor/rms/waitlist`

Manage walk-in guests waiting for tables.

#### UX Elements
- **Waitlist Queue:** Ordered by arrival time
- **Entry Card:**
  - Guest name
  - Party size
  - Wait time
  - Estimated wait
  - Notify button
  - Seat button
- **Add to Waitlist:** Quick form

### 10.10 Staff
**Path:** `/vendor/rms/staff`

#### UX Elements
- **Employee List:** Name, role, status, shift
- **Employee Form:**
  - Personal details
  - Role selection
  - Hourly rate
  - PIN code
  - Permissions
- **Roles:** Manager, Server, Bartender, Chef, Host, etc.

### 10.11 Shifts
**Path:** `/vendor/rms/shifts`

POS shift management with cash tracking.

#### UX Elements
- **Open Shift:** Starting cash amount
- **Close Shift:** Closing cash count, reconciliation
- **Shift History:** Date, employee, opening/closing amounts, variance

### 10.12 Guests/CRM
**Path:** `/vendor/rms/guests`

Customer relationship management for dine-in guests.

#### UX Elements
- **Guest List:** Name, visits, total spend, last visit
- **Guest Profile:**
  - Contact info
  - Visit history
  - Average spend
  - Preferences
  - Notes
  - VIP status

### 10.13 Reports
**Path:** `/vendor/rms/reports`

#### UX Elements
- **Report Types:**
  - Daily sales summary
  - Revenue by category
  - Item performance
  - Staff sales
  - Hourly breakdown
  - Table turnover
- **Date Range Selector**
- **Export Options:** PDF, Excel, CSV

### 10.14 Settings
**Path:** `/vendor/rms/settings`

RMS-specific settings like tax rates, service charges, printing preferences.

---

## Common UX Patterns

### Layout
- **VendorLayout Component:** Sidebar navigation + header + main content
- **Sidebar:** Menu, Orders, Analytics, Settings sections
- **Header:** Business name, notifications, profile

### Order Notifications
- Sound alert for new orders
- Badge count on order icon
- Push notifications (if enabled)

### Real-time Updates
- WebSocket connection for order updates
- Auto-refresh for KDS
- Live table status

### Print Integration
- Receipt printing
- Kitchen ticket printing
- Invoice printing

### Modals
- Order details
- Item form
- Confirmation dialogs
- Payment processing

---

## Summary

| Section | Pages | Key Features |
|---------|-------|--------------|
| Login | 1 | OTP authentication |
| Onboarding | 1 | Multi-step application |
| Dashboard | 1 | Stats, active orders, quick actions |
| Orders | 1 | Status management, order details |
| Menu | 1 | CRUD, availability, images |
| Analytics | 1 | Charts, trends, reports |
| Earnings | 1 | Payouts, invoices |
| Reviews | 1 | View, respond, filter |
| Settings | 1 | Business config, hours, team |
| RMS | 14 | Complete dine-in management |

### RMS Sub-pages
| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/vendor/rms` | RMS overview |
| Tables | `/vendor/rms/tables` | Floor plan, table status |
| POS | `/vendor/rms/pos` | Order entry, payments |
| Orders | `/vendor/rms/orders` | Dine-in order list |
| KDS | `/vendor/rms/kds` | Kitchen display |
| Menu | `/vendor/rms/menu` | Menu management |
| Inventory | `/vendor/rms/inventory` | Stock management |
| Reservations | `/vendor/rms/reservations` | Booking calendar |
| Waitlist | `/vendor/rms/waitlist` | Walk-in queue |
| Staff | `/vendor/rms/staff` | Employee management |
| Shifts | `/vendor/rms/shifts` | POS shifts, cash tracking |
| Guests | `/vendor/rms/guests` | CRM, guest profiles |
| Reports | `/vendor/rms/reports` | Analytics, exports |
| Settings | `/vendor/rms/settings` | RMS configuration |
