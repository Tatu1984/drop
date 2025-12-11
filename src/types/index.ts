// ==================== USER TYPES ====================
export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  avatar?: string;
  dateOfBirth?: Date;
  isKycVerified: boolean;
  isAgeVerified: boolean;
  preferredLanguage: string;
  cuisinePreferences: string[];
  groceryBrands: string[];
  alcoholPreferences: string[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// ==================== VENDOR TYPES ====================
export type VendorType =
  | 'RESTAURANT'
  | 'GROCERY'
  | 'WINE_SHOP'
  | 'PHARMACY'
  | 'MEAT_SHOP'
  | 'MILK_DAIRY'
  | 'PET_SUPPLIES'
  | 'FLOWERS'
  | 'GENERAL_STORE';

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: VendorType;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  address: string;
  latitude: number;
  longitude: number;
  deliveryRadius: number;
  openingTime: string;
  closingTime: string;
  minimumOrder: number;
  avgDeliveryTime: number;
  commissionRate: number;
  licenseNumber?: string;
  licenseExpiry?: Date;
  categories?: Category[];
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  vendorId?: string;
  parentId?: string;
  sortOrder: number;
  children?: Category[];
  products?: Product[];
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId?: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  inStock: boolean;
  stockQuantity?: number;
  isVeg: boolean;
  isVegan: boolean;
  calories?: number;
  allergens: string[];
  packSize?: string;
  brand?: string;
  dietType?: string;
  abvPercent?: number;
  tasteProfile?: string;
  countryOfOrigin?: string;
  year?: number;
  grapeType?: string;
  pairings: string[];
  customizations?: ProductCustomization[];
  rating: number;
  totalRatings: number;
  vendor?: Vendor;
  category?: Category;
}

export interface ProductCustomization {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

// ==================== ORDER TYPES ====================
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderType = 'DELIVERY' | 'PICKUP';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  customizations?: SelectedCustomization[];
  notes?: string;
  partyEventId?: string;
  addedByUserId?: string;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  vendorId: string;
  addressId?: string;
  riderId?: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  tip: number;
  total: number;
  scheduledFor?: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  partyEventId?: string;
  currentLat?: number;
  currentLng?: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  vendor?: Vendor;
  address?: Address;
  rider?: Rider;
  statusHistory?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  customizations?: SelectedCustomization[];
  notes?: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
}

// ==================== GENIE/PORTER TYPES ====================
export type GenieOrderType =
  | 'PICKUP_DROP'
  | 'MULTI_STOP'
  | 'RETURN_DELIVERY'
  | 'BULK_DELIVERY';

export type StopType = 'PICKUP' | 'DROP' | 'WAIT_AND_RETURN';

export interface GenieOrder {
  id: string;
  orderNumber: string;
  userId: string;
  riderId?: string;
  type: GenieOrderType;
  status: OrderStatus;
  estimatedPrice: number;
  finalPrice?: number;
  distance: number;
  weight?: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  stops: GenieStop[];
  rider?: Rider;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenieStop {
  id: string;
  genieOrderId: string;
  stopNumber: number;
  address: string;
  latitude: number;
  longitude: number;
  contactName?: string;
  contactPhone?: string;
  instructions?: string;
  type: StopType;
  completedAt?: Date;
}

// ==================== RIDER TYPES ====================
export type VehicleType =
  | 'BICYCLE'
  | 'SCOOTER'
  | 'BIKE'
  | 'EV_BIKE'
  | 'EV_SCOOTER'
  | 'CAR'
  | 'DRONE';

export interface Rider {
  id: string;
  phone: string;
  email?: string;
  name: string;
  avatar?: string;
  documentVerified: boolean;
  policeVerified: boolean;
  alcoholAuthorized: boolean;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  assignedZone?: string;
}

export interface RiderEarning {
  id: string;
  riderId: string;
  date: Date;
  baseEarning: number;
  tip: number;
  incentive: number;
  penalty: number;
  total: number;
}

// ==================== PARTY MODE TYPES ====================
export type PartyStatus =
  | 'PLANNING'
  | 'ORDERING'
  | 'ORDERED'
  | 'DELIVERED'
  | 'COMPLETED';

export type SplitType = 'EQUAL' | 'BY_ITEM' | 'CUSTOM';

export interface PartyEvent {
  id: string;
  hostUserId: string;
  name: string;
  scheduledFor: Date;
  status: PartyStatus;
  splitType: SplitType;
  participants: PartyParticipant[];
  cartItems?: CartItem[];
  orders?: Order[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PartyParticipant {
  id: string;
  partyEventId: string;
  userId: string;
  user?: User;
  shareAmount?: number;
  hasPaid: boolean;
}

// ==================== PAYMENT & WALLET TYPES ====================
export type PaymentType = 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'COD';

export type TransactionType =
  | 'CREDIT'
  | 'DEBIT'
  | 'CASHBACK'
  | 'REFUND'
  | 'TOP_UP';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentType;
  details: Record<string, string>;
  isDefault: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  orderId?: string;
  createdAt: Date;
}

// ==================== SUBSCRIPTION & LOYALTY TYPES ====================
export type SubscriptionPlan = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type PointsType = 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'BONUS';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface LoyaltyPoints {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  history?: PointsHistory[];
}

export interface PointsHistory {
  id: string;
  loyaltyPointsId: string;
  points: number;
  type: PointsType;
  description?: string;
  createdAt: Date;
}

// ==================== PROMOTION TYPES ====================
export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'FREE_DELIVERY';

export interface Promotion {
  id: string;
  vendorId?: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// ==================== REVIEW TYPES ====================
export interface Review {
  id: string;
  userId: string;
  vendorId?: string;
  productId?: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: Date;
  user?: User;
}

// ==================== SUPPORT TYPES ====================
export type TicketType =
  | 'REFUND'
  | 'MISSING_ITEM'
  | 'WRONG_ITEM'
  | 'QUALITY_ISSUE'
  | 'DELIVERY_ISSUE'
  | 'OTHER';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  userId: string;
  orderId?: string;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromUser: boolean;
  createdAt: Date;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType =
  | 'ORDER_UPDATE'
  | 'PROMOTION'
  | 'SYSTEM'
  | 'REMINDER';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// ==================== SEARCH TYPES ====================
export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  vendorType?: VendorType;
  isVeg?: boolean;
  priceRange?: [number, number];
  rating?: number;
  deliveryTime?: number;
  distance?: number;
  sortBy?: 'price' | 'rating' | 'deliveryTime' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  // Grocery filters
  brand?: string;
  packSize?: string;
  dietType?: string;
  // Wine filters
  abvRange?: [number, number];
  tasteProfile?: string;
  countryOfOrigin?: string;
  yearRange?: [number, number];
  grapeType?: string;
}

// ==================== ADMIN TYPES ====================
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS'
  | 'FINANCE'
  | 'MARKETING'
  | 'SUPPORT';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin?: Admin;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// ==================== ZONE TYPES ====================
export interface Zone {
  id: string;
  name: string;
  polygon: GeoJSON.Polygon;
  isActive: boolean;
  surgePricing: number;
  deliveryFee: number;
}

// ==================== LOCATION TYPES ====================
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// ==================== AI RECOMMENDATION TYPES ====================
export interface ReorderSuggestion {
  productId: string;
  product: Product;
  lastOrderedAt: Date;
  frequency: number;
  confidence: number;
}

export interface AIRecommendation {
  type: 'reorder' | 'similar' | 'trending' | 'personalized';
  products: Product[];
  reason: string;
}
