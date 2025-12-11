'use client';

import { useState, useEffect } from 'react';
import { Clock, Search, Users, Calendar, Plus, RefreshCw, Sun, Moon, Sunrise, Edit, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  ridersAssigned: number;
  ridersActive: number;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  zones: string[];
  status: 'active' | 'upcoming' | 'completed';
}

interface ShiftAssignment {
  id: string;
  riderName: string;
  riderPhone: string;
  shiftName: string;
  date: string;
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  checkIn?: string;
  checkOut?: string;
}

export default function ShiftSchedulingPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'shifts' | 'assignments'>('shifts');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('14:00');
  const [shiftZones, setShiftZones] = useState<string[]>(['Zone A']);

  useEffect(() => {
    fetchShiftData();
  }, [selectedDate]);

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/fleet/shifts?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setShifts(data.data.shifts);
        setAssignments(data.data.assignments);
      }
    } catch (error) {
      console.error('Failed to fetch shift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftIcon = (type: string) => {
    switch (type) {
      case 'morning': return <Sunrise className="h-5 w-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="h-5 w-5 text-orange-500" />;
      case 'evening': return <Sun className="h-5 w-5 text-red-500" />;
      case 'night': return <Moon className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" size="sm">Active</Badge>;
      case 'upcoming': return <Badge variant="info" size="sm">Upcoming</Badge>;
      case 'completed': return <Badge variant="default" size="sm">Completed</Badge>;
      case 'scheduled': return <Badge variant="info" size="sm">Scheduled</Badge>;
      case 'missed': return <Badge variant="error" size="sm">Missed</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const openCreateModal = () => {
    setShiftName('');
    setStartTime('06:00');
    setEndTime('14:00');
    setShiftZones(['Zone A']);
    setShowCreateModal(true);
  };

  const viewShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setShowViewModal(true);
  };

  const createShift = async () => {
    if (!shiftName.trim()) {
      toast.error('Shift name is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/fleet/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: shiftName,
          startTime,
          endTime,
          zones: shiftZones,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Shift created successfully');
        setShowCreateModal(false);
        fetchShiftData();
      } else {
        toast.error(data.error || 'Failed to create shift');
      }
    } catch (error) {
      toast.error('Failed to create shift');
    } finally {
      setSaving(false);
    }
  };

  const toggleZone = (zone: string) => {
    setShiftZones(prev =>
      prev.includes(zone)
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const stats = {
    totalShifts: shifts.length,
    activeShifts: shifts.filter(s => s.status === 'active').length,
    totalAssigned: shifts.reduce((sum, s) => sum + s.ridersAssigned, 0),
    activeRiders: shifts.reduce((sum, s) => sum + s.ridersActive, 0),
  };

  return (
    <AdminLayout title="Shift Scheduling">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shifts</p>
              <p className="text-xl font-bold">{stats.totalShifts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Now</p>
              <p className="text-xl font-bold">{stats.activeShifts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned</p>
              <p className="text-xl font-bold">{stats.totalAssigned}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Riders</p>
              <p className="text-xl font-bold">{stats.activeRiders}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={view === 'shifts' ? 'primary' : 'outline'}
              onClick={() => setView('shifts')}
            >
              Shifts
            </Button>
            <Button
              variant={view === 'assignments' ? 'primary' : 'outline'}
              onClick={() => setView('assignments')}
            >
              Assignments
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button variant="outline" onClick={fetchShiftData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Shift
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : view === 'shifts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shifts.length === 0 ? (
            <Card className="col-span-full">
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <Clock className="h-12 w-12 mb-2" />
                <p>No shifts scheduled for this date</p>
              </div>
            </Card>
          ) : (
            shifts.map((shift) => (
              <Card key={shift.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getShiftIcon(shift.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                      <p className="text-sm text-gray-500">{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>
                  {getStatusBadge(shift.status)}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Riders Assigned</span>
                    <span className="font-medium">{shift.ridersAssigned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Currently Active</span>
                    <span className="font-medium text-green-600">{shift.ridersActive}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Zones</span>
                    <span className="font-medium">{shift.zones.join(', ')}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => viewShiftDetails(shift)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View Riders
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card padding="none">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Users className="h-12 w-12 mb-2" />
              <p>No shift assignments for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{assignment.riderName}</p>
                          <p className="text-sm text-gray-500">{assignment.riderPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{assignment.shiftName}</td>
                      <td className="px-4 py-3">{getStatusBadge(assignment.status)}</td>
                      <td className="px-4 py-3 text-sm">{assignment.checkIn || '-'}</td>
                      <td className="px-4 py-3 text-sm">{assignment.checkOut || '-'}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm">Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Create Shift Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Shift"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Name
            </label>
            <input
              type="text"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="e.g., Morning Rush"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Zones
            </label>
            <div className="flex flex-wrap gap-2">
              {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => toggleZone(zone)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    shiftZones.includes(zone)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={createShift} loading={saving}>
              Create Shift
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Shift Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Shift Details"
      >
        {selectedShift && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              {getShiftIcon(selectedShift.type)}
              <div>
                <h3 className="text-lg font-semibold">{selectedShift.name}</h3>
                <p className="text-gray-500">{selectedShift.startTime} - {selectedShift.endTime}</p>
              </div>
              {getStatusBadge(selectedShift.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Riders Assigned</p>
                <p className="text-xl font-bold">{selectedShift.ridersAssigned}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currently Active</p>
                <p className="text-xl font-bold text-green-600">{selectedShift.ridersActive}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Coverage Zones</p>
              <div className="flex flex-wrap gap-2">
                {selectedShift.zones.map((zone) => (
                  <Badge key={zone} variant="info" size="sm">{zone}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Assigned Riders</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignments
                  .filter(a => a.shiftName === selectedShift.name)
                  .slice(0, 5)
                  .map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between text-sm">
                      <span>{assignment.riderName}</span>
                      {getStatusBadge(assignment.status)}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" fullWidth onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button fullWidth>
                Manage Riders
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
