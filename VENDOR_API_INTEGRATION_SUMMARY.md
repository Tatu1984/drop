# Vendor Portal API Integration Summary

This document summarizes the changes made to integrate real backend APIs into the Vendor Portal.

## Completed Updates

### 1. Created Missing API Endpoints

#### `/src/app/api/vendor/login/route.ts` (NEW)
- POST endpoint for vendor login
- Accepts email or phone with password
- Returns JWT token and vendor info
- Validates vendor status (isActive)

#### `/src/app/api/vendor/onboarding/route.ts` (NEW)
- POST endpoint for vendor registration
- Validates required fields
- Creates vendor account (inactive until verified)
- Hashes password before storing

#### `/src/app/api/vendor/stats/route.ts` (NEW)
- GET endpoint for dashboard statistics
- Returns today's orders, revenue, ratings
- Calculates percentage changes vs yesterday
- Provides order status breakdown

### 2. Updated Vendor Login Page
**File:** `/src/app/vendor/login/page.tsx`

**Changes:**
- Replaced mock authentication with real API call to `/api/vendor/login`
- Stores JWT token in `localStorage` as `vendor-token`
- Stores vendor info in `localStorage` as `vendorAuth`
- Added proper error handling with toast notifications
- Added Loader2 icon import for loading states

### 3. Updated Vendor Dashboard Page
**File:** `/src/app/vendor/dashboard/page.tsx`

**Changes:**
- Added `useEffect` to fetch data on mount
- Fetches from `/api/vendor/stats` and `/api/vendor/orders`
- Uses Authorization header with Bearer token
- Transforms API response to match UI format
- Updates order status via PUT to `/api/vendor/orders`
- Shows loading spinner while fetching data
- Displays real-time order counts and revenue changes

### 4. Updated Vendor Onboarding Page
**File:** `/src/app/vendor/onboarding/page.tsx`

**Changes:**
- Replaced mock submission with real API call to `/api/vendor/onboarding`
- Sends all form data to backend
- Includes password field (currently hardcoded to 'vendor123')
- Redirects to login on successful submission

## Existing API Endpoints (Already Working)

- `/api/vendor/orders` - GET (fetch orders), PUT (update order status)
- `/api/vendor/analytics` - GET (analytics data)
- `/api/vendor/earnings` - GET (earnings and transactions)
- `/api/vendor/reviews` - GET (reviews with stats)
- `/api/vendor/settings` - GET (fetch settings), PUT (update settings)

## Remaining Pages to Update

### 5. Vendor Orders Page
**File:** `/src/app/vendor/orders/page.tsx`

**Required Changes:**
```typescript
// Add useEffect to fetch orders
useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('vendor-token');
    const response = await fetch('/api/vendor/orders', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
      setOrders(data.data.items);
    }
  } catch (error) {
    toast.error('Failed to load orders');
  } finally {
    setIsLoading(false);
  }
};

const updateOrderStatus = async (orderId: string, status: string) => {
  const token = localStorage.getItem('vendor-token');
  const response = await fetch('/api/vendor/orders', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, status }),
  });
  // Handle response...
};
```

### 6. Vendor Analytics Page
**File:** `/src/app/vendor/analytics/page.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  fetchAnalytics();
}, [dateRange]);

const fetchAnalytics = async () => {
  const token = localStorage.getItem('vendor-token');
  const response = await fetch(`/api/vendor/analytics?period=${dateRange}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (data.success) {
    // Update state with real data
    setAnalyticsData(data.data);
  }
};
```

### 7. Vendor Earnings Page
**File:** `/src/app/vendor/earnings/page.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  fetchEarnings();
}, [dateRange]);

const fetchEarnings = async () => {
  const token = localStorage.getItem('vendor-token');
  const response = await fetch(`/api/vendor/earnings?period=${dateRange}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (data.success) {
    setEarningsData(data.data);
  }
};
```

### 8. Vendor Settings Page
**File:** `/src/app/vendor/settings/page.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  fetchSettings();
}, []);

const fetchSettings = async () => {
  const token = localStorage.getItem('vendor-token');
  const response = await fetch('/api/vendor/settings', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (data.success) {
    setStoreSettings(data.data);
  }
};

const handleSave = async () => {
  const token = localStorage.getItem('vendor-token');
  const response = await fetch('/api/vendor/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(storeSettings),
  });
  // Handle response...
};
```

### 9. Vendor Reviews Page
**File:** `/src/app/vendor/reviews/page.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  fetchReviews();
}, [filterRating]);

const fetchReviews = async () => {
  const token = localStorage.getItem('vendor-token');
  const params = new URLSearchParams();
  if (filterRating) params.append('rating', filterRating.toString());

  const response = await fetch(`/api/vendor/reviews?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (data.success) {
    setReviews(data.data.items);
    setStats(data.data.stats);
  }
};
```

## Common Patterns Used

### 1. Authorization Header
All API calls use Bearer token authentication:
```typescript
const token = localStorage.getItem('vendor-token');
headers: { 'Authorization': `Bearer ${token}` }
```

### 2. Error Handling
```typescript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (data.success) {
    // Handle success
    toast.success(data.message);
  } else {
    toast.error(data.error);
  }
} catch (error) {
  console.error('Error:', error);
  toast.error('Operation failed');
}
```

### 3. Loading States
```typescript
const [isLoading, setIsLoading] = useState(true);

if (isLoading) {
  return <Loader2 className="h-8 w-8 animate-spin" />;
}
```

### 4. Toast Notifications
- Success: `toast.success('message')`
- Error: `toast.error('message')`
- Import: `import toast from 'react-hot-toast'`

### 5. Icons
- Import Loader2: `import { Loader2 } from 'lucide-react'`
- Usage: `<Loader2 className="h-8 w-8 animate-spin text-green-600" />`

## API Response Format

All APIs follow this format:
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string
}
```

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/vendor/login`
3. Create a test vendor via the onboarding flow
4. Login with vendor credentials
5. Dashboard should load real stats and orders
6. Test order status updates
7. Navigate through all vendor portal pages

## Database Requirements

Ensure the following models exist in your Prisma schema:
- `Vendor` (with password field)
- `Order` (with status, vendor relation)
- `Review` (with vendor relation)
- `OrderStatusHistory`

## Environment Variables

Required in `.env`:
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `DATABASE_URL` - Database connection string

## Next Steps

1. Complete the remaining 5 pages (orders, analytics, earnings, settings, reviews)
2. Add password field to onboarding form
3. Add authentication guards to check token validity
4. Add automatic token refresh logic
5. Add logout functionality
6. Add real-time order notifications (WebSocket/SSE)
7. Add image upload for vendor logo and store images
8. Add document upload for GSTIN, FSSAI, PAN
