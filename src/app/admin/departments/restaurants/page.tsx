'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, Star, MapPin, Store, CheckCircle, XCircle,
  RefreshCw, UtensilsCrossed, Clock, DollarSign, TrendingUp, Users,
  Package, Settings, BarChart3, Percent, Image as ImageIcon, Menu as MenuIcon, Boxes
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalRatings: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  phone: string;
  cuisineTypes: string[];
  avgDeliveryTime: number;
  minimumOrder: number;
  commissionRate: number;
  isVerified: boolean;
  openingTime: string;
  closingTime: string;
  menuItems: number;
  todayOrders: number;
  joinedAt: string;
}

interface RestaurantStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  avgRating: number;
  totalOrders: number;
  todayOrders: number;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newCommission, setNewCommission] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingRestaurant, setAddingRestaurant] = useState(false);

  // Form states for add restaurant
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantCuisines, setRestaurantCuisines] = useState<string[]>([]);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [minimumOrder, setMinimumOrder] = useState('100');

  const cuisineTypes = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Fast Food', 'Biryani', 'Desserts'];

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        type: 'RESTAURANT',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/departments/restaurants?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setRestaurants(result.data.restaurants || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load restaurants');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, cuisineFilter]);

  const handleAction = async (action: string, restaurantId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: restaurantId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || `Action completed`);
        fetchRestaurants();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedRestaurant(null);
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedRestaurant || !newCommission) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/restaurants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: selectedRestaurant.id,
          commissionRate: parseFloat(newCommission),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Commission updated');
        fetchRestaurants();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (err) {
      toast.error('Failed to update commission');
    } finally {
      setActionLoading(false);
      setShowCommissionModal(false);
      setNewCommission('');
    }
  };

  const resetAddForm = () => {
    setRestaurantName('');
    setRestaurantPhone('');
    setRestaurantAddress('');
    setRestaurantCuisines([]);
    setOpeningTime('09:00');
    setClosingTime('22:00');
    setMinimumOrder('100');
  };

  const openAddRestaurantModal = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const handleAddRestaurant = async () => {
    if (!restaurantName.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    if (!restaurantPhone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setAddingRestaurant(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          name: restaurantName,
          phone: restaurantPhone,
          address: restaurantAddress,
          cuisineTypes: restaurantCuisines,
          openingTime,
          closingTime,
          minimumOrder: parseFloat(minimumOrder),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Restaurant added successfully');
        setShowAddModal(false);
        resetAddForm();
        fetchRestaurants();
      } else {
        toast.error(result.error || 'Failed to add restaurant');
      }
    } catch (err) {
      toast.error('Failed to add restaurant');
    } finally {
      setAddingRestaurant(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setRestaurantCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  return (
    <AdminLayout title="Restaurant Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage restaurants for food delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRestaurants} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddRestaurantModal}>
            <Plus className="h-4 w-4" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats?.suspended || 0}</p>
              <p className="text-xs text-gray-500">Suspended</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency((stats?.totalRevenue || 0) / 1000)}K</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.avgRating?.toFixed(1) || '0'}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Cuisines</option>
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Restaurants Grid */}
      {loading && restaurants.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : restaurants.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No restaurants found</p>
            <Button className="mt-4" onClick={openAddRestaurantModal}>
              <Plus className="h-4 w-4" />
              Add Your First Restaurant
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 bg-gray-200">
                {restaurant.image ? (
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                    <UtensilsCrossed className="h-16 w-16 text-orange-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge
                    variant={
                      restaurant.status === 'active' ? 'success' :
                      restaurant.status === 'pending' ? 'warning' : 'error'
                    }
                  >
                    {restaurant.status}
                  </Badge>
                </div>
                {restaurant.isVerified && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{restaurant.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <span>({restaurant.totalRatings || 0})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(restaurant.revenue / 1000)}K</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(restaurant.cuisineTypes || []).slice(0, 3).map(cuisine => (
                    <span key={cuisine} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3 py-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{restaurant.orders || 0}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="font-semibold">{restaurant.menuItems || 0}</p>
                    <p className="text-xs text-gray-500">Items</p>
                  </div>
                  <div>
                    <p className="font-semibold">{restaurant.commissionRate || 15}%</p>
                    <p className="text-xs text-gray-500">Commission</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{restaurant.address || 'No address'}</span>
                </div>

                <div className="flex gap-2">
                  {restaurant.status === 'pending' ? (
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        setShowApprovalModal(true);
                      }}
                    >
                      Review Application
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowDetailsModal(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/inventory/${restaurant.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Manage Inventory"
                        >
                          <Boxes className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setNewCommission(restaurant.commissionRate?.toString() || '15');
                          setShowCommissionModal(true);
                        }}
                        title="Commission Settings"
                      >
                        <Percent className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(
                          restaurant.status === 'suspended' ? 'activate' : 'suspend',
                          restaurant.id
                        )}
                        className={restaurant.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                        title={restaurant.status === 'suspended' ? 'Activate' : 'Suspend'}
                      >
                        {restaurant.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Restaurant Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRestaurant(null);
        }}
        title="Restaurant Details"
        size="lg"
      >
        {selectedRestaurant && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                {selectedRestaurant.image ? (
                  <Image
                    src={selectedRestaurant.image}
                    alt={selectedRestaurant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xl">{selectedRestaurant.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedRestaurant.status === 'active' ? 'success' : 'error'}>
                    {selectedRestaurant.status}
                  </Badge>
                  {selectedRestaurant.isVerified && (
                    <Badge variant="info">Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.orders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedRestaurant.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.rating?.toFixed(1) || 'N/A'}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.menuItems}</p>
                <p className="text-xs text-gray-500">Menu Items</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Restaurant Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Address</span>
                  <span className="text-right">{selectedRestaurant.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Phone</span>
                  <span>{selectedRestaurant.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Opening Hours</span>
                  <span>{selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Avg Delivery Time</span>
                  <span>{selectedRestaurant.avgDeliveryTime} mins</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Minimum Order</span>
                  <span>{formatCurrency(selectedRestaurant.minimumOrder)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Commission Rate</span>
                  <span>{selectedRestaurant.commissionRate}%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Today&apos;s Orders</span>
                  <span>{selectedRestaurant.todayOrders}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Joined</span>
                  <span>{new Date(selectedRestaurant.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Link href={`/admin/inventory/${selectedRestaurant.id}`} className="flex-1">
                <Button fullWidth>
                  <Boxes className="h-4 w-4" />
                  Manage Inventory
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRestaurant(null);
        }}
        title="Review Restaurant Application"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <UtensilsCrossed className="h-12 w-12 text-orange-400" />
              <div>
                <h3 className="font-semibold">{selectedRestaurant.name}</h3>
                <p className="text-sm text-gray-500">Restaurant Application</p>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedRestaurant.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{selectedRestaurant.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Opening Hours</span>
                <span>{selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Menu Items</span>
                <span>{selectedRestaurant.menuItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied On</span>
                <span>{new Date(selectedRestaurant.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Approving this restaurant will make it visible to customers and enable order placement.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleAction('reject', selectedRestaurant.id)}
                loading={actionLoading}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                fullWidth
                onClick={() => handleAction('approve', selectedRestaurant.id)}
                loading={actionLoading}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Commission Modal */}
      <Modal
        isOpen={showCommissionModal}
        onClose={() => {
          setShowCommissionModal(false);
          setSelectedRestaurant(null);
          setNewCommission('');
        }}
        title="Update Commission Rate"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Set commission rate for <strong>{selectedRestaurant.name}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                placeholder="Enter commission rate"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current rate: {selectedRestaurant.commissionRate}%
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                This change will affect future orders. Existing orders will retain their original commission.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCommissionModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleUpdateCommission}
                loading={actionLoading}
              >
                Update Commission
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Menu Management Modal */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => {
          setShowMenuModal(false);
          setSelectedRestaurant(null);
        }}
        title="Menu Management"
        size="lg"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedRestaurant.name}</h4>
                <p className="text-sm text-gray-500">{selectedRestaurant.menuItems} items in menu</p>
              </div>
              <Link href={selectedRestaurant ? `/admin/inventory/${selectedRestaurant.id}` : '#'}>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {/* Placeholder for menu items */}
              <div className="p-4 text-center text-gray-500">
                <MenuIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Menu items will be loaded here</p>
                <p className="text-sm">Navigate to the full menu management page for detailed editing</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowMenuModal(false)}>
                Close
              </Button>
              <Link href={selectedRestaurant ? `/admin/inventory/${selectedRestaurant.id}` : '#'} className="flex-1">
                <Button fullWidth>
                  Open Full Menu Editor
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Restaurant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
        title="Add New Restaurant"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order
              </label>
              <input
                type="number"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="Enter full address"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Types
              </label>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map(cuisine => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      restaurantCuisines.includes(cuisine)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddRestaurant} loading={addingRestaurant}>
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
