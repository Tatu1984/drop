# Database Schema Documentation

## Overview

This document describes the complete database schema for the Drop delivery platform. The application uses PostgreSQL with Prisma ORM. The schema covers:

- User management and authentication
- Vendor/Restaurant management
- Order processing (delivery, pickup, dine-in)
- Rider/Fleet management
- Restaurant Management System (RMS)
- Inventory and procurement
- Payments and wallets
- Loyalty and promotions
- Support system

---

## Table of Contents

1. [User Models](#user-models)
2. [Vendor Models](#vendor-models)
3. [Order Models](#order-models)
4. [Genie/Porter Service](#genieporter-service)
5. [Rider Models](#rider-models)
6. [Party Mode](#party-mode)
7. [Payments & Wallet](#payments--wallet)
8. [Subscription & Loyalty](#subscription--loyalty)
9. [Reviews & Ratings](#reviews--ratings)
10. [Promotions](#promotions)
11. [Support](#support)
12. [Notifications](#notifications)
13. [Search & Analytics](#search--analytics)
14. [Referrals](#referrals)
15. [Admin](#admin)
16. [System Config](#system-config)
17. [Restaurant Management System](#restaurant-management-system)
18. [Eraser Diagram Code](#eraser-diagram-code)

---

## User Models

### User
Primary table for customer/user accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key (CUID) |
| phone | String? | Unique phone number |
| email | String? | Unique email address |
| name | String? | User's display name |
| avatar | String? | Profile picture URL |
| dateOfBirth | DateTime? | For age verification |
| isKycVerified | Boolean | KYC status |
| isAgeVerified | Boolean | Age verification for alcohol |
| preferredLanguage | String | Default: "en" |
| cuisinePreferences | String[] | Preferred cuisines |
| groceryBrands | String[] | Preferred grocery brands |
| alcoholPreferences | String[] | Preferred alcohol types |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:** addresses, orders, cartItems, payments, wallet, subscription, loyaltyPoints, reviews, searchHistory, notifications, partyEvents, partyParticipations, supportTickets, referrals

### Address
Delivery addresses for users.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Foreign key to User |
| label | String | "Home", "Work", etc. |
| fullAddress | String | Complete address |
| landmark | String? | Nearby landmark |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| isDefault | Boolean | Default delivery address |

**Relations:** user, orders

---

## Vendor Models

### Vendor
Stores/restaurants on the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| name | String | Business name |
| description | String? | Business description |
| logo | String? | Logo URL |
| coverImage | String? | Cover image URL |
| type | VendorType | RESTAURANT, GROCERY, WINE_SHOP, etc. |
| isVerified | Boolean | Verification status |
| isActive | Boolean | Active on platform |
| rating | Float | Average rating (0-5) |
| totalRatings | Int | Number of ratings |
| email | String? | Unique business email |
| phone | String? | Unique business phone |
| password | String? | Hashed password |
| address | String | Business address |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| deliveryRadius | Float | Delivery range in km |
| openingTime | String | Opening time |
| closingTime | String | Closing time |
| minimumOrder | Float | Minimum order value |
| avgDeliveryTime | Int | Average delivery time (minutes) |
| commissionRate | Float | Platform commission % |
| licenseNumber | String? | Alcohol license (for wine shops) |
| licenseExpiry | DateTime? | License expiry date |

**VendorType Enum:** RESTAURANT, GROCERY, WINE_SHOP, PHARMACY, MEAT_SHOP, MILK_DAIRY, PET_SUPPLIES, FLOWERS, GENERAL_STORE

**Relations:** categories, products, orders, reviews, promotions, sponsoredListings, outlets

### Category
Product categories for vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| name | String | Category name |
| icon | String? | Icon URL |
| image | String? | Image URL |
| vendorId | String? | Foreign key to Vendor |
| parentId | String? | For nested categories |
| sortOrder | Int | Display order |

**Relations:** vendor, parent, children, products

### Product
Items sold by vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Foreign key to Vendor |
| categoryId | String? | Foreign key to Category |
| name | String | Product name |
| description | String? | Product description |
| images | String[] | Product image URLs |
| price | Float | Regular price |
| discountPrice | Float? | Sale price |
| inStock | Boolean | Availability status |
| stockQuantity | Int? | Current stock |
| isVeg | Boolean | Vegetarian flag |
| isVegan | Boolean | Vegan flag |
| calories | Int? | Calorie count |
| allergens | String[] | Allergen list |
| packSize | String? | Pack size (grocery) |
| brand | String? | Brand name (grocery) |
| dietType | String? | Keto, gluten-free, etc. |
| abvPercent | Float? | Alcohol % (wine) |
| tasteProfile | String? | Wine taste notes |
| countryOfOrigin | String? | Wine origin |
| year | Int? | Wine vintage |
| grapeType | String? | Wine grape variety |
| pairings | String[] | Food pairings (wine) |
| customizations | Json? | Customization options |
| rating | Float | Product rating |
| totalRatings | Int | Rating count |

**Relations:** vendor, category, cartItems, orderItems, reviews

---

## Order Models

### CartItem
Shopping cart items.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Foreign key to User |
| productId | String | Foreign key to Product |
| quantity | Int | Item quantity |
| customizations | Json? | Selected customizations |
| notes | String? | Special instructions |
| partyEventId | String? | For party mode orders |
| addedByUserId | String? | Who added (party mode) |

**Relations:** user, product, partyEvent

### Order
Main order table.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderNumber | String | Unique order number |
| userId | String | Foreign key to User |
| vendorId | String | Foreign key to Vendor |
| addressId | String? | Foreign key to Address |
| riderId | String? | Foreign key to Rider |
| status | OrderStatus | Current order status |
| type | OrderType | DELIVERY, PICKUP, DINE_IN |
| subtotal | Float | Items total |
| deliveryFee | Float | Delivery charges |
| platformFee | Float | Platform charges |
| discount | Float | Discount applied |
| tip | Float | Rider tip |
| total | Float | Final amount |
| scheduledFor | DateTime? | Scheduled delivery time |
| estimatedDelivery | DateTime? | ETA |
| deliveredAt | DateTime? | Actual delivery time |
| deliveryInstructions | String? | Delivery notes |
| paymentMethod | String | Payment method used |
| paymentStatus | PaymentStatus | Payment state |
| partyEventId | String? | For party orders |
| currentLat | Float? | Live tracking latitude |
| currentLng | Float? | Live tracking longitude |

**OrderStatus Enum:** PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED

**OrderType Enum:** DELIVERY, PICKUP, DINE_IN

**PaymentStatus Enum:** PENDING, COMPLETED, FAILED, REFUNDED

**Relations:** user, vendor, address, rider, partyEvent, items, statusHistory, supportTickets

### OrderItem
Line items in an order.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderId | String | Foreign key to Order |
| productId | String | Foreign key to Product |
| quantity | Int | Item quantity |
| price | Float | Price at time of order |
| customizations | Json? | Selected customizations |
| notes | String? | Special instructions |

### OrderStatusHistory
Order status change log.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderId | String | Foreign key to Order |
| status | OrderStatus | New status |
| note | String? | Status change note |
| createdAt | DateTime | Timestamp |

---

## Genie/Porter Service

### GenieOrder
On-demand pickup and delivery service.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderNumber | String | Unique order number |
| userId | String | Customer ID |
| riderId | String? | Assigned rider |
| type | GenieOrderType | Service type |
| status | OrderStatus | Current status |
| estimatedPrice | Float | Quoted price |
| finalPrice | Float? | Actual price |
| distance | Float | Total distance (km) |
| weight | Float? | Package weight (kg) |
| paymentMethod | String | Payment method |
| paymentStatus | PaymentStatus | Payment state |

**GenieOrderType Enum:** PICKUP_DROP, MULTI_STOP, RETURN_DELIVERY, BULK_DELIVERY

### GenieStop
Pickup/drop points for Genie orders.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| genieOrderId | String | Foreign key to GenieOrder |
| stopNumber | Int | Order of stops |
| address | String | Stop address |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| contactName | String? | Contact person |
| contactPhone | String? | Contact number |
| instructions | String? | Stop instructions |
| type | StopType | PICKUP, DROP, WAIT_AND_RETURN |
| completedAt | DateTime? | Completion timestamp |

---

## Rider Models

### Rider
Delivery partners.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| phone | String | Unique phone |
| email | String? | Email address |
| name | String | Full name |
| avatar | String? | Profile picture |
| documentVerified | Boolean | Documents verified |
| policeVerified | Boolean | Background check done |
| alcoholAuthorized | Boolean | Can deliver alcohol |
| vehicleType | VehicleType | Type of vehicle |
| vehicleNumber | String? | Registration number |
| isOnline | Boolean | Currently online |
| isAvailable | Boolean | Available for orders |
| currentLat | Float? | Current latitude |
| currentLng | Float? | Current longitude |
| rating | Float | Average rating |
| totalDeliveries | Int | Lifetime deliveries |
| totalEarnings | Float | Lifetime earnings |
| assignedZone | String? | Operating zone |

**VehicleType Enum:** BICYCLE, SCOOTER, BIKE, EV_BIKE, EV_SCOOTER, CAR, DRONE

**Relations:** orders, genieOrders, earnings, shifts

### RiderEarning
Daily earnings breakdown.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| riderId | String | Foreign key to Rider |
| date | DateTime | Earning date |
| baseEarning | Float | Base pay |
| tip | Float | Customer tips |
| incentive | Float | Bonus incentives |
| penalty | Float | Deductions |
| total | Float | Net earnings |

### RiderShift
Rider work shifts.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| riderId | String | Foreign key to Rider |
| startTime | DateTime | Shift start |
| endTime | DateTime? | Shift end |
| zone | String? | Operating zone |

---

## Party Mode

### PartyEvent
Group ordering events.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| hostUserId | String | Host user ID |
| name | String | Event name |
| scheduledFor | DateTime | Event date/time |
| status | PartyStatus | Event status |
| splitType | SplitType | Bill split method |

**PartyStatus Enum:** PLANNING, ORDERING, ORDERED, DELIVERED, COMPLETED

**SplitType Enum:** EQUAL, BY_ITEM, CUSTOM

### PartyParticipant
Party event participants.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| partyEventId | String | Foreign key to PartyEvent |
| userId | String | Participant user ID |
| shareAmount | Float? | Their share of bill |
| hasPaid | Boolean | Payment status |

---

## Payments & Wallet

### PaymentMethod
Saved payment methods.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Foreign key to User |
| type | PaymentType | Payment method type |
| details | Json | Encrypted payment details |
| isDefault | Boolean | Default payment method |

**PaymentType Enum:** CARD, UPI, WALLET, NET_BANKING, COD

### Wallet
User wallet balance.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Unique, Foreign key to User |
| balance | Float | Current balance |

### WalletTransaction
Wallet transaction history.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| walletId | String | Foreign key to Wallet |
| amount | Float | Transaction amount |
| type | TransactionType | Transaction type |
| description | String? | Description |
| orderId | String? | Related order |
| createdAt | DateTime | Timestamp |

**TransactionType Enum:** CREDIT, DEBIT, CASHBACK, REFUND, TOP_UP

---

## Subscription & Loyalty

### Subscription
Premium subscription plans.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Unique, Foreign key to User |
| plan | SubscriptionPlan | Plan type |
| startDate | DateTime | Start date |
| endDate | DateTime | Expiry date |
| isActive | Boolean | Active status |

**SubscriptionPlan Enum:** MONTHLY, QUARTERLY, YEARLY

### LoyaltyPoints
User loyalty program.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Unique, Foreign key to User |
| points | Int | Current points |
| lifetimePoints | Int | Total earned ever |
| tier | LoyaltyTier | Current tier |

**LoyaltyTier Enum:** BRONZE, SILVER, GOLD, PLATINUM

### PointsHistory
Loyalty points transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| loyaltyPointsId | String | Foreign key |
| points | Int | Points changed |
| type | PointsType | Transaction type |
| description | String? | Description |
| createdAt | DateTime | Timestamp |

**PointsType Enum:** EARNED, REDEEMED, EXPIRED, BONUS

---

## Reviews & Ratings

### Review
User reviews for vendors/products.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Reviewer |
| vendorId | String? | Reviewed vendor |
| productId | String? | Reviewed product |
| rating | Int | Rating (1-5) |
| comment | String? | Review text |
| images | String[] | Review images |
| createdAt | DateTime | Timestamp |

---

## Promotions

### Promotion
Discount codes and offers.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String? | Vendor-specific promo |
| code | String | Unique promo code |
| description | String | Promo description |
| discountType | DiscountType | Type of discount |
| discountValue | Float | Discount amount/% |
| minOrderValue | Float | Minimum order |
| maxDiscount | Float? | Cap on discount |
| usageLimit | Int? | Max uses allowed |
| usedCount | Int | Times used |
| startDate | DateTime | Valid from |
| endDate | DateTime | Valid until |
| isActive | Boolean | Active status |

**DiscountType Enum:** PERCENTAGE, FLAT, FREE_DELIVERY

### SponsoredListing
Vendor advertising.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Advertiser |
| startDate | DateTime | Campaign start |
| endDate | DateTime | Campaign end |
| budget | Float | Total budget |
| spent | Float | Amount spent |
| isActive | Boolean | Active status |

---

## Support

### SupportTicket
Customer support tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Customer |
| orderId | String? | Related order |
| type | TicketType | Issue type |
| subject | String | Ticket subject |
| description | String | Issue details |
| status | TicketStatus | Current status |

**TicketType Enum:** REFUND, MISSING_ITEM, WRONG_ITEM, QUALITY_ISSUE, DELIVERY_ISSUE, OTHER

**TicketStatus Enum:** OPEN, IN_PROGRESS, RESOLVED, CLOSED

### TicketMessage
Support conversation messages.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| ticketId | String | Foreign key |
| message | String | Message content |
| isFromUser | Boolean | User or support agent |
| createdAt | DateTime | Timestamp |

---

## Notifications

### Notification
Push notifications and alerts.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | Recipient |
| title | String | Notification title |
| body | String | Notification content |
| type | NotificationType | Notification type |
| data | Json? | Additional data |
| isRead | Boolean | Read status |
| createdAt | DateTime | Timestamp |

**NotificationType Enum:** ORDER_UPDATE, PROMOTION, SYSTEM, REMINDER

---

## Search & Analytics

### SearchHistory
User search queries.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | User who searched |
| query | String | Search query |
| createdAt | DateTime | Timestamp |

---

## Referrals

### Referral
User referral program.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| referrerId | String | Who referred |
| referredId | String | Unique, who was referred |
| referralCode | String | Code used |
| rewardGiven | Boolean | Reward distributed |
| createdAt | DateTime | Timestamp |

---

## Admin

### Admin
Platform administrators.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| email | String | Unique email |
| password | String | Hashed password |
| name | String | Admin name |
| role | AdminRole | Permission level |
| isActive | Boolean | Active status |
| createdAt | DateTime | Timestamp |

**AdminRole Enum:** SUPER_ADMIN, ADMIN, OPERATIONS, FINANCE, MARKETING, SUPPORT

### AuditLog
Admin action logs.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| adminId | String | Who performed action |
| action | String | Action performed |
| entity | String | Affected entity |
| entityId | String? | Affected entity ID |
| details | Json? | Action details |
| createdAt | DateTime | Timestamp |

---

## System Config

### SystemConfig
Platform-wide settings.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| key | String | Unique config key |
| value | Json | Config value |
| updatedAt | DateTime | Last updated |

### Zone
Delivery zones.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| name | String | Zone name |
| polygon | Json | GeoJSON polygon |
| isActive | Boolean | Active status |
| surgePricing | Float | Surge multiplier |
| deliveryFee | Float | Zone delivery fee |

---

## Restaurant Management System

The RMS module provides comprehensive restaurant operations management including table management, reservations, kitchen display, inventory, staff management, and more.

### Outlet & Venue

#### Outlet
Individual restaurant outlets/locations.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Parent vendor |
| name | String | Outlet name |
| code | String | Unique code (e.g., "BLR-001") |
| address | String | Physical address |
| latitude/longitude | Float | GPS coordinates |
| phone | String? | Contact number |
| email | String? | Contact email |
| timezone | String | Timezone (default: Asia/Kolkata) |
| currency | String | Currency (default: INR) |
| openingTime/closingTime | String | Operating hours |
| isOpen | Boolean | Currently open |
| taxRate | Float | Tax percentage |
| serviceChargeRate | Float | Service charge % |
| settings | Json? | Outlet-specific settings |

**Relations:** vendor, tables, floors, reservations, dineInOrders, posTerminals, kdsStations, shifts, inventoryItems, employees, menuAssignments, printers

### Floor & Table Management

#### Floor
Restaurant floor levels.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Parent outlet |
| name | String | "Ground Floor", "Rooftop", etc. |
| sortOrder | Int | Display order |
| isActive | Boolean | Active status |

#### TableZone
Table groupings (Window, Patio, VIP).

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| floorId | String | Parent floor |
| name | String | Zone name |
| color | String | Display color |

#### Table
Individual tables.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Parent outlet |
| floorId | String? | Floor location |
| zoneId | String? | Zone grouping |
| tableNumber | String | Table identifier |
| capacity | Int | Max seats |
| minCapacity | Int | Min seats |
| shape | TableShape | Table shape |
| positionX/Y | Float | Floor map position |
| width/height | Float | Visual dimensions |
| rotation | Float | Visual rotation |
| status | TableStatus | Current status |
| currentOrderId | String? | Active order |
| isActive | Boolean | Active status |

**TableShape Enum:** RECTANGLE, SQUARE, CIRCLE, OVAL

**TableStatus Enum:** AVAILABLE, OCCUPIED, RESERVED, CLEANING, BLOCKED

#### TableSession
Table occupancy sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| tableId | String | Table |
| startTime | DateTime | Session start |
| endTime | DateTime? | Session end |
| guestCount | Int | Number of guests |
| serverEmployeeId | String? | Assigned server |

### Reservations & Waitlist

#### Reservation
Table reservations.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| tableId | String? | Assigned table |
| customerId | String? | Guest profile |
| guestName | String | Guest name |
| guestPhone | String | Contact phone |
| guestEmail | String? | Contact email |
| guestCount | Int | Party size |
| date | DateTime | Reservation date |
| timeSlot | String | Time (e.g., "19:00") |
| duration | Int | Duration in minutes |
| status | ReservationStatus | Current status |
| specialRequests | String? | Special notes |
| occasion | String? | Birthday, Anniversary, etc. |
| depositAmount | Float? | Deposit required |
| depositPaid | Boolean | Deposit received |
| minimumSpend | Float? | Min spend required |
| confirmationCode | String | Unique confirmation |
| source | ReservationSource | Booking source |
| externalRef | String? | External reference |

**ReservationStatus Enum:** PENDING, CONFIRMED, SEATED, COMPLETED, NO_SHOW, CANCELLED

**ReservationSource Enum:** PHONE, WALK_IN, WEBSITE, APP, OPEN_TABLE, THIRD_PARTY

#### Waitlist
Walk-in queue management.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| guestName | String | Guest name |
| guestPhone | String | Contact |
| guestCount | Int | Party size |
| estimatedWait | Int | Expected wait (minutes) |
| quotedWait | Int? | Quoted wait time |
| status | WaitlistStatus | Queue status |
| notes | String? | Notes |
| notifiedAt | DateTime? | When notified |
| seatedAt | DateTime? | When seated |
| tableId | String? | Assigned table |

**WaitlistStatus Enum:** WAITING, NOTIFIED, SEATED, LEFT, CANCELLED

### Dine-In Orders & POS

#### DineInOrder
Restaurant orders.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderNumber | String | Unique order number |
| outletId | String | Outlet |
| tableId | String | Table |
| tableSessionId | String? | Table session |
| serverEmployeeId | String? | Server |
| createdByEmployeeId | String | Created by |
| guestCount | Int | Party size |
| guestProfileId | String? | Guest profile |
| orderType | DineInOrderType | Order type |
| status | DineInOrderStatus | Order status |
| subtotal | Float | Items total |
| taxAmount | Float | Tax |
| serviceCharge | Float | Service charge |
| discount | Float | Discounts |
| tip | Float | Tip |
| total | Float | Final total |
| paymentStatus | PaymentStatus | Payment state |
| notes | String? | Order notes |

**DineInOrderType Enum:** DINE_IN, TAKEAWAY, BAR_TAB, ROOM_SERVICE

**DineInOrderStatus Enum:** OPEN, PRINTED, PARTIALLY_PAID, PAID, CLOSED, VOID

#### DineInOrderItem
Order line items.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderId | String | Parent order |
| menuItemId | String | Menu item |
| name | String | Item name |
| quantity | Int | Quantity |
| unitPrice | Float | Unit price |
| totalPrice | Float | Line total |
| seatNumber | Int? | For split billing |
| courseNumber | Int | Course number |
| courseType | CourseType | Course type |
| status | OrderItemStatus | Item status |
| modifiers | Json? | Selected modifiers |
| specialInstructions | String? | Special requests |
| isVoid | Boolean | Voided flag |
| voidReason | String? | Void reason |
| isComp | Boolean | Complimentary flag |
| compReason | String? | Comp reason |

**CourseType Enum:** APPETIZER, SOUP, SALAD, MAIN, DESSERT, BEVERAGE, BAR

**OrderItemStatus Enum:** PENDING, SENT, ACKNOWLEDGED, PREPARING, READY, SERVED, VOID

### Split Billing

#### SplitBill
Bill splitting for groups.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderId | String | Parent order |
| splitNumber | Int | Split number |
| splitType | SplitBillType | Split method |
| subtotal/taxAmount/serviceCharge/tip/total | Float | Amounts |
| isPaid | Boolean | Payment status |
| paidAt | DateTime? | Payment time |

**SplitBillType Enum:** EQUAL, BY_SEAT, BY_ITEM, CUSTOM

#### SplitBillItem
Items in a split bill.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| splitBillId | String | Parent split |
| orderItemId | String | Order item |
| quantity | Int | Quantity in this split |
| amount | Float | Amount |

### Payments

#### DineInPayment
Restaurant payment transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| orderId | String | Order |
| splitBillId | String? | Split bill |
| method | DineInPaymentMethod | Payment method |
| amount | Float | Amount |
| tipAmount | Float | Tip |
| cardLastFour | String? | Card last 4 |
| cardType | String? | Card brand |
| transactionId | String? | Transaction ID |
| authCode | String? | Authorization code |
| status | PaymentStatus | Payment status |
| processedByEmployeeId | String | Staff who processed |

**DineInPaymentMethod Enum:** CASH, CARD, UPI, WALLET, GIFT_CARD, CREDIT, COMPLIMENTARY

### POS & Shifts

#### POSTerminal
Point of sale terminals.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| name | String | Terminal name |
| deviceId | String | Unique device ID |
| isActive | Boolean | Active status |
| lastActiveAt | DateTime? | Last activity |

#### Shift
Staff cash shifts.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| terminalId | String? | POS terminal |
| employeeId | String | Staff member |
| startTime | DateTime | Shift start |
| endTime | DateTime? | Shift end |
| openingFloat | Float | Starting cash |
| closingFloat | Float? | Ending cash |
| expectedCash | Float? | Expected cash |
| actualCash | Float? | Counted cash |
| variance | Float? | Cash variance |
| totalSales | Float | Shift sales |
| totalTax | Float | Tax collected |
| totalDiscount | Float | Discounts given |
| totalTips | Float | Tips collected |
| cashSales | Float | Cash payments |
| cardSales | Float | Card payments |
| otherSales | Float | Other payments |
| status | ShiftStatus | Shift status |
| notes | String? | Notes |

**ShiftStatus Enum:** OPEN, CLOSED, RECONCILED

#### CashDrop
Safe drops during shift.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| shiftId | String | Shift |
| amount | Float | Drop amount |
| reason | String? | Reason |
| droppedAt | DateTime | Timestamp |

### Kitchen Display System (KDS)

#### KDSStation
Kitchen display stations.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| name | String | "Grill", "Fry", "Bar", etc. |
| stationType | StationType | Station type |
| displayOrder | Int | Display order |
| defaultPrepTime | Int | Default prep time (min) |
| alertThreshold | Int | Alert if exceeded (min) |
| isActive | Boolean | Active status |

**StationType Enum:** HOT, COLD, GRILL, FRY, SALAD, DESSERT, BAR, EXPO, PACKAGING

#### KDSRoutingRule
Automatic ticket routing.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| stationId | String | Target station |
| categoryId | String? | Route by category |
| menuItemId | String? | Route specific item |

#### KDSTicket
Kitchen tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| stationId | String | Station |
| orderNumber | String | Order number |
| tableNumber | String? | Table |
| orderType | String | Order type |
| createdAt | DateTime | Created |
| acknowledgedAt | DateTime? | Acknowledged |
| startedAt | DateTime? | Started cooking |
| completedAt | DateTime? | Completed |
| status | KDSTicketStatus | Ticket status |
| priority | Int | Priority level |
| isRush | Boolean | Rush order flag |

**KDSTicketStatus Enum:** NEW, ACKNOWLEDGED, IN_PROGRESS, READY, SERVED, RECALLED

#### KDSTicketItem
Items on a KDS ticket.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| ticketId | String | Parent ticket |
| orderItemId | String? | Order item ref |
| name | String | Item name |
| quantity | Int | Quantity |
| modifiers | String? | Modifiers |
| specialInstructions | String? | Instructions |
| status | KDSItemStatus | Item status |
| completedAt | DateTime? | Completion time |

**KDSItemStatus Enum:** PENDING, COOKING, DONE, SERVED

### Menu Management

#### MenuSet
Menu groupings (Lunch, Dinner, Happy Hour).

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Vendor |
| name | String | Menu name |
| description | String? | Description |
| isActive | Boolean | Active status |
| startTime | String? | Available from |
| endTime | String? | Available until |
| daysOfWeek | Int[] | Days available (0-6) |
| validFrom | DateTime? | Valid from date |
| validTo | DateTime? | Valid to date |

#### MenuCategory
Menu categories.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| menuSetId | String | Parent menu |
| parentId | String? | Parent category |
| name | String | Category name |
| description | String? | Description |
| image | String? | Category image |
| sortOrder | Int | Display order |
| isActive | Boolean | Active status |

#### MenuItem
Menu items.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| categoryId | String | Category |
| sku | String? | SKU |
| name | String | Item name |
| description | String? | Description |
| shortName | String? | Short name for KDS |
| image | String? | Item image |
| price | Float | Price |
| cost | Float? | Cost (for margins) |
| recipeId | String? | Linked recipe |
| isVeg | Boolean | Vegetarian |
| isVegan | Boolean | Vegan |
| isGlutenFree | Boolean | Gluten-free |
| spiceLevel | Int? | Spice level (0-5) |
| calories | Int? | Calories |
| prepTime | Int? | Prep time (min) |
| allergens | String[] | Allergens |
| tags | String[] | Tags (Popular, New, etc.) |
| isActive | Boolean | Active |
| isAvailable | Boolean | Currently available |
| sortOrder | Int | Display order |

#### ModifierGroup
Customization groups (Size, Toppings).

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Vendor |
| name | String | Group name |
| minSelections | Int | Minimum selections |
| maxSelections | Int | Maximum selections |
| isRequired | Boolean | Required selection |

#### Modifier
Individual modifiers/options.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| groupId | String | Parent group |
| name | String | Option name |
| price | Float | Additional price |
| isDefault | Boolean | Default selection |
| isActive | Boolean | Active |
| sortOrder | Int | Display order |

### Recipe Management

#### Recipe
Item recipes for cost tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Vendor |
| name | String | Recipe name |
| description | String? | Description |
| yieldQuantity | Float | Yield amount |
| yieldUnit | String | Yield unit |
| prepTime | Int? | Prep time (min) |
| cookTime | Int? | Cook time (min) |
| instructions | Json? | Step-by-step |
| calories | Int? | Per serving |
| protein/carbs/fat | Float? | Nutrition |
| totalCost | Float? | Total cost |
| costPerServing | Float? | Cost per serving |

#### RecipeIngredient
Recipe components.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| recipeId | String | Recipe |
| inventoryItemId | String | Inventory item |
| quantity | Float | Quantity needed |
| unit | String | Unit of measure |
| wastagePercent | Float | Wastage % |

### Inventory Management

#### InventoryItem
Stock items.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Vendor |
| outletId | String? | Outlet (null = central) |
| sku | String | SKU |
| name | String | Item name |
| description | String? | Description |
| barcode | String? | Barcode |
| categoryId | String? | Category |
| unitOfMeasure | String | Base unit |
| conversionFactor | Float | For conversions |
| currentStock | Float | Current quantity |
| parLevel | Float? | Ideal stock |
| reorderPoint | Float? | Reorder trigger |
| reorderQuantity | Float? | Reorder amount |
| safetyStock | Float? | Safety buffer |
| averageCost | Float | Average cost |
| lastCost | Float? | Last purchase cost |
| storageLocation | String? | Storage location |
| storageTemp | String? | Storage requirements |
| trackBatch | Boolean | Track batches |
| trackExpiry | Boolean | Track expiry |
| isActive | Boolean | Active |

#### StockMovement
Inventory transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| inventoryItemId | String | Item |
| type | StockMovementType | Movement type |
| quantity | Float | Quantity (+/-) |
| referenceType | String? | Reference type |
| referenceId | String? | Reference ID |
| unitCost | Float? | Unit cost |
| totalCost | Float? | Total cost |
| performedByEmployeeId | String? | Staff |
| notes | String? | Notes |

**StockMovementType Enum:** PURCHASE, SALE, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT, WASTE, RETURN, COUNT_ADJUSTMENT

### Procurement

#### Supplier
Vendors/suppliers.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Restaurant vendor |
| name | String | Supplier name |
| code | String | Unique code |
| contactName | String? | Contact person |
| email | String? | Email |
| phone | String? | Phone |
| address | String? | Address |
| paymentTerms | Int? | Payment terms (days) |
| leadTime | Int? | Lead time (days) |
| minimumOrder | Float? | Min order value |
| rating | Float | Supplier rating |
| isActive | Boolean | Active |

#### PurchaseOrder
Stock purchase orders.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| poNumber | String | Unique PO number |
| vendorId | String | Restaurant |
| outletId | String | Delivery outlet |
| supplierId | String | Supplier |
| status | POStatus | PO status |
| orderDate | DateTime | Order date |
| expectedDate | DateTime? | Expected delivery |
| receivedDate | DateTime? | Actual delivery |
| subtotal | Float | Subtotal |
| taxAmount | Float | Tax |
| total | Float | Total |
| approvedByEmployeeId | String? | Approver |
| approvedAt | DateTime? | Approval time |
| notes | String? | Notes |

**POStatus Enum:** DRAFT, PENDING_APPROVAL, APPROVED, SENT, PARTIALLY_RECEIVED, RECEIVED, CANCELLED

### Staff Management

#### Employee
Restaurant staff.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Restaurant |
| outletId | String? | Primary outlet |
| employeeCode | String | Employee code |
| firstName | String | First name |
| lastName | String | Last name |
| email | String? | Email |
| phone | String | Phone |
| avatar | String? | Photo |
| role | EmployeeRole | Role |
| department | String? | Department |
| hireDate | DateTime | Hire date |
| terminationDate | DateTime? | End date |
| pin | String? | POS PIN |
| passwordHash | String? | Password hash |
| permissions | String[] | Permission list |
| hourlyRate | Float? | Hourly pay |
| salary | Float? | Monthly salary |
| isActive | Boolean | Active |

**EmployeeRole Enum:** OWNER, MANAGER, SUPERVISOR, HOST, SERVER, BARTENDER, CHEF, LINE_COOK, CASHIER, BUSSER, RUNNER, DISHWASHER

### CRM & Guest Profiles

#### GuestProfile
Customer profiles for CRM.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Restaurant |
| firstName | String | First name |
| lastName | String? | Last name |
| email | String? | Email |
| phone | String? | Phone |
| dietaryRestrictions | String[] | Dietary needs |
| allergies | String[] | Allergies |
| preferences | String? | Preference notes |
| birthday | DateTime? | Birthday |
| anniversary | DateTime? | Anniversary |
| totalVisits | Int | Visit count |
| totalSpend | Float | Lifetime spend |
| averageSpend | Float | Average spend |
| lastVisit | DateTime? | Last visit |
| loyaltyTier | String? | Loyalty tier |
| loyaltyPoints | Int | Points balance |
| tags | String[] | Customer tags |
| vipStatus | Boolean | VIP flag |
| notes | String? | Notes |
| marketingConsent | Boolean | Marketing opt-in |

### Loyalty & Gift Cards

#### LoyaltyProgram
Restaurant loyalty programs.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Restaurant |
| name | String | Program name |
| pointsPerCurrency | Float | Points per INR |
| isActive | Boolean | Active |

#### GiftCard
Gift cards.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| vendorId | String | Restaurant |
| cardNumber | String | Unique card number |
| pin | String? | Card PIN |
| initialValue | Float | Original value |
| currentBalance | Float | Current balance |
| purchasedAt | DateTime | Purchase date |
| expiresAt | DateTime? | Expiry date |
| purchaserName | String? | Buyer name |
| purchaserEmail | String? | Buyer email |
| recipientName | String? | Recipient name |
| recipientEmail | String? | Recipient email |
| message | String? | Gift message |
| isActive | Boolean | Active |

### Reports & Analytics

#### DailySalesReport
Daily sales summaries.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| date | DateTime | Report date |
| totalSales | Float | Total sales |
| totalOrders | Int | Order count |
| totalCovers | Int | Guest count |
| averageCheck | Float | Avg check size |
| cashSales | Float | Cash payments |
| cardSales | Float | Card payments |
| otherSales | Float | Other payments |
| foodSales | Float | Food revenue |
| beverageSales | Float | Beverage revenue |
| alcoholSales | Float | Alcohol revenue |
| taxCollected | Float | Tax collected |
| discountsGiven | Float | Discounts |
| tipsCollected | Float | Tips |
| laborCost | Float | Labor cost |
| foodCost | Float | Food cost |

### IoT & Sensors

#### IoTSensor
Connected sensors.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| outletId | String | Outlet |
| name | String | Sensor name |
| type | SensorType | Sensor type |
| location | String? | Physical location |
| minThreshold | Float? | Min alert |
| maxThreshold | Float? | Max alert |
| isActive | Boolean | Active |

**SensorType Enum:** TEMPERATURE, HUMIDITY, DOOR, EQUIPMENT

#### SensorReading
Sensor data readings.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| sensorId | String | Sensor |
| value | Float | Reading value |
| isAlert | Boolean | Alert triggered |
| timestamp | DateTime | Reading time |

---

## Eraser Diagram Code

Use this code at [eraser.io](https://eraser.io) to visualize the database schema:

```eraser
// User Domain
User [icon: user, color: blue] {
  id string pk
  phone string unique
  email string unique
  name string
  isKycVerified boolean
  isAgeVerified boolean
}

Address [icon: map-pin, color: blue] {
  id string pk
  userId string fk
  label string
  fullAddress string
  latitude float
  longitude float
  isDefault boolean
}

User.id <> Address.userId

// Vendor Domain
Vendor [icon: store, color: green] {
  id string pk
  name string
  type VendorType
  email string unique
  phone string unique
  rating float
  commissionRate float
  isVerified boolean
}

Category [icon: folder, color: green] {
  id string pk
  vendorId string fk
  parentId string fk
  name string
}

Product [icon: package, color: green] {
  id string pk
  vendorId string fk
  categoryId string fk
  name string
  price float
  discountPrice float
  inStock boolean
}

Vendor.id <> Category.vendorId
Vendor.id <> Product.vendorId
Category.id <> Product.categoryId

// Order Domain
Order [icon: shopping-cart, color: orange] {
  id string pk
  orderNumber string unique
  userId string fk
  vendorId string fk
  riderId string fk
  addressId string fk
  status OrderStatus
  type OrderType
  total float
  paymentStatus PaymentStatus
}

OrderItem [icon: list, color: orange] {
  id string pk
  orderId string fk
  productId string fk
  quantity int
  price float
}

CartItem [icon: shopping-bag, color: orange] {
  id string pk
  userId string fk
  productId string fk
  quantity int
}

User.id <> Order.userId
Vendor.id <> Order.vendorId
Order.id <> OrderItem.orderId
Product.id <> OrderItem.productId
User.id <> CartItem.userId
Product.id <> CartItem.productId

// Rider Domain
Rider [icon: bike, color: purple] {
  id string pk
  phone string unique
  name string
  vehicleType VehicleType
  isOnline boolean
  rating float
  totalDeliveries int
}

RiderEarning [icon: dollar-sign, color: purple] {
  id string pk
  riderId string fk
  date datetime
  baseEarning float
  tip float
  total float
}

Order.riderId > Rider.id
Rider.id <> RiderEarning.riderId

// Genie Service
GenieOrder [icon: truck, color: cyan] {
  id string pk
  userId string fk
  riderId string fk
  type GenieOrderType
  status OrderStatus
  estimatedPrice float
}

GenieStop [icon: flag, color: cyan] {
  id string pk
  genieOrderId string fk
  stopNumber int
  type StopType
  address string
}

User.id <> GenieOrder.userId
Rider.id <> GenieOrder.riderId
GenieOrder.id <> GenieStop.genieOrderId

// Payment Domain
Wallet [icon: wallet, color: yellow] {
  id string pk
  userId string fk
  balance float
}

WalletTransaction [icon: credit-card, color: yellow] {
  id string pk
  walletId string fk
  amount float
  type TransactionType
}

PaymentMethod [icon: credit-card, color: yellow] {
  id string pk
  userId string fk
  type PaymentType
  isDefault boolean
}

User.id - Wallet.userId
Wallet.id <> WalletTransaction.walletId
User.id <> PaymentMethod.userId

// Loyalty & Subscription
LoyaltyPoints [icon: award, color: gold] {
  id string pk
  userId string fk
  points int
  tier LoyaltyTier
}

Subscription [icon: star, color: gold] {
  id string pk
  userId string fk
  plan SubscriptionPlan
  isActive boolean
}

User.id - LoyaltyPoints.userId
User.id - Subscription.userId

// Party Mode
PartyEvent [icon: users, color: pink] {
  id string pk
  hostUserId string fk
  name string
  scheduledFor datetime
  splitType SplitType
}

PartyParticipant [icon: user-plus, color: pink] {
  id string pk
  partyEventId string fk
  userId string fk
  shareAmount float
  hasPaid boolean
}

User.id <> PartyEvent.hostUserId
PartyEvent.id <> PartyParticipant.partyEventId
User.id <> PartyParticipant.userId

// Reviews & Promotions
Review [icon: star, color: amber] {
  id string pk
  userId string fk
  vendorId string fk
  productId string fk
  rating int
  comment string
}

Promotion [icon: tag, color: red] {
  id string pk
  vendorId string fk
  code string unique
  discountType DiscountType
  discountValue float
}

User.id <> Review.userId
Vendor.id <> Review.vendorId
Product.id <> Review.productId
Vendor.id <> Promotion.vendorId

// Support
SupportTicket [icon: help-circle, color: gray] {
  id string pk
  userId string fk
  orderId string fk
  type TicketType
  status TicketStatus
}

TicketMessage [icon: message-square, color: gray] {
  id string pk
  ticketId string fk
  message string
  isFromUser boolean
}

User.id <> SupportTicket.userId
Order.id <> SupportTicket.orderId
SupportTicket.id <> TicketMessage.ticketId

// Admin
Admin [icon: shield, color: red] {
  id string pk
  email string unique
  name string
  role AdminRole
}

AuditLog [icon: file-text, color: red] {
  id string pk
  adminId string fk
  action string
  entity string
}

Admin.id <> AuditLog.adminId

// System Config
Zone [icon: map, color: teal] {
  id string pk
  name string
  polygon json
  surgePricing float
  deliveryFee float
}

SystemConfig [icon: settings, color: teal] {
  id string pk
  key string unique
  value json
}

// RMS - Outlet
Outlet [icon: building, color: indigo] {
  id string pk
  vendorId string fk
  name string
  code string unique
  address string
  isOpen boolean
}

Vendor.id <> Outlet.id

// RMS - Tables
Floor [icon: layers, color: indigo] {
  id string pk
  outletId string fk
  name string
}

Table [icon: grid, color: indigo] {
  id string pk
  outletId string fk
  floorId string fk
  tableNumber string
  capacity int
  status TableStatus
}

Outlet.id <> Floor.outletId
Floor.id <> Table.floorId
Outlet.id <> Table.outletId

// RMS - Reservations
Reservation [icon: calendar, color: indigo] {
  id string pk
  outletId string fk
  tableId string fk
  guestName string
  guestCount int
  date datetime
  status ReservationStatus
}

Outlet.id <> Reservation.outletId
Table.id <> Reservation.tableId

// RMS - Dine-In Orders
DineInOrder [icon: utensils, color: indigo] {
  id string pk
  outletId string fk
  tableId string fk
  status DineInOrderStatus
  total float
}

DineInOrderItem [icon: list, color: indigo] {
  id string pk
  orderId string fk
  menuItemId string fk
  quantity int
  totalPrice float
}

Outlet.id <> DineInOrder.outletId
Table.id <> DineInOrder.tableId
DineInOrder.id <> DineInOrderItem.orderId

// RMS - Menu
MenuSet [icon: book, color: violet] {
  id string pk
  vendorId string fk
  name string
  isActive boolean
}

MenuCategory [icon: folder, color: violet] {
  id string pk
  menuSetId string fk
  name string
}

MenuItem [icon: coffee, color: violet] {
  id string pk
  categoryId string fk
  name string
  price float
}

MenuSet.id <> MenuCategory.menuSetId
MenuCategory.id <> MenuItem.categoryId
MenuItem.id <> DineInOrderItem.menuItemId

// RMS - KDS
KDSStation [icon: monitor, color: brown] {
  id string pk
  outletId string fk
  name string
  stationType StationType
}

KDSTicket [icon: clipboard, color: brown] {
  id string pk
  stationId string fk
  orderNumber string
  status KDSTicketStatus
}

Outlet.id <> KDSStation.outletId
KDSStation.id <> KDSTicket.stationId

// RMS - Inventory
InventoryItem [icon: box, color: emerald] {
  id string pk
  vendorId string fk
  outletId string fk
  sku string
  name string
  currentStock float
}

Supplier [icon: truck, color: emerald] {
  id string pk
  vendorId string fk
  name string
  code string
}

PurchaseOrder [icon: file-plus, color: emerald] {
  id string pk
  outletId string fk
  supplierId string fk
  status POStatus
  total float
}

Outlet.id <> InventoryItem.outletId
Supplier.id <> PurchaseOrder.supplierId
Outlet.id <> PurchaseOrder.outletId

// RMS - Staff
Employee [icon: user, color: rose] {
  id string pk
  vendorId string fk
  outletId string fk
  employeeCode string
  firstName string
  lastName string
  role EmployeeRole
}

Shift [icon: clock, color: rose] {
  id string pk
  outletId string fk
  employeeId string fk
  startTime datetime
  endTime datetime
  status ShiftStatus
}

Outlet.id <> Employee.outletId
Employee.id <> Shift.employeeId
Outlet.id <> Shift.outletId

// RMS - CRM
GuestProfile [icon: user-check, color: fuchsia] {
  id string pk
  vendorId string fk
  firstName string
  phone string
  totalVisits int
  totalSpend float
  vipStatus boolean
}

GiftCard [icon: gift, color: fuchsia] {
  id string pk
  vendorId string fk
  cardNumber string unique
  currentBalance float
}
```

---

## Summary Statistics

| Category | Table Count |
|----------|-------------|
| User Models | 2 |
| Vendor Models | 3 |
| Order Models | 4 |
| Genie Service | 2 |
| Rider Models | 3 |
| Party Mode | 2 |
| Payments & Wallet | 3 |
| Subscription & Loyalty | 3 |
| Reviews | 1 |
| Promotions | 2 |
| Support | 2 |
| Notifications | 1 |
| Search | 1 |
| Referrals | 1 |
| Admin | 2 |
| System Config | 2 |
| RMS - Outlet | 1 |
| RMS - Floor & Tables | 4 |
| RMS - Reservations | 2 |
| RMS - Dine-In Orders | 6 |
| RMS - POS & Shifts | 3 |
| RMS - KDS | 4 |
| RMS - Menu | 6 |
| RMS - Recipe | 3 |
| RMS - Inventory | 7 |
| RMS - Procurement | 6 |
| RMS - Stock Counts | 4 |
| RMS - Staff | 4 |
| RMS - Tips | 2 |
| RMS - CRM | 2 |
| RMS - Loyalty | 3 |
| RMS - Gift Cards | 2 |
| RMS - Marketing | 1 |
| RMS - Hardware | 1 |
| RMS - Reports | 1 |
| RMS - IoT | 2 |
| **Total** | **~95 tables** |
