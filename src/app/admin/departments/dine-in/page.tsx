'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, Star, MapPin, CheckCircle, XCircle,
  RefreshCw, Utensils, Clock, DollarSign, TrendingUp, Users,
  Calendar, Table2, Timer, Phone, Boxes
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

interface DineInRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalRatings: number;
  totalBookings: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  phone: string;
  cuisineTypes: string[];
  avgDiningTime: number;
  seatingCapacity: number;
  tablesAvailable: number;
  commissionRate: number;
  isVerified: boolean;
  openingTime: string;
  closingTime: string;
  todayBookings: number;
  upcomingBookings: number;
  acceptsWalkIn: boolean;
  priceRange: string;
  joinedAt: string;
}

interface DineInStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  avgRating: number;
  totalBookings: number;
  todayBookings: number;
  totalSeats: number;
  occupancyRate: number;
}

export default function DineInPage() {
  const [restaurants, setRestaurants] = useState<DineInRestaurant[]>([]);
  const [stats, setStats] = useState<DineInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<DineInRestaurant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        service: 'dine-in',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/departments/dine-in?${params}`, {
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
  }, [search, statusFilter]);

  const handleAction = async (action: string, restaurantId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/dine-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: restaurantId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Action completed');
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

  return (
    <AdminLayout title="Dine-In Restaurant Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage table reservations and dine-in restaurants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRestaurants} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Utensils className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500">Restaurants</p>
            </div>
          </div>
        </Card>
        <Card>
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
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.todayBookings || 0}</p>
              <p className="text-xs text-gray-500">Today&apos;s Bookings</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Table2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalSeats || 0}</p>
              <p className="text-xs text-gray-500">Total Seats</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.occupancyRate || 0}%</p>
              <p className="text-xs text-gray-500">Occupancy</p>
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
            <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No dine-in restaurants found</p>
            <Button className="mt-4">
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
                    <Utensils className="h-16 w-16 text-orange-300" />
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
                {restaurant.acceptsWalkIn && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="info">Walk-in OK</Badge>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {restaurant.priceRange}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{restaurant.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-gray-300">|</span>
                      <span>{restaurant.seatingCapacity} seats</span>
                    </div>
                  </div>
                  {restaurant.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
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
                    <p className="font-semibold">{restaurant.totalBookings}</p>
                    <p className="text-xs text-gray-500">Bookings</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">{restaurant.tablesAvailable}</p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                  <div>
                    <p className="font-semibold">{restaurant.upcomingBookings}</p>
                    <p className="text-xs text-gray-500">Upcoming</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                  <span className="text-gray-300">|</span>
                  <span>~{restaurant.avgDiningTime}min</span>
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
                          title="Manage Menu"
                        >
                          <Boxes className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowBookingsModal(true);
                        }}
                        title="View Bookings"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(
                          restaurant.status === 'suspended' ? 'activate' : 'suspend',
                          restaurant.id
                        )}
                        className={restaurant.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
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
                    <Utensils className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xl">{selectedRestaurant.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedRestaurant.status === 'active' ? 'success' : 'error'}>
                    {selectedRestaurant.status}
                  </Badge>
                  <span className="text-gray-500">{selectedRestaurant.priceRange}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.totalBookings}</p>
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedRestaurant.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.seatingCapacity}</p>
                <p className="text-xs text-gray-500">Seats</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedRestaurant.rating?.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Restaurant Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Address</span>
                  <span className="text-right">{selectedRestaurant.address}</span>
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
                  <span className="text-gray-500">Avg Dining Time</span>
                  <span>{selectedRestaurant.avgDiningTime} mins</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Walk-in</span>
                  <span>{selectedRestaurant.acceptsWalkIn ? 'Accepted' : 'Reservation Only'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Commission Rate</span>
                  <span>{selectedRestaurant.commissionRate}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button fullWidth onClick={() => {
                setShowDetailsModal(false);
                setShowBookingsModal(true);
              }}>
                <Calendar className="h-4 w-4" />
                View Bookings
              </Button>
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
        title="Review Dine-In Application"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Utensils className="h-12 w-12 text-orange-400" />
              <div>
                <h3 className="font-semibold">{selectedRestaurant.name}</h3>
                <p className="text-sm text-gray-500">Dine-In Restaurant Application</p>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedRestaurant.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seating Capacity</span>
                <span>{selectedRestaurant.seatingCapacity} seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Range</span>
                <span>{selectedRestaurant.priceRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied On</span>
                <span>{new Date(selectedRestaurant.joinedAt).toLocaleDateString()}</span>
              </div>
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

      {/* Bookings Modal */}
      <Modal
        isOpen={showBookingsModal}
        onClose={() => {
          setShowBookingsModal(false);
          setSelectedRestaurant(null);
        }}
        title="Reservations"
        size="lg"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedRestaurant.name}</h4>
                <p className="text-sm text-gray-500">{selectedRestaurant.upcomingBookings} upcoming reservations</p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              <div className="p-4 text-center text-gray-500">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Reservations will be loaded here</p>
                <p className="text-sm">Navigate to full booking management for detailed view</p>
              </div>
            </div>

            <Button fullWidth>
              Open Full Booking Manager
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
