'use client';

import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Truck,
  ClipboardList,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  RefreshCw,
  Calendar,
  DollarSign,
  Box,
  ShoppingCart,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  avgDailyUsage: number;
  costPerUnit: number;
  lastReceived: Date;
  supplier: string;
  location: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  itemCount: number;
  expectedDate: Date;
  createdAt: Date;
}

interface StockMovement {
  id: string;
  itemName: string;
  type: 'RECEIVED' | 'CONSUMED' | 'WASTED' | 'TRANSFERRED' | 'ADJUSTED';
  quantity: number;
  unit: string;
  date: Date;
  reference: string;
  user: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Basmati Rice',
    sku: 'RICE-001',
    category: 'Grains',
    unit: 'kg',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    avgDailyUsage: 8,
    costPerUnit: 85,
    lastReceived: new Date('2024-01-10'),
    supplier: 'Metro Foods',
    location: 'Dry Storage A',
    status: 'IN_STOCK',
  },
  {
    id: '2',
    name: 'Chicken Breast',
    sku: 'MEAT-001',
    category: 'Meat',
    unit: 'kg',
    currentStock: 5,
    minStock: 10,
    maxStock: 30,
    avgDailyUsage: 4,
    costPerUnit: 280,
    lastReceived: new Date('2024-01-12'),
    supplier: 'Fresh Meats Co',
    location: 'Walk-in Cooler',
    status: 'LOW_STOCK',
  },
  {
    id: '3',
    name: 'Paneer',
    sku: 'DAIRY-001',
    category: 'Dairy',
    unit: 'kg',
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    avgDailyUsage: 3,
    costPerUnit: 320,
    lastReceived: new Date('2024-01-08'),
    supplier: 'Local Dairy',
    location: 'Walk-in Cooler',
    status: 'OUT_OF_STOCK',
  },
  {
    id: '4',
    name: 'Cooking Oil',
    sku: 'OIL-001',
    category: 'Oils',
    unit: 'L',
    currentStock: 50,
    minStock: 15,
    maxStock: 40,
    avgDailyUsage: 2,
    costPerUnit: 150,
    lastReceived: new Date('2024-01-11'),
    supplier: 'Metro Foods',
    location: 'Dry Storage B',
    status: 'OVERSTOCKED',
  },
  {
    id: '5',
    name: 'Garam Masala',
    sku: 'SPICE-001',
    category: 'Spices',
    unit: 'kg',
    currentStock: 3,
    minStock: 2,
    maxStock: 8,
    avgDailyUsage: 0.3,
    costPerUnit: 450,
    lastReceived: new Date('2024-01-05'),
    supplier: 'Spice Traders',
    location: 'Spice Rack',
    status: 'IN_STOCK',
  },
  {
    id: '6',
    name: 'Tomatoes',
    sku: 'VEG-001',
    category: 'Vegetables',
    unit: 'kg',
    currentStock: 8,
    minStock: 10,
    maxStock: 25,
    avgDailyUsage: 5,
    costPerUnit: 40,
    lastReceived: new Date('2024-01-13'),
    supplier: 'Farm Fresh',
    location: 'Walk-in Cooler',
    status: 'LOW_STOCK',
  },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplier: 'Metro Foods',
    status: 'CONFIRMED',
    totalAmount: 15600,
    itemCount: 8,
    expectedDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    supplier: 'Fresh Meats Co',
    status: 'SENT',
    totalAmount: 8400,
    itemCount: 3,
    expectedDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    supplier: 'Local Dairy',
    status: 'DRAFT',
    totalAmount: 4800,
    itemCount: 4,
    expectedDate: new Date('2024-01-16'),
    createdAt: new Date('2024-01-13'),
  },
];

const mockMovements: StockMovement[] = [
  { id: '1', itemName: 'Basmati Rice', type: 'CONSUMED', quantity: 8, unit: 'kg', date: new Date(), reference: 'Daily usage', user: 'Kitchen' },
  { id: '2', itemName: 'Chicken Breast', type: 'RECEIVED', quantity: 10, unit: 'kg', date: new Date(), reference: 'PO-2024-001', user: 'Ravi' },
  { id: '3', itemName: 'Tomatoes', type: 'WASTED', quantity: 2, unit: 'kg', date: new Date(), reference: 'Spoilage', user: 'Kitchen' },
  { id: '4', itemName: 'Cooking Oil', type: 'TRANSFERRED', quantity: 5, unit: 'L', date: new Date(), reference: 'To Bar', user: 'Manager' },
];

