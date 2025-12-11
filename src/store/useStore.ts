import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Address,
  CartItem,
  Product,
  Order,
  GenieOrder,
  Vendor,
  PartyEvent,
  Wallet,
  LoyaltyPoints,
  Subscription,
  Notification,
  SearchFilters,
  Location,
} from '@/types';

// ==================== AUTH STORE ====================
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'manager';
  isAuthenticated: boolean;
}

interface RiderUser {
  id: string;
  phone: string;
  name: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  status: 'pending' | 'active' | 'suspended';
}

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  riderUser: RiderUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otpSent: boolean;
  phone: string;
  setUser: (user: User | null) => void;
  setAdminUser: (admin: AdminUser | null) => void;
  setRiderUser: (rider: RiderUser | null) => void;
  setPhone: (phone: string) => void;
  setOtpSent: (sent: boolean) => void;
  logout: () => void;
  logoutAdmin: () => void;
  logoutRider: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      adminUser: null,
      riderUser: null,
      isAuthenticated: false,
      isLoading: false,
      otpSent: false,
      phone: '',
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAdminUser: (adminUser) => set({ adminUser }),
      setRiderUser: (riderUser) => set({ riderUser }),
      setPhone: (phone) => set({ phone }),
      setOtpSent: (otpSent) => set({ otpSent }),
      logout: () => set({ user: null, isAuthenticated: false, phone: '', otpSent: false }),
      logoutAdmin: () => set({ adminUser: null }),
      logoutRider: () => set({ riderUser: null }),
    }),
    { name: 'auth-storage' }
  )
);

// ==================== LOCATION STORE ====================
interface LocationState {
  currentLocation: Location | null;
  selectedAddress: Address | null;
  addresses: Address[];
  isDetecting: boolean;
  setCurrentLocation: (location: Location | null) => void;
  setSelectedAddress: (address: Address | null) => void;
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setIsDetecting: (detecting: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      selectedAddress: null,
      addresses: [],
      isDetecting: false,
      setCurrentLocation: (currentLocation) => set({ currentLocation }),
      setSelectedAddress: (selectedAddress) => set({ selectedAddress }),
      setAddresses: (addresses) => set({ addresses }),
      addAddress: (address) =>
        set((state) => ({ addresses: [...state.addresses, address] })),
      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
      setIsDetecting: (isDetecting) => set({ isDetecting }),
    }),
    { name: 'location-storage' }
  )
);

