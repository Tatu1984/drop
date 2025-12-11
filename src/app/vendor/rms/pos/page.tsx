'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Users,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  Percent,
  ChevronRight,
  X,
  Printer,
  Split,
  ChefHat,
  AlertCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import RMSLayout from '@/components/layout/RMSLayout';

interface MenuItem {
  id: string;
  name: string;
  shortName: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  prepTime: number;
}

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  modifiers: string[];
  notes: string;
  seatNumber?: number;
  courseType: string;
}

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  currentOrder?: { id: string; total: number; items: number };
}

const mockCategories = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Starters' },
  { id: '3', name: 'Main Course' },
  { id: '4', name: 'Breads' },
  { id: '5', name: 'Rice & Biryani' },
  { id: '6', name: 'Desserts' },
  { id: '7', name: 'Beverages' },
  { id: '8', name: 'Bar' },
];

const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka', shortName: 'P.TIKKA', price: 320, category: 'Starters', isVeg: true, isAvailable: true, prepTime: 15 },
  { id: '2', name: 'Chicken Tikka', shortName: 'CH.TIKKA', price: 380, category: 'Starters', isVeg: false, isAvailable: true, prepTime: 15 },
  { id: '3', name: 'Veg Spring Roll', shortName: 'V.SPRING', price: 180, category: 'Starters', isVeg: true, isAvailable: true, prepTime: 10 },
  { id: '4', name: 'Butter Chicken', shortName: 'BUT.CH', price: 420, category: 'Main Course', isVeg: false, isAvailable: true, prepTime: 20 },
  { id: '5', name: 'Dal Makhani', shortName: 'DAL.M', price: 280, category: 'Main Course', isVeg: true, isAvailable: true, prepTime: 15 },
  { id: '6', name: 'Paneer Butter Masala', shortName: 'PBM', price: 340, category: 'Main Course', isVeg: true, isAvailable: true, prepTime: 18 },
  { id: '7', name: 'Chicken Biryani', shortName: 'CH.BIR', price: 380, category: 'Rice & Biryani', isVeg: false, isAvailable: true, prepTime: 25 },
  { id: '8', name: 'Veg Biryani', shortName: 'V.BIR', price: 320, category: 'Rice & Biryani', isVeg: true, isAvailable: true, prepTime: 25 },
  { id: '9', name: 'Butter Naan', shortName: 'B.NAAN', price: 60, category: 'Breads', isVeg: true, isAvailable: true, prepTime: 5 },
  { id: '10', name: 'Garlic Naan', shortName: 'G.NAAN', price: 70, category: 'Breads', isVeg: true, isAvailable: true, prepTime: 5 },
  { id: '11', name: 'Gulab Jamun', shortName: 'G.JAM', price: 120, category: 'Desserts', isVeg: true, isAvailable: true, prepTime: 5 },
  { id: '12', name: 'Masala Chai', shortName: 'M.CHAI', price: 60, category: 'Beverages', isVeg: true, isAvailable: true, prepTime: 5 },
  { id: '13', name: 'Fresh Lime Soda', shortName: 'FLS', price: 80, category: 'Beverages', isVeg: true, isAvailable: true, prepTime: 3 },
  { id: '14', name: 'Kingfisher Beer', shortName: 'KF.BEER', price: 250, category: 'Bar', isVeg: true, isAvailable: true, prepTime: 2 },
  { id: '15', name: 'Old Monk Rum', shortName: 'OM.RUM', price: 180, category: 'Bar', isVeg: true, isAvailable: false, prepTime: 2 },
];

