# Admin Client Pages Documentation

## Overview

The Admin panel provides a comprehensive interface for platform administrators to manage all aspects of the Drop delivery platform including vendors, riders, orders, finance, marketing, compliance, and AI features.

**Base Path:** `/admin`

**Authentication:** All pages require admin authentication via `admin-token` stored in localStorage.

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Vendors](#2-vendors)
3. [Riders](#3-riders)
4. [Users](#4-users)
5. [Orders](#5-orders)
6. [Zones](#6-zones)
7. [Finance](#7-finance)
8. [Marketing](#8-marketing)
9. [Departments](#9-departments)
10. [Hyperlocal](#10-hyperlocal)
11. [Fleet Management](#11-fleet-management)
12. [AI Features](#12-ai-features)
13. [Compliance](#13-compliance)
14. [Analytics](#14-analytics)
15. [Inventory](#15-inventory)
16. [Settings](#16-settings)

---

## 1. Dashboard

**Path:** `/admin`

### User Flow
1. Admin logs in via `/admin/login`
2. Redirected to dashboard with real-time KPIs
3. View stats, recent orders, top vendors
4. Navigate to specific sections via sidebar

### UX Elements
- **Stats Grid:** 4 KPI cards (Revenue, Orders, Users, Riders) with growth indicators
- **Recent Orders Table:** Latest 10 orders with status badges
- **Order Status Summary:** Visual breakdown by status
- **Top Vendors List:** Ranked by order count and rating
- **Auto-refresh:** Data updates every 30 seconds

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Load dashboard | `/api/admin/dashboard` | GET |

### Actions
- Refresh data manually
- Navigate to orders list
- Navigate to vendors list

---

## 2. Vendors

**Path:** `/admin/vendors`

### User Flow
1. View all vendors in grid layout
2. Filter by status (active/pending/suspended) and type
3. Search by vendor name
4. Add new vendor or review pending applications
5. View/edit vendor details or suspend/activate vendors

### UX Elements
- **Stats Cards:** Total, Active, Pending, Suspended counts
- **Search & Filters:** Text search, status dropdown, type dropdown
- **Vendor Grid:** Cards showing image, name, type, rating, revenue, status
- **Add Vendor Modal:** Form with name, type, phone, email, address
- **Approval Modal:** Review and approve/reject pending vendors
- **Details Modal:** Full vendor information with stats

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List vendors | `/api/admin/vendors?page=1&status=all` | GET |
| Create vendor | `/api/admin/vendors` | POST (action: create) |
| Approve vendor | `/api/admin/vendors` | POST (action: approve) |
| Reject vendor | `/api/admin/vendors` | POST (action: reject) |
| Suspend vendor | `/api/admin/vendors` | POST (action: suspend) |
| Activate vendor | `/api/admin/vendors` | POST (action: activate) |
| Update vendor | `/api/admin/vendors` | POST (action: update) |

### Actions
- Add new vendor
- View vendor details
- Edit vendor information
- Approve/reject pending applications
- Suspend/activate vendors
- Filter and search vendors

---

## 3. Riders

**Path:** `/admin/riders`

### User Flow
1. View all delivery partners
2. Filter by status and zone
3. Search by name or phone
4. View rider details and performance
5. Approve new applications or manage existing riders

### UX Elements
- **Stats Cards:** Total, Active, Online, Pending counts
- **Filters:** Status, zone, search
- **Rider Grid/List:** Profile, stats, rating, earnings
- **Approval Modal:** Review rider documents and approve/reject

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List riders | `/api/admin/riders` | GET |
| Manage rider | `/api/admin/riders` | POST |

---

## 4. Users

**Path:** `/admin/users`

### User Flow
1. View all platform users
2. Search by name, email, or phone
3. View user details and order history
4. Manage user status

### UX Elements
- **Stats Cards:** Total users, active, new this month
- **User Table:** Name, email, phone, orders, status
- **Search:** Text search across user fields
- **User Details Modal:** Profile, addresses, order history

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List users | `/api/admin/users` | GET |
| Manage user | `/api/admin/users` | POST |

---

## 5. Orders

**Path:** `/admin/orders`

### User Flow
1. View all platform orders
2. Filter by status, date range, vendor
3. View order details
4. Track real-time order status

### UX Elements
- **Order Table:** Order ID, customer, vendor, total, status, time
- **Status Badges:** Color-coded by order status
- **Filters:** Status dropdown, date picker, vendor filter
- **Order Details Modal:** Items, addresses, timeline

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List orders | `/api/admin/orders` | GET |
| View order | `/api/admin/orders/[id]` | GET |
| Update order | `/api/admin/orders` | POST |

---

## 6. Zones

**Path:** `/admin/zones`

### User Flow
1. View delivery zones on map
2. Create/edit zone boundaries
3. Configure zone settings (delivery fee, radius)
4. Enable/disable zones

### UX Elements
- **Interactive Map:** Mapbox/Leaflet with zone polygons
- **Zone List:** Name, area, status, delivery fee
- **Zone Editor Modal:** Draw/edit zone boundaries
- **Settings Panel:** Radius, delivery fee, status toggle

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List zones | `/api/admin/zones` | GET |
| Create zone | `/api/admin/zones` | POST |
| Update zone | `/api/admin/zones/[id]` | PUT |
| Delete zone | `/api/admin/zones/[id]` | DELETE |

---

## 7. Finance

### 7.1 Finance Overview
**Path:** `/admin/finance`

Dashboard with revenue charts, pending payouts, commission summary.

### 7.2 Rider Payouts
**Path:** `/admin/finance/rider-payouts`

Manage delivery partner earnings and payouts.

### 7.3 Vendor Payouts
**Path:** `/admin/finance/vendor-payouts`

Manage vendor earnings and settlements.

### 7.4 Commissions
**Path:** `/admin/finance/commissions`

Configure and track platform commission rates.

### 7.5 Invoices
**Path:** `/admin/finance/invoices`

Generate and manage platform invoices.

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Finance stats | `/api/admin/finance` | GET |
| Rider payouts | `/api/admin/payouts?type=rider` | GET |
| Vendor payouts | `/api/admin/payouts?type=vendor` | GET |
| Process payout | `/api/admin/payouts` | POST |

---

## 8. Marketing

### 8.1 Marketing Overview
**Path:** `/admin/marketing`

Campaign dashboard with active promotions and metrics.

### 8.2 Coupons
**Path:** `/admin/marketing/coupons`

Create and manage discount coupons.

### 8.3 Referrals
**Path:** `/admin/marketing/referrals`

Track referral program performance.

### 8.4 Notifications
**Path:** `/admin/marketing/notifications`

Send push notifications to users.

### 8.5 Segments
**Path:** `/admin/marketing/segments`

Create user segments for targeted campaigns.

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List coupons | `/api/admin/marketing/coupons` | GET |
| Create coupon | `/api/admin/marketing/coupons` | POST |
| Send notification | `/api/admin/marketing/notifications` | POST |

---

## 9. Departments

### 9.1 Restaurants
**Path:** `/admin/departments/restaurants`

Manage restaurant vendors and their settings.

### 9.2 Grocery
**Path:** `/admin/departments/grocery`

Manage grocery stores and inventory.

### 9.3 Wine
**Path:** `/admin/departments/wine`

Manage wine shops with age verification settings.

### 9.4 Hyperlocal
**Path:** `/admin/departments/hyperlocal`

Overview of hyperlocal delivery categories.

### 9.5 Genie
**Path:** `/admin/departments/genie`

Manage on-demand delivery service (anything-anywhere).

### 9.6 Dine-In
**Path:** `/admin/departments/dine-in`

Manage dine-in restaurant partners.

---

## 10. Hyperlocal

### 10.1 Pharmacy
**Path:** `/admin/hyperlocal/pharmacy`

Manage pharmacy partners with prescription handling.

### 10.2 Meat
**Path:** `/admin/hyperlocal/meat`

Manage meat shop partners.

### 10.3 Dairy
**Path:** `/admin/hyperlocal/dairy`

Manage dairy delivery partners.

### 10.4 Pets
**Path:** `/admin/hyperlocal/pets`

Manage pet store partners.

### 10.5 Flowers
**Path:** `/admin/hyperlocal/flowers`

Manage florist partners.

---

## 11. Fleet Management

### 11.1 Bike Fleet
**Path:** `/admin/fleet/bike`

Manage bike delivery fleet.

### 11.2 EV Fleet
**Path:** `/admin/fleet/ev`

Manage electric vehicle fleet.

### 11.3 Fleet Zones
**Path:** `/admin/fleet/zones`

Configure fleet zone assignments.

### 11.4 Shifts
**Path:** `/admin/fleet/shifts`

Manage rider shift scheduling.

### 11.5 Live Tracking
**Path:** `/admin/fleet/live`

Real-time map showing all active riders.

### UX Elements (Live Tracking)
- **Interactive Map:** Real-time rider positions
- **Rider List:** Online riders with current status
- **Filter Panel:** Zone filter, status filter
- **Rider Details:** Click to view current order, earnings

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Live fleet | `/api/admin/fleet/live` | GET |
| Fleet stats | `/api/admin/fleet` | GET |
| Manage shifts | `/api/admin/fleet/shifts` | GET/POST |

---

## 12. AI Features

### 12.1 Demand Prediction
**Path:** `/admin/ai/demand`

View AI-powered demand forecasts by zone and time.

### 12.2 Fraud Detection
**Path:** `/admin/ai/fraud`

Review fraud alerts and suspicious activities.

### 12.3 Smart Assignment
**Path:** `/admin/ai/assignment`

Configure AI-based rider assignment settings.

### 12.4 Personalization
**Path:** `/admin/ai/personalization`

Configure recommendation engine settings.

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Demand prediction | `/api/admin/ai/demand` | GET |
| Fraud alerts | `/api/admin/ai/fraud` | GET |
| Assignment settings | `/api/admin/ai/assignment` | GET/PUT |
| Review fraud | `/api/admin/ai/fraud` | POST |

---

## 13. Compliance

### 13.1 Compliance Overview
**Path:** `/admin/compliance`

Dashboard with compliance status and alerts.

### 13.2 Age Verification
**Path:** `/admin/compliance/age`

Configure age verification for restricted products.

### 13.3 Liquor Licenses
**Path:** `/admin/compliance/liquor`

Manage vendor liquor license verification.

### 13.4 Audit Logs
**Path:** `/admin/compliance/audit`

View system audit trails and activity logs.

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Compliance status | `/api/admin/compliance` | GET |
| Age settings | `/api/admin/compliance/age` | GET/PUT |
| Liquor licenses | `/api/admin/compliance/liquor` | GET |

---

## 14. Analytics

**Path:** `/admin/analytics`

### User Flow
1. View platform-wide analytics
2. Select date range and metrics
3. Export reports

### UX Elements
- **Revenue Charts:** Line/bar charts for revenue trends
- **Order Charts:** Order volume over time
- **Category Breakdown:** Pie charts by vendor type
- **Geographic Heatmap:** Order density by location
- **Date Range Picker:** Custom date selection
- **Export Buttons:** Download CSV/PDF reports

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Analytics data | `/api/admin/analytics` | GET |
| Export report | `/api/admin/analytics/export` | POST |

---

## 15. Inventory

**Path:** `/admin/inventory/[vendorId]`

### User Flow
1. Select vendor
2. View their inventory items
3. Update stock levels
4. Set low stock alerts

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Vendor inventory | `/api/admin/inventory/[vendorId]` | GET |
| Update stock | `/api/admin/inventory/[vendorId]` | PUT |

---

## 16. Settings

**Path:** `/admin/settings`

### User Flow
1. Configure platform settings
2. Manage admin users
3. Set notification preferences
4. Configure integration settings

### UX Elements
- **General Settings:** Platform name, logo, contact
- **Business Settings:** Commission rates, fees
- **Notification Settings:** Email/SMS templates
- **Admin Users:** Manage admin accounts

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get settings | `/api/admin/settings` | GET |
| Update settings | `/api/admin/settings` | PUT |

---

## Common UX Patterns

### Layout
- **AdminLayout Component:** Sidebar navigation + header + main content
- **Sidebar:** Collapsible navigation with icons and labels
- **Header:** Title, breadcrumbs, user menu

### Loading States
- Spinner animation during data fetch
- Skeleton loading for tables/grids

### Error Handling
- Toast notifications for errors
- Retry button for failed requests

### Modals
- Confirmation dialogs for destructive actions
- Form modals for create/edit operations

### Tables
- Sortable columns
- Pagination controls
- Bulk selection for batch operations

---

## Summary

| Section | Pages | Key Features |
|---------|-------|--------------|
| Dashboard | 1 | Real-time KPIs, recent orders |
| Vendors | 1 | CRUD, approval workflow |
| Riders | 1 | CRUD, approval, zone assignment |
| Users | 1 | Search, view history |
| Orders | 1 | Filter, status management |
| Zones | 1 | Map editor, zone settings |
| Finance | 5 | Payouts, commissions, invoices |
| Marketing | 5 | Coupons, notifications, segments |
| Departments | 6 | Category-specific management |
| Hyperlocal | 5 | Specialty store management |
| Fleet | 5 | Live tracking, shifts, vehicles |
| AI | 4 | Demand, fraud, assignment |
| Compliance | 4 | Age verification, licenses |
| Analytics | 1 | Charts, reports, exports |
| Settings | 1 | Platform configuration |
