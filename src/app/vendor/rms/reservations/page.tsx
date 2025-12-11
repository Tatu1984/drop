'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import RMSLayout from '@/components/layout/RMSLayout';

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestCount: number;
  date: string;
  timeSlot: string;
  duration: number;
  tableNumber?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  specialRequests?: string;
  occasion?: string;
  source: 'PHONE' | 'WEBSITE' | 'APP' | 'WALK_IN';
  confirmationCode: string;
  createdAt: string;
}

const mockReservations: Reservation[] = [
  { id: '1', guestName: 'Rahul Sharma', guestPhone: '+91 98765 43210', guestEmail: 'rahul@email.com', guestCount: 4, date: '2024-01-15', timeSlot: '19:00', duration: 90, tableNumber: 'T-05', status: 'CONFIRMED', occasion: 'Birthday', source: 'WEBSITE', confirmationCode: 'RES-001234', createdAt: '2024-01-10' },
  { id: '2', guestName: 'Priya Patel', guestPhone: '+91 98765 43211', guestCount: 2, date: '2024-01-15', timeSlot: '19:30', duration: 90, status: 'PENDING', source: 'PHONE', confirmationCode: 'RES-001235', createdAt: '2024-01-12' },
  { id: '3', guestName: 'Amit Kumar', guestPhone: '+91 98765 43212', guestEmail: 'amit@email.com', guestCount: 6, date: '2024-01-15', timeSlot: '20:00', duration: 120, tableNumber: 'T-08', status: 'CONFIRMED', specialRequests: 'Window seat preferred, Nut allergy', source: 'APP', confirmationCode: 'RES-001236', createdAt: '2024-01-11' },
  { id: '4', guestName: 'Neha Singh', guestPhone: '+91 98765 43213', guestCount: 3, date: '2024-01-15', timeSlot: '20:30', duration: 90, status: 'CONFIRMED', source: 'WEBSITE', confirmationCode: 'RES-001237', createdAt: '2024-01-13' },
  { id: '5', guestName: 'Vikram Reddy', guestPhone: '+91 98765 43214', guestCount: 8, date: '2024-01-15', timeSlot: '21:00', duration: 150, tableNumber: 'T-07', status: 'PENDING', occasion: 'Anniversary', specialRequests: 'Quiet corner, cake at 9:30 PM', source: 'PHONE', confirmationCode: 'RES-001238', createdAt: '2024-01-14' },
  { id: '6', guestName: 'Anita Desai', guestPhone: '+91 98765 43215', guestCount: 2, date: '2024-01-14', timeSlot: '19:00', duration: 90, status: 'COMPLETED', source: 'WALK_IN', confirmationCode: 'RES-001230', createdAt: '2024-01-14' },
  { id: '7', guestName: 'Rajesh Gupta', guestPhone: '+91 98765 43216', guestCount: 4, date: '2024-01-14', timeSlot: '20:00', duration: 90, status: 'NO_SHOW', source: 'WEBSITE', confirmationCode: 'RES-001231', createdAt: '2024-01-12' },
];

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const filteredReservations = reservations.filter(res => {
    const matchesDate = res.date === selectedDate;
    const matchesSearch = res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.guestPhone.includes(searchQuery) ||
                         res.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesDate && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'CONFIRMED': return <Badge variant="info">Confirmed</Badge>;
      case 'SEATED': return <Badge variant="primary">Seated</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'NO_SHOW': return <Badge variant="error">No Show</Badge>;
      case 'CANCELLED': return <Badge variant="default">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const updateStatus = (id: string, newStatus: Reservation['status']) => {
    setReservations(reservations.map(res =>
      res.id === id ? { ...res, status: newStatus } : res
    ));
    setSelectedReservation(null);
  };

  const todayStats = {
    total: filteredReservations.length,
    pending: filteredReservations.filter(r => r.status === 'PENDING').length,
    confirmed: filteredReservations.filter(r => r.status === 'CONFIRMED').length,
    seated: filteredReservations.filter(r => r.status === 'SEATED').length,
    totalCovers: filteredReservations.reduce((sum, r) => sum + r.guestCount, 0),
  };

  return (
    <RMSLayout
      title="Reservations"
      subtitle={`${todayStats.total} reservations for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
      actions={
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Reservation
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gray-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">{todayStats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{todayStats.confirmed}</p>
              <p className="text-sm text-blue-600">Confirmed</p>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{todayStats.seated}</p>
              <p className="text-sm text-green-600">Seated</p>
            </div>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{todayStats.totalCovers}</p>
              <p className="text-sm text-orange-600">Total Covers</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prev = new Date(selectedDate);
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(prev.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <button
                onClick={() => {
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Today
              </Button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or confirmation code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SEATED">Seated</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Timeline View */}
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Timeline</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-4">
              <div className="flex gap-4">
                {timeSlots.filter(slot => {
                  const hour = parseInt(slot.split(':')[0]);
                  return hour >= 18; // Only show dinner slots for simplicity
                }).map((slot) => {
                  const slotReservations = filteredReservations.filter(r => r.timeSlot === slot);
                  return (
                    <div key={slot} className="flex-1 min-w-[120px]">
                      <div className="text-center mb-2">
                        <p className="font-medium text-gray-900">{slot}</p>
                        <p className="text-xs text-gray-500">{slotReservations.length} bookings</p>
                      </div>
                      <div className="space-y-2">
                        {slotReservations.map((res) => (
                          <button
                            key={res.id}
                            onClick={() => setSelectedReservation(res)}
                            className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                              res.status === 'PENDING' ? 'bg-yellow-100 hover:bg-yellow-200' :
                              res.status === 'CONFIRMED' ? 'bg-blue-100 hover:bg-blue-200' :
                              res.status === 'SEATED' ? 'bg-green-100 hover:bg-green-200' :
                              'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <p className="font-medium truncate text-gray-900">{res.guestName}</p>
                            <p className="text-xs text-gray-600">{res.guestCount} guests</p>
                            {res.tableNumber && (
                              <p className="text-xs text-gray-500">{res.tableNumber}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* List View */}
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">All Reservations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Guest</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Party Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Table</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No reservations found for this date
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{res.timeSlot}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{res.guestName}</p>
                          <p className="text-sm text-gray-500">{res.guestPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{res.guestCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{res.tableNumber || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          {res.occasion && (
                            <p className="text-sm text-purple-600">{res.occasion}</p>
                          )}
                          {res.specialRequests && (
                            <p className="text-sm text-orange-600 truncate">{res.specialRequests}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReservation(res)}
                          >
                            View
                          </Button>
                          {res.status === 'CONFIRMED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => updateStatus(res.id, 'SEATED')}
                            >
                              Seat
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Reservation Detail Modal */}
      <Modal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        title="Reservation Details"
        maxWidth="md"
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmation Code</p>
                <p className="font-mono font-bold text-gray-900">{selectedReservation.confirmationCode}</p>
              </div>
              {getStatusBadge(selectedReservation.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Guest Name</p>
                <p className="font-medium text-gray-900">{selectedReservation.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Party Size</p>
                <p className="font-medium text-gray-900">{selectedReservation.guestCount} guests</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedReservation.guestPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedReservation.guestEmail || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900">{selectedReservation.date} at {selectedReservation.timeSlot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{selectedReservation.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Table</p>
                <p className="font-medium text-gray-900">{selectedReservation.tableNumber || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium text-gray-900">{selectedReservation.source}</p>
              </div>
            </div>

            {(selectedReservation.occasion || selectedReservation.specialRequests) && (
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedReservation.occasion && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Occasion</p>
                    <p className="font-medium text-purple-600">{selectedReservation.occasion}</p>
                  </div>
                )}
                {selectedReservation.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-500">Special Requests</p>
                    <p className="font-medium text-orange-600">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {selectedReservation.status === 'PENDING' && (
                <>
                  <Button onClick={() => updateStatus(selectedReservation.id, 'CONFIRMED')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                  </Button>
                  <Button variant="outline" className="text-red-600" onClick={() => updateStatus(selectedReservation.id, 'CANCELLED')}>
                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </>
              )}
              {selectedReservation.status === 'CONFIRMED' && (
                <>
                  <Button onClick={() => updateStatus(selectedReservation.id, 'SEATED')}>
                    Seat Guest
                  </Button>
                  <Button variant="outline" className="text-red-600" onClick={() => updateStatus(selectedReservation.id, 'NO_SHOW')}>
                    Mark No Show
                  </Button>
                </>
              )}
              {selectedReservation.status === 'SEATED' && (
                <Button onClick={() => updateStatus(selectedReservation.id, 'COMPLETED')}>
                  Complete
                </Button>
              )}
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-1" /> Send SMS
              </Button>
              <Button variant="ghost">
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Reservation Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Reservation"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
              <input type="text" className="w-full border rounded-lg p-2" placeholder="Enter guest name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="tel" className="w-full border rounded-lg p-2" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg p-2" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Size *</label>
              <input type="number" className="w-full border rounded-lg p-2" placeholder="2" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" className="w-full border rounded-lg p-2" defaultValue={selectedDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <select className="w-full border rounded-lg p-2">
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select className="w-full border rounded-lg p-2">
                <option value="60">1 hour</option>
                <option value="90" selected>1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="150">2.5 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Table</label>
              <select className="w-full border rounded-lg p-2">
                <option value="">Auto-assign later</option>
                <option value="T-01">T-01 (2 seats)</option>
                <option value="T-03">T-03 (4 seats)</option>
                <option value="T-07">T-07 (6 seats)</option>
                <option value="T-08">T-08 (8 seats)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
            <select className="w-full border rounded-lg p-2">
              <option value="">None</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Business">Business Meeting</option>
              <option value="Date">Date Night</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea className="w-full border rounded-lg p-2" rows={3} placeholder="Any dietary restrictions, seating preferences, etc." />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Create Reservation</Button>
          </div>
        </div>
      </Modal>
    </RMSLayout>
  );
}
