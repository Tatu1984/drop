# User Client Pages Documentation

## Overview

The User app provides a consumer-facing interface for ordering food and essentials from restaurants, grocery stores, wine shops, pharmacies, and other hyperlocal vendors.

**Base Path:** `/` (root)

**Authentication:** Optional for browsing, required for ordering. Uses OTP-based phone authentication.

---

## Table of Contents

1. [Home](#1-home)
2. [Authentication](#2-authentication)
3. [Search](#3-search)
4. [Categories](#4-categories)
5. [Store/Vendor](#5-storevendor)
6. [Cart](#6-cart)
7. [Checkout](#7-checkout)
8. [Orders](#8-orders)
9. [Order Tracking](#9-order-tracking)
10. [Profile](#10-profile)
11. [Wallet & Payments](#11-wallet--payments)
12. [Addresses](#12-addresses)
13. [Special Features](#13-special-features)
14. [Support](#14-support)

---

## 1. Home

**Path:** `/`

### User Flow
1. User opens app → sees location prompt or auto-detected location
2. Browse featured categories (Food, Grocery, Wine, etc.)
3. View nearby vendors sorted by relevance/rating/distance
4. See active offers and promotions
5. Quick access to party mode, genie, and subscriptions

### UX Elements
- **Location Bar:** Current address with change option
- **Search Bar:** Search vendors, cuisines, products
- **Category Carousel:** Horizontal scrollable icons (Food, Grocery, Wine, Pharmacy, etc.)
- **Offers Banner:** Promotional carousel
- **Vendor Grid:** Cards with image, name, rating, delivery time, offers
- **Bottom Navigation:** Home, Search, Cart, Orders, Profile

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get vendors | `/api/vendors` | GET |
| Get categories | `/api/categories` | GET |
| Get offers | `/api/offers` | GET |

### Actions
- Select delivery location
- Browse vendors by category
- Search vendors/products
- Add items to cart from quick view

---

## 2. Authentication

### 2.1 Login/Register
**Path:** `/auth`

### User Flow
1. Enter phone number
2. Receive OTP via SMS
3. Enter OTP to verify
4. If new user, enter name
5. Redirect to home or previous page

### UX Elements
- **Phone Input:** Country code + 10-digit number
- **OTP Input:** 6-digit code with auto-focus
- **Timer:** Resend OTP countdown (60 seconds)
- **Name Input:** For new users only

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Send OTP | `/api/auth/otp` | POST |
| Verify OTP | `/api/auth/otp` | POST |

### 2.2 OTP Verification
**Path:** `/auth/verify`

Separate page for OTP entry with resend functionality.

---

## 3. Search

**Path:** `/search`

### User Flow
1. Tap search bar → focus on input
2. Type query → see real-time suggestions
3. View search results (vendors + products)
4. Apply filters (cuisine, rating, veg/non-veg)
5. Tap result → navigate to vendor/product

### UX Elements
- **Search Input:** Auto-focus with clear button
- **Recent Searches:** Previous search history
- **Suggestions:** Popular searches, trending items
- **Results Tabs:** Vendors, Products, Cuisines
- **Filter Chips:** Quick filters (Rating 4+, Pure Veg, etc.)
- **Sort Options:** Relevance, Rating, Distance, Delivery Time

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Search | `/api/search` | GET |
| Suggestions | `/api/search/suggestions` | GET |

---

## 4. Categories

### 4.1 Category Listing
**Path:** `/category/[id]`

Vendors filtered by specific category (restaurants, grocery, etc.).

### 4.2 Wine Category
**Path:** `/category/wine`

Special category with age verification requirement.

### UX Elements
- **Age Gate:** Must verify 21+ before viewing
- **Vendor Grid:** Wine shops with license status
- **Product Cards:** Wine/beer products with ABV info

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Category vendors | `/api/vendors?category=wine` | GET |
| Age verification | `/api/user/verify-age` | POST |

---

## 5. Store/Vendor

**Path:** `/store/[id]`

### User Flow
1. View vendor details (name, rating, delivery info)
2. Browse menu categories
3. View product details
4. Add items to cart with customizations
5. Apply offers if available

### UX Elements
- **Hero Section:** Cover image, logo, name, rating
- **Info Bar:** Delivery time, minimum order, distance
- **Menu Tabs:** Category navigation
- **Product Grid/List:** Items with images, prices, add button
- **Product Modal:** Full details with modifiers/customizations
- **Sticky Cart Bar:** Item count, total, view cart button
- **Offers Section:** Available coupons for this vendor

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Vendor details | `/api/vendors/[id]` | GET |
| Vendor products | `/api/products?vendorId=[id]` | GET |
| Product details | `/api/products/[id]` | GET |

### Actions
- Add item to cart
- Customize item (size, toppings, etc.)
- Apply vendor-specific coupon
- Add to favorites

---

## 6. Cart

**Path:** `/cart`

### User Flow
1. View cart items from current vendor
2. Adjust quantities or remove items
3. Add delivery instructions
4. Apply coupon code
5. Add tip for delivery partner
6. View bill breakdown
7. Proceed to checkout

### UX Elements
- **Empty State:** Illustration with "Browse Restaurants" CTA
- **Vendor Header:** Current vendor name
- **Item Cards:** Image, name, veg/non-veg indicator, quantity controls, price
- **Delivery Address:** Selected address with change link
- **Coupon Section:** Apply/view coupons modal
- **Tip Selection:** Preset amounts (₹0, ₹10, ₹20, ₹30, ₹50)
- **Bill Details:** Itemized breakdown (subtotal, delivery, platform fee, discount, tip, total)
- **Sticky Checkout Bar:** Total amount, checkout button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Validate cart | `/api/cart/validate` | POST |
| Apply coupon | `/api/coupons/apply` | POST |

### Actions
- Update item quantity (+/-)
- Remove item
- Clear entire cart
- Apply/remove coupon
- Select tip amount
- Add delivery instructions
- Change delivery address
- Proceed to checkout

---

## 7. Checkout

**Path:** `/checkout`

### User Flow
1. Confirm delivery address
2. Select payment method
3. Review order summary
4. Place order
5. Complete payment (if not COD)
6. Redirect to order confirmation

### UX Elements
- **Address Section:** Delivery address with edit option
- **Order Summary:** Items, quantities, prices
- **Payment Methods:** UPI, Cards, Wallets, COD
- **Wallet Balance:** If available, option to use
- **Bill Details:** Final breakdown
- **Place Order Button:** With loading state

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Create order | `/api/orders` | POST |
| Initiate payment | `/api/payments` | POST |
| Confirm payment | `/api/payments/verify` | POST |

---

## 8. Orders

**Path:** `/orders`

### User Flow
1. View active and past orders in tabs
2. Track active order status
3. View order details
4. Reorder from past orders
5. Leave review for completed orders

### UX Elements
- **Tabs:** Active / Past Orders
- **Order Cards:**
  - Status banner (active orders)
  - Vendor logo and name
  - Item count, total, time
  - Action buttons (Track/Reorder)
- **Empty State:** "No orders" with "Order Now" CTA

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List orders | `/api/orders` | GET |
| Order details | `/api/orders/[id]` | GET |

### Actions
- View order details
- Track live order
- Call restaurant/rider
- Reorder past order
- Leave review

---

## 9. Order Tracking

**Path:** `/orders/[id]/track`

### User Flow
1. View order status timeline
2. See live rider location on map
3. View ETA updates
4. Contact rider or support
5. Mark as delivered or report issue

### UX Elements
- **Status Timeline:** Visual steps with timestamps
- **Live Map:** Rider location with route to destination
- **ETA Card:** Estimated arrival time
- **Contact Options:** Call/chat with rider
- **Rider Card:** Photo, name, rating, vehicle info

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Order status | `/api/orders/[id]` | GET |
| Rider location | `/api/orders/[id]/tracking` | GET |

---

## 10. Profile

**Path:** `/profile`

### User Flow
1. View profile summary
2. Access quick stats (wallet, points, orders)
3. Navigate to sub-sections
4. Manage settings
5. Logout

### UX Elements
- **Profile Header:** Avatar, name, phone, edit button
- **Stats Cards:** Wallet balance, loyalty points, order count
- **Prime Banner:** Subscription upsell
- **Menu Sections:**
  - Orders & Payments (Payment Methods, Addresses, Refer & Earn)
  - Rewards (Prime, Wallet, Loyalty Points)
  - Preferences (Favorites, Notifications, Settings)
  - Support (Help, Terms, Privacy)
- **Logout Button:** With confirmation modal

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Get profile | `/api/user/profile` | GET |
| Update profile | `/api/user/profile` | PUT |

### 10.1 Edit Profile
**Path:** `/profile/edit`

Update name, email, and avatar.

### 10.2 Favorites
**Path:** `/profile/favorites`

View and manage favorite vendors and products.

### 10.3 Settings
**Path:** `/profile/settings`

Notification preferences, language, dark mode.

---

## 11. Wallet & Payments

### 11.1 Wallet
**Path:** `/profile/wallet`

### UX Elements
- **Balance Card:** Current balance
- **Transaction History:** Credits, debits with dates
- **Add Money:** UPI/Card payment
- **Offers:** Cashback on adding money

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| Wallet balance | `/api/wallet` | GET |
| Add money | `/api/wallet/add` | POST |
| Transactions | `/api/wallet/transactions` | GET |

### 11.2 Payment Methods
**Path:** `/profile/payments`

Manage saved cards and UPI IDs.

### 11.3 Loyalty Points
**Path:** `/profile/loyalty`

View points balance, earning history, redemption options.

### 11.4 Referral
**Path:** `/profile/referral`

Share referral code, view referral rewards.

---

## 12. Addresses

**Path:** `/profile/addresses`

### User Flow
1. View saved addresses
2. Add new address via map/search
3. Set default address
4. Edit or delete addresses

### UX Elements
- **Address Cards:** Type icon, label, full address, set default, edit/delete
- **Add Button:** Opens address form
- **Address Form:**
  - Map pin selection
  - Address search
  - House/flat number
  - Landmark
  - Label (Home, Work, Other)
  - Save button

### Backend Routes
| Action | Route | Method |
|--------|-------|--------|
| List addresses | `/api/addresses` | GET |
| Add address | `/api/addresses` | POST |
| Update address | `/api/addresses/[id]` | PUT |
| Delete address | `/api/addresses/[id]` | DELETE |

---

## 13. Special Features

### 13.1 Party Mode
**Path:** `/party`

Group ordering feature for gatherings.

### UX Elements
- **Create Party:** Set party details
- **Share Link:** Invite friends to add items
- **Collaborative Cart:** See who added what
- **Split Bill:** Options for payment splitting

### 13.2 Genie Service
**Path:** `/genie`

Anything-anywhere delivery service.

### UX Elements
- **Pickup Location:** Enter/select pickup address
- **Drop Location:** Enter/select drop address
- **Package Details:** Size, contents, instructions
- **Price Estimate:** Based on distance
- **Schedule:** Now or later

### 13.3 Subscription (Drop Prime)
**Path:** `/subscription`

Premium membership benefits.

### UX Elements
- **Benefits List:** Free delivery, exclusive offers, priority support
- **Plan Options:** Monthly, quarterly, annual
- **Payment:** Subscribe button

### 13.4 Offers
**Path:** `/offers`

View all active promotions and coupons.

---

## 14. Support

### 14.1 Help Center
**Path:** `/help`

FAQs and help articles.

### 14.2 Support Chat
**Path:** `/support/chat`

Live chat with support team.

### 14.3 Support Home
**Path:** `/support`

Contact options and ticket history.

### 14.4 Notifications
**Path:** `/notifications`

Order updates and promotional notifications.

---

## Static Pages

### Terms & Conditions
**Path:** `/terms`

Legal terms of service.

### Privacy Policy
**Path:** `/privacy`

Data privacy policy.

---

## Common UX Patterns

### Bottom Navigation
- Home (house icon)
- Search (magnifying glass)
- Cart (shopping bag with badge)
- Orders (package icon)
- Profile (user icon)

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Pull-to-refresh on lists

### Toast Notifications
- Success (green): Order placed, item added
- Error (red): Payment failed, validation error
- Info (blue): Delivery updates

### Modals
- Product customization
- Coupon selection
- Confirmation dialogs
- Address picker

### Forms
- Phone number with country code
- OTP input with auto-focus
- Address form with map integration

---

## Summary

| Section | Pages | Key Features |
|---------|-------|--------------|
| Home | 1 | Vendor discovery, categories |
| Auth | 2 | OTP login/register |
| Search | 1 | Full-text search, filters |
| Categories | 2+ | Category-specific browsing |
| Store | 1 | Menu, products, add to cart |
| Cart | 1 | Quantity, coupons, tips |
| Checkout | 1 | Payment, order placement |
| Orders | 2 | Active/past orders |
| Tracking | 1 | Live map, status timeline |
| Profile | 8 | Settings, preferences |
| Wallet | 3 | Balance, transactions, payments |
| Addresses | 1 | CRUD, map selection |
| Special | 4 | Party, Genie, Prime, Offers |
| Support | 3 | Help, chat, notifications |
