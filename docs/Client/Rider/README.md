# Rider Client Pages Documentation

## Overview

The Rider app provides a mobile-first interface for delivery partners to manage their availability, accept orders, navigate to pickups and deliveries, and track earnings.

**Base Path:** `/rider`

**Authentication:** All pages require rider authentication via phone OTP and rider onboarding approval.

---

## Table of Contents

1. [Login](#1-login)
2. [Onboarding](#2-onboarding)
3. [Dashboard](#3-dashboard)
4. [Orders](#4-orders)
5. [Earnings](#5-earnings)
6. [Profile](#6-profile)
7. [Settings](#7-settings)

---

## 1. Login

**Path:** `/rider/login`

### User Flow
1. Rider enters phone number
2. Receives OTP via SMS
3. Enters OTP to verify
4. If approved rider → redirect to dashboard
5. If new/pending → redirect to onboarding

### UX Elements
- **Phone Input:** Country code (+91) + 10-digit number
- **OTP Input:** 6-digit verification code
- **Resend Timer:** 60-second countdown
- **Loading States:** Button spinner during verification
- **Error Messages:** Invalid OTP, network errors

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Send OTP | `/api/auth/otp` | POST |
| Verify OTP | `/api/auth/otp` | POST |

### Actions
- Enter phone number
- Request OTP
- Verify OTP
- Resend OTP (after timer)

---

## 2. Onboarding

**Path:** `/rider/onboarding`

### User Flow
1. Enter personal details (name, email, emergency contact)
2. Upload documents (ID proof, license, vehicle RC)
3. Add vehicle details
4. Agree to terms and conditions
5. Submit application
6. Wait for admin approval

### UX Elements
- **Step Indicator:** Progress steps (1/4, 2/4, etc.)
- **Personal Details Form:**
  - Full name
  - Email address
  - Date of birth
  - Emergency contact
- **Document Upload:**
  - Aadhaar card (front/back)
  - Driving license
  - Vehicle registration certificate
  - PAN card
  - Profile photo
- **Vehicle Details:**
  - Vehicle type (Bike, Scooter, EV)
  - Registration number
  - Vehicle model
  - Vehicle color
- **Bank Details:**
  - Account holder name
  - Account number
  - IFSC code
  - Bank name
- **Terms Checkbox:** Must agree to proceed
- **Submit Button:** Final submission

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Submit application | `/api/rider/onboarding` | POST |
| Upload document | `/api/upload` | POST |
| Check status | `/api/rider/status` | GET |

### Actions
- Fill personal information
- Upload required documents
- Enter vehicle information
- Enter bank details
- Submit application
- Check application status

---

## 3. Dashboard

**Path:** `/rider`

### User Flow
1. View online/offline toggle
2. If online → wait for order assignment
3. Receive new order notification
4. Accept or decline order
5. Navigate to pickup location
6. Mark as picked up
7. Navigate to delivery location
8. Mark as delivered
9. View earning for completed delivery

### UX Elements
- **Header:**
  - Menu button (opens sidebar)
  - Rider name with greeting
  - Rating display
  - Online/Offline toggle button (green when online)
- **Status Banner:**
  - Green: "You are online - Waiting for orders"
  - Gray: "You are offline"
- **Map Section:**
  - Full-width map showing rider location
  - Route line to destination
  - Store marker (pickup)
  - Customer marker (delivery)
- **Today's Stats Card:**
  - Today's earnings
  - Delivery count
  - Bonus amount
- **Current Order Card (when active):**
  - Status badge (Pickup/Delivering)
  - Destination address
  - Order items list
  - Payment method
  - Earning amount
  - Call button
  - Navigate button
  - Action button (Picked Up / Mark Delivered)
- **Waiting State:** Animation when waiting for orders
- **Offline State:** "Go Online" button
- **Quick Actions Grid:**
  - Earnings shortcut
  - History shortcut
  - SOS emergency button
- **Mobile Sidebar:**
  - Profile avatar and name
  - Navigation links (Earnings, History, Profile, Settings, Help)
  - Logout button
- **SOS Modal:**
  - Emergency type buttons (Accident, Harassment, Vehicle Breakdown, Other)
  - Emergency contacts (Police, Ambulance, Drop Help)

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Update location | `/api/rider/location` | POST |
| Get status | `/api/rider/location` | GET |
| Get available orders | `/api/rider/orders?type=available` | GET |
| Accept order | `/api/rider/orders` | POST (action: accept) |
| Mark picked up | `/api/rider/orders` | POST (action: pickup) |
| Mark delivered | `/api/rider/orders` | POST (action: deliver) |

### Actions
- Toggle online/offline status
- Accept incoming order
- Call restaurant
- Navigate to pickup
- Mark order as picked up
- Call customer
- Navigate to customer
- Mark order as delivered
- Access SOS emergency
- View sidebar menu

### Order State Machine
```
READY_FOR_PICKUP
      │
      ▼ (accept)
  PICKED_UP
      │
      ▼ (pickup button)
OUT_FOR_DELIVERY
      │
      ▼ (deliver button)
  DELIVERED
```

---

## 4. Orders

**Path:** `/rider/orders`

### User Flow
1. View order history
2. Filter by status (completed, cancelled)
3. View order details
4. See earnings per order

### UX Elements
- **Tabs:** Active / Completed / Cancelled
- **Order Cards:**
  - Order number
  - Customer name (masked)
  - Vendor name
  - Items summary
  - Total amount
  - Earning amount
  - Timestamp
  - Status badge
- **Order Details Modal:**
  - Full order items
  - Pickup address
  - Delivery address
  - Timeline (accepted → picked up → delivered)
  - Earnings breakdown
- **Empty State:** "No orders in this category"
- **Pull to Refresh:** Refresh order list

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List orders | `/api/rider/orders` | GET |
| Order details | `/api/rider/orders/[id]` | GET |

### Actions
- View order history
- Filter by status
- View order details
- Pull to refresh

---

## 5. Earnings

**Path:** `/rider/earnings`

### User Flow
1. View earnings summary for selected period
2. Switch between today/week/month
3. View individual delivery earnings
4. Track incentives and penalties

### UX Elements
- **Period Selector:** Today / Week / Month / All Time
- **Summary Cards:**
  - Total earnings (base + tips + incentives - penalties)
  - Base earning
  - Tips received
  - Incentives earned
  - Penalties (if any)
  - Delivery count
- **Earnings List:**
  - Date/time
  - Order number
  - Base earning
  - Tip
  - Incentive
  - Total
- **Lifetime Stats:**
  - Total deliveries (all time)
  - Total earnings (all time)
  - Average rating
- **Pagination:** Load more earnings
- **Empty State:** "No earnings for this period"

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get earnings | `/api/rider/earnings?period=today` | GET |

### Actions
- Switch time period
- View earnings breakdown
- View lifetime stats
- Load more earnings

---

## 6. Profile

**Path:** `/rider/profile`

### User Flow
1. View profile information
2. Update personal details
3. View documents status
4. Check vehicle information
5. View performance metrics

### UX Elements
- **Profile Header:**
  - Avatar
  - Full name
  - Phone number
  - Email
  - Rating with star
  - Edit button
- **Performance Stats:**
  - Total deliveries
  - Acceptance rate
  - On-time rate
  - Average rating
- **Personal Details Section:**
  - Name
  - Phone
  - Email
  - Date of birth
  - Emergency contact
- **Documents Section:**
  - Document type
  - Status (Verified, Pending, Expired)
  - Expiry date
  - Renewal button
- **Vehicle Section:**
  - Vehicle type
  - Registration number
  - Model
  - Color
- **Bank Details Section:**
  - Bank name
  - Account number (masked)
  - IFSC code
  - Edit button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get profile | `/api/rider/profile` | GET |
| Update profile | `/api/rider/profile` | PUT |
| Upload document | `/api/upload` | POST |

### Actions
- View profile details
- Edit personal information
- Update documents
- Update bank details

---

## 7. Settings

**Path:** `/rider/settings`

### User Flow
1. Configure notification preferences
2. Set language preference
3. View app information
4. Access help and support
5. Logout

### UX Elements
- **Notification Settings:**
  - New order alerts (toggle)
  - Earnings updates (toggle)
  - Promotional messages (toggle)
  - Sound enabled (toggle)
- **Language Selection:**
  - English
  - Hindi
  - Kannada (regional options)
- **App Settings:**
  - Dark mode (toggle)
  - Map navigation app (Google Maps, default)
- **Information:**
  - App version
  - Terms of service
  - Privacy policy
  - Help & support
- **Account:**
  - Logout button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get settings | `/api/rider/settings` | GET |
| Update settings | `/api/rider/settings` | PUT |

### Actions
- Toggle notification preferences
- Change language
- Toggle dark mode
- Select navigation app
- View terms/privacy
- Access help
- Logout

---

## Common UX Patterns

### Navigation
- **Header:** Back button, title, action buttons
- **Sidebar:** Swipe or tap menu icon to open
- **Bottom Actions:** Fixed action buttons

### Map Integration
- **Leaflet/MapLibre:** For displaying maps
- **Route Display:** Polyline from rider to destination
- **Markers:**
  - Blue: Rider current location
  - Orange: Store/pickup location
  - Green: Customer/delivery location
- **Real-time Updates:** Location sync every 5 seconds

### Status Indicators
- **Online/Offline:** Green power button vs gray
- **Order Status:** Color-coded badges
- **Document Status:** Verified (green), Pending (yellow), Expired (red)

### Loading States
- Spinner during API calls
- Skeleton for lists
- Pull-to-refresh animation

### Toasts/Notifications
- Success: Order accepted, delivery completed
- Error: Network issues, action failed
- Info: New order received

### Modals
- SOS emergency selection
- Order details
- Confirmation dialogs

---

## Location Tracking

### Background Location
- Updates rider position to server every 5-10 seconds when online
- Syncs location to all active orders for customer tracking

### Battery Optimization
- Reduced frequency when stationary
- Increased accuracy during active deliveries

---

## Earning Calculation

### Per Delivery
- **Base Earning:** 80% of delivery fee
- **Tips:** 100% goes to rider
- **Incentives:** Peak hour bonuses, surge pricing
- **Penalties:** Late deliveries, cancellations

### Example
```
Delivery Fee: ₹50
Base Earning: ₹40 (80%)
Tip: ₹20
Incentive: ₹10 (peak hour)
Total: ₹70
```

---

## Summary

| Page | Path | Key Features |
|------|------|--------------|
| Login | `/rider/login` | Phone OTP authentication |
| Onboarding | `/rider/onboarding` | Document upload, application |
| Dashboard | `/rider` | Online/offline, order management, map |
| Orders | `/rider/orders` | Order history, filters |
| Earnings | `/rider/earnings` | Period stats, earnings breakdown |
| Profile | `/rider/profile` | Personal info, documents, vehicle |
| Settings | `/rider/settings` | Notifications, language, logout |