const mockTables: Table[] = [
  { id: '1', tableNumber: 'T-01', capacity: 2, status: 'AVAILABLE' },
  { id: '2', tableNumber: 'T-02', capacity: 2, status: 'OCCUPIED', currentOrder: { id: 'o1', total: 850, items: 4 } },
  { id: '3', tableNumber: 'T-03', capacity: 4, status: 'AVAILABLE' },
  { id: '4', tableNumber: 'T-04', capacity: 4, status: 'RESERVED' },
  { id: '5', tableNumber: 'T-05', capacity: 4, status: 'OCCUPIED', currentOrder: { id: 'o2', total: 1250, items: 6 } },
  { id: '6', tableNumber: 'T-06', capacity: 6, status: 'CLEANING' },
  { id: '7', tableNumber: 'T-07', capacity: 6, status: 'AVAILABLE' },
  { id: '8', tableNumber: 'T-08', capacity: 8, status: 'AVAILABLE' },
];

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [showTableSelector, setShowTableSelector] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const filteredItems = mockMenuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addItem = (item: MenuItem) => {
    if (!item.isAvailable) return;

    const existingIndex = orderItems.findIndex(oi => oi.menuItem.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, {
        id: `oi-${Date.now()}`,
        menuItem: item,
        quantity: 1,
        modifiers: [],
        notes: '',
        courseType: 'MAIN',
      }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const updated = orderItems.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setOrderItems(updated);
  };

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = Math.round(subtotal * 0.10);
  const total = subtotal + tax + serviceCharge;

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 border-green-500 text-green-700';
      case 'OCCUPIED': return 'bg-red-100 border-red-500 text-red-700';
      case 'RESERVED': return 'bg-purple-100 border-purple-500 text-purple-700';
      case 'CLEANING': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  if (showTableSelector && !selectedTable) {
    return (
      <RMSLayout title="POS - Select Table" subtitle="Choose a table to start taking order" fullWidth>
        <div className="h-full flex flex-col p-4 lg:p-6">
          {/* Table Selection Grid */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Select Table</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    if (table.status === 'AVAILABLE' || table.status === 'OCCUPIED') {
                      setSelectedTable(table);
                      setShowTableSelector(false);
                    }
                  }}
                  disabled={table.status === 'RESERVED' || table.status === 'CLEANING'}
                  className={`p-4 rounded-xl border-2 transition-all ${getStatusColor(table.status)} ${
                    table.status === 'AVAILABLE' || table.status === 'OCCUPIED'
                      ? 'hover:scale-105 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">{table.tableNumber}</p>
                    <p className="text-sm mt-1">{table.capacity} seats</p>
                    <p className="text-xs mt-2 uppercase">{table.status}</p>
                    {table.currentOrder && (
                      <p className="text-xs mt-1">₹{table.currentOrder.total}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{mockTables.filter(t => t.status === 'AVAILABLE').length}</p>
              <p className="text-sm text-green-600">Available</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{mockTables.filter(t => t.status === 'OCCUPIED').length}</p>
              <p className="text-sm text-red-600">Occupied</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">{mockTables.filter(t => t.status === 'RESERVED').length}</p>
              <p className="text-sm text-purple-600">Reserved</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">{mockTables.filter(t => t.status === 'CLEANING').length}</p>
              <p className="text-sm text-yellow-600">Cleaning</p>
            </div>
          </div>

          {/* Quick Takeaway */}
          <div className="mt-auto">
            <Button
              onClick={() => {
                setSelectedTable({ id: 'takeaway', tableNumber: 'TAKEAWAY', capacity: 0, status: 'AVAILABLE' });
                setShowTableSelector(false);
              }}
              variant="outline"
              className="w-full py-4"
            >
              Start Takeaway Order
            </Button>
          </div>
        </div>
      </RMSLayout>
    );
  }

  return (
    <RMSLayout
      title={`POS - ${selectedTable?.tableNumber || 'New Order'}`}
      subtitle={selectedTable?.tableNumber !== 'TAKEAWAY' ? `${guestCount} guests` : 'Takeaway Order'}
      fullWidth
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTable(null);
              setShowTableSelector(true);
              setOrderItems([]);
            }}
          >
            Change Table
          </Button>
        </div>
      }
    >
      <div className="h-[calc(100vh-80px)] flex">
        {/* Left Panel - Menu */}
        <div className="flex-1 flex flex-col border-r bg-gray-50">
          {/* Search & Categories */}
          <div className="p-4 bg-white border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  disabled={!item.isAvailable}
                  className={`p-3 rounded-xl text-left transition-all ${
                    item.isAvailable
                      ? 'bg-white border hover:border-orange-500 hover:shadow-md'
                      : 'bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 ${
                      item.isVeg ? 'border-green-500' : 'border-red-500'
                    }`}>
                      <span className={`block w-2 h-2 m-0.5 rounded-full ${
                        item.isVeg ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </span>
                    {!item.isAvailable && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                        86&apos;d
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.shortName}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">₹{item.price}</p>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.prepTime}m
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Order */}
        <div className="w-96 flex flex-col bg-white">
          {/* Order Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{selectedTable?.tableNumber}</h3>
                <p className="text-sm text-gray-500">Order #{Date.now().toString().slice(-6)}</p>
              </div>
              {selectedTable?.tableNumber !== 'TAKEAWAY' && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {guestCount}
                  </span>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ChefHat className="h-12 w-12 mb-2" />
                <p>No items added yet</p>
                <p className="text-sm">Tap on menu items to add</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                        <p className="text-sm text-gray-500">₹{item.menuItem.price} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{item.menuItem.price * item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (5%)</span>
                <span className="text-gray-900">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge (10%)</span>
                <span className="text-gray-900">₹{serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => setShowDiscountModal(true)}>
                <Percent className="h-4 w-4 mr-1" />
                Discount
              </Button>
              <Button variant="outline" size="sm">
                <Split className="h-4 w-4 mr-1" />
                Split Bill
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={orderItems.length === 0}>
                <Printer className="h-4 w-4 mr-1" />
                Print KOT
              </Button>
              <Button
                onClick={() => setShowPaymentModal(true)}
                disabled={orderItems.length === 0}
              >
                Pay ₹{total.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Process Payment"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Amount to Pay</p>
            <p className="text-3xl font-bold text-gray-900">₹{total.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border-2 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium text-gray-900">Cash</p>
            </button>
            <button className="p-4 border-2 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Card</p>
            </button>
            <button className="p-4 border-2 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium text-gray-900">UPI</p>
            </button>
            <button className="p-4 border-2 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Gift className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <p className="font-medium text-gray-900">Gift Card</p>
            </button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Complete Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        title="Apply Discount"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select className="w-full border rounded-lg p-2">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input type="number" className="w-full border rounded-lg p-2" placeholder="Enter value" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select className="w-full border rounded-lg p-2">
              <option value="">Select reason...</option>
              <option value="manager">Manager Discount</option>
              <option value="loyalty">Loyalty Reward</option>
              <option value="complaint">Customer Complaint</option>
              <option value="promo">Promotion</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDiscountModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Apply Discount
            </Button>
          </div>
        </div>
      </Modal>
    </RMSLayout>
  );
}