const categories = ['All', 'Grains', 'Meat', 'Dairy', 'Vegetables', 'Spices', 'Oils', 'Beverages'];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'movements' | 'suppliers'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'IN_STOCK':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>;
      case 'LOW_STOCK':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Low Stock</span>;
      case 'OUT_OF_STOCK':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>;
      case 'OVERSTOCKED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Overstocked</span>;
    }
  };

  const getPOStatusBadge = (status: PurchaseOrder['status']) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SENT: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      RECEIVING: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const getMovementBadge = (type: StockMovement['type']) => {
    const styles: Record<string, string> = {
      RECEIVED: 'bg-green-100 text-green-700',
      CONSUMED: 'bg-blue-100 text-blue-700',
      WASTED: 'bg-red-100 text-red-700',
      TRANSFERRED: 'bg-purple-100 text-purple-700',
      ADJUSTED: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>{type}</span>;
  };

  const lowStockCount = mockInventory.filter(i => i.status === 'LOW_STOCK').length;
  const outOfStockCount = mockInventory.filter(i => i.status === 'OUT_OF_STOCK').length;
  const totalValue = mockInventory.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const pendingPOs = mockPurchaseOrders.filter(po => ['DRAFT', 'SENT', 'CONFIRMED'].includes(po.status)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track stock levels, manage orders, and monitor usage</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-blue-600">{pendingPOs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'inventory', label: 'Stock Levels', icon: Package },
              { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
              { id: 'movements', label: 'Stock Movements', icon: RefreshCw },
              { id: 'suppliers', label: 'Suppliers', icon: Truck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="OVERSTOCKED">Overstocked</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Daily Use</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const daysLeft = item.avgDailyUsage > 0 ? Math.floor(item.currentStock / item.avgDailyUsage) : 999;
                    const stockPercent = (item.currentStock / item.maxStock) * 100;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.category}</td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{item.currentStock}</span>
                              <span className="text-gray-500">/ {item.maxStock} {item.unit}</span>
                            </div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  stockPercent > 80 ? 'bg-blue-500' :
                                  stockPercent > 30 ? 'bg-green-500' :
                                  stockPercent > 10 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(stockPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.avgDailyUsage} {item.unit}/day</td>
                        <td className="px-4 py-4">
                          <span className={`font-medium ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {daysLeft === 999 ? '∞' : `${daysLeft} days`}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          ₹{(item.currentStock * item.costPerUnit).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <ShoppingCart className="h-4 w-4 text-orange-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Purchase Orders</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Create PO
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockPurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{po.poNumber}</td>
                      <td className="px-4 py-4 text-gray-600">{po.supplier}</td>
                      <td className="px-4 py-4">{getPOStatusBadge(po.status)}</td>
                      <td className="px-4 py-4 text-gray-600">{po.itemCount} items</td>
                      <td className="px-4 py-4 font-medium text-gray-900">₹{po.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-600">{po.expectedDate.toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Movements Tab */}
        {activeTab === 'movements' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Recent Stock Movements</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Log Waste
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-600">{movement.date.toLocaleString()}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{movement.itemName}</td>
                      <td className="px-4 py-4">{getMovementBadge(movement.type)}</td>
                      <td className="px-4 py-4">
                        <span className={movement.type === 'RECEIVED' ? 'text-green-600' : movement.type === 'WASTED' ? 'text-red-600' : 'text-gray-900'}>
                          {movement.type === 'RECEIVED' ? '+' : '-'}{movement.quantity} {movement.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{movement.reference}</td>
                      <td className="px-4 py-4 text-gray-600">{movement.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Suppliers</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Metro Foods', 'Fresh Meats Co', 'Local Dairy', 'Spice Traders', 'Farm Fresh'].map((supplier, idx) => (
                <div key={supplier} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{supplier}</h4>
                      <p className="text-sm text-gray-500">{['Wholesale', 'Meats', 'Dairy', 'Spices', 'Produce'][idx]}</p>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>Contact: +91 98765 {43210 + idx}</p>
                    <p>Email: {supplier.toLowerCase().replace(' ', '')}@email.com</p>
                    <p>Items: {5 + idx * 2}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm">View Items</Button>
                    <Button variant="outline" size="sm">Create PO</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