// ==================== CART STORE ====================
interface CartState {
  items: CartItem[];
  vendorId: string | null;
  vendor: Vendor | null;
  addItem: (product: Product, quantity: number, customizations?: CartItem['customizations'], notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setVendor: (vendor: Vendor | null) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,
      vendor: null,
      addItem: (product, quantity, customizations, notes) => {
        const state = get();
        if (state.vendorId && state.vendorId !== product.vendorId) {
          if (!confirm('Adding items from a different store will clear your cart. Continue?')) {
            return;
          }
          set({ items: [], vendorId: product.vendorId, vendor: null });
        }

        const existingItem = state.items.find(
          (item) =>
            item.productId === product.id &&
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );

        if (existingItem) {
          set({
            items: state.items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}`,
            userId: '',
            productId: product.id,
            product,
            quantity,
            customizations,
            notes,
          };
          set({
            items: [...state.items, newItem],
            vendorId: product.vendorId,
          });
        }
      },
      removeItem: (itemId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            vendorId: newItems.length > 0 ? state.vendorId : null,
            vendor: newItems.length > 0 ? state.vendor : null,
          };
        }),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((item) =>
                  item.id === itemId ? { ...item, quantity } : item
                )
              : state.items.filter((item) => item.id !== itemId),
        })),
      clearCart: () => set({ items: [], vendorId: null, vendor: null }),
      setVendor: (vendor) => set({ vendor, vendorId: vendor?.id || null }),
      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

// ==================== ORDER STORE ====================
interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  genieOrders: GenieOrder[];
  activeGenieOrder: GenieOrder | null;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setGenieOrders: (orders: GenieOrder[]) => void;
  addGenieOrder: (order: GenieOrder) => void;
  setActiveGenieOrder: (order: GenieOrder | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      activeOrder: null,
      genieOrders: [],
      activeGenieOrder: null,
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setActiveOrder: (activeOrder) => set({ activeOrder }),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
          activeOrder:
            state.activeOrder?.id === orderId
              ? { ...state.activeOrder, status }
              : state.activeOrder,
        })),
      setGenieOrders: (genieOrders) => set({ genieOrders }),
      addGenieOrder: (order) =>
        set((state) => ({ genieOrders: [order, ...state.genieOrders] })),
      setActiveGenieOrder: (activeGenieOrder) => set({ activeGenieOrder }),
    }),
    { name: 'order-storage' }
  )
);

// ==================== PARTY MODE STORE ====================
interface PartyState {
  activeParty: PartyEvent | null;
  myParties: PartyEvent[];
  invitedParties: PartyEvent[];
  setActiveParty: (party: PartyEvent | null) => void;
  setMyParties: (parties: PartyEvent[]) => void;
  setInvitedParties: (parties: PartyEvent[]) => void;
  createParty: (party: PartyEvent) => void;
  updateParty: (party: PartyEvent) => void;
}

export const usePartyStore = create<PartyState>()(
  persist(
    (set) => ({
      activeParty: null,
      myParties: [],
      invitedParties: [],
      setActiveParty: (activeParty) => set({ activeParty }),
      setMyParties: (myParties) => set({ myParties }),
      setInvitedParties: (invitedParties) => set({ invitedParties }),
      createParty: (party) =>
        set((state) => ({ myParties: [party, ...state.myParties] })),
      updateParty: (party) =>
        set((state) => ({
          myParties: state.myParties.map((p) => (p.id === party.id ? party : p)),
          activeParty: state.activeParty?.id === party.id ? party : state.activeParty,
        })),
    }),
    { name: 'party-storage' }
  )
);

// ==================== WALLET STORE ====================
interface WalletState {
  wallet: Wallet | null;
  loyaltyPoints: LoyaltyPoints | null;
  subscription: Subscription | null;
  setWallet: (wallet: Wallet | null) => void;
  setLoyaltyPoints: (points: LoyaltyPoints | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  updateBalance: (amount: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      wallet: null,
      loyaltyPoints: null,
      subscription: null,
      setWallet: (wallet) => set({ wallet }),
      setLoyaltyPoints: (loyaltyPoints) => set({ loyaltyPoints }),
      setSubscription: (subscription) => set({ subscription }),
      updateBalance: (amount) =>
        set((state) => ({
          wallet: state.wallet
            ? { ...state.wallet, balance: state.wallet.balance + amount }
            : null,
        })),
    }),
    { name: 'wallet-storage' }
  )
);

// ==================== SEARCH STORE ====================
interface SearchState {
  query: string;
  filters: SearchFilters;
  recentSearches: string[];
  suggestions: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSuggestions: (suggestions: string[]) => void;
}

const defaultFilters: SearchFilters = {
  sortBy: 'relevance',
  sortOrder: 'desc',
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      filters: defaultFilters,
      recentSearches: [],
      suggestions: [],
      setQuery: (query) => set({ query }),
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: defaultFilters }),
      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((q) => q !== query),
          ].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setSuggestions: (suggestions) => set({ suggestions }),
    }),
    { name: 'search-storage' }
  )
);

// ==================== NOTIFICATION STORE ====================
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
        })),
      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.isRead;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        }),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'notification-storage' }
  )
);

// ==================== UI STORE ====================
interface UIState {
  isSidebarOpen: boolean;
  isAdminSidebarOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isLocationModalOpen: boolean;
  activeTab: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  toggleSidebar: () => void;
  toggleAdminSidebar: () => void;
  setAdminSidebarOpen: (open: boolean) => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleLocationModal: () => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isAdminSidebarOpen: true,
      isCartOpen: false,
      isSearchOpen: false,
      isLocationModalOpen: false,
      activeTab: 'home',
      theme: 'system',
      language: 'en',
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleAdminSidebar: () => set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),
      setAdminSidebarOpen: (isAdminSidebarOpen) => set({ isAdminSidebarOpen }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleLocationModal: () =>
        set((state) => ({ isLocationModalOpen: !state.isLocationModalOpen })),
      setActiveTab: (activeTab) => set({ activeTab }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'ui-storage' }
  )
);
