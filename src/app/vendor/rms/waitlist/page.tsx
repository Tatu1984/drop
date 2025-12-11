'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Clock,
  Phone,
  MessageSquare,
  Check,
  X,
  Bell,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Timer,
  UserPlus,
  Armchair,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface WaitlistEntry {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  estimatedWait: number;
  actualWait: number;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'NO_SHOW' | 'CANCELLED';
  notes?: string;
  preferences?: string[];
  createdAt: Date;
  notifiedAt?: Date;
  seatedAt?: Date;
  tablePreference?: string;
}

const mockWaitlist: WaitlistEntry[] = [
  {
    id: '1',
    guestName: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    partySize: 4,
    estimatedWait: 15,
    actualWait: 12,
    status: 'WAITING',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    preferences: ['Window seat', 'Quiet area'],
    tablePreference: 'Any',
  },
  {
    id: '2',
    guestName: 'Priya Patel',
    phone: '+91 98765 43211',
    partySize: 2,
    estimatedWait: 10,
    actualWait: 18,
    status: 'NOTIFIED',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    notifiedAt: new Date(Date.now() - 3 * 60 * 1000),
    notes: 'Anniversary celebration',
  },
  {
    id: '3',
    guestName: 'Amit Kumar',
    phone: '+91 98765 43212',
    partySize: 6,
    estimatedWait: 25,
    actualWait: 8,
    status: 'WAITING',
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    tablePreference: 'Private dining',
  },
  {
    id: '4',
    guestName: 'Sneha Gupta',
    phone: '+91 98765 43213',
    partySize: 3,
    estimatedWait: 20,
    actualWait: 35,
    status: 'SEATED',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    seatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: '5',
    guestName: 'Vikram Singh',
    phone: '+91 98765 43214',
    partySize: 2,
    estimatedWait: 15,
    actualWait: 22,
    status: 'NO_SHOW',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    notifiedAt: new Date(Date.now() - 38 * 60 * 1000),
  },
];

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    guestName: '',
    phone: '',
    partySize: 2,
    notes: '',
    tablePreference: 'Any',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWaitTime = (createdAt: Date) => {
    const diff = currentTime.getTime() - createdAt.getTime();
    return Math.floor(diff / 60000);
  };

  const getStatusColor = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'WAITING': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'NOTIFIED': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'SEATED': return 'bg-green-100 text-green-700 border-green-300';
      case 'NO_SHOW': return 'bg-red-100 text-red-700 border-red-300';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const updateStatus = (id: string, newStatus: WaitlistEntry['status']) => {
    setWaitlist(waitlist.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          status: newStatus,
          ...(newStatus === 'NOTIFIED' ? { notifiedAt: new Date() } : {}),
          ...(newStatus === 'SEATED' ? { seatedAt: new Date() } : {}),
        };
      }
      return entry;
    }));
  };

  const moveInQueue = (id: string, direction: 'up' | 'down') => {
    const waitingList = waitlist.filter(e => e.status === 'WAITING');
    const idx = waitingList.findIndex(e => e.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === waitingList.length - 1)) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newWaitingList = [...waitingList];
    [newWaitingList[idx], newWaitingList[newIdx]] = [newWaitingList[newIdx], newWaitingList[idx]];

    const otherEntries = waitlist.filter(e => e.status !== 'WAITING');
    setWaitlist([...newWaitingList, ...otherEntries]);
  };

  const addToWaitlist = () => {
    if (!newEntry.guestName || !newEntry.phone) return;

    const entry: WaitlistEntry = {
      id: Date.now().toString(),
      guestName: newEntry.guestName,
      phone: newEntry.phone,
      partySize: newEntry.partySize,
      estimatedWait: Math.max(10, waitlist.filter(e => e.status === 'WAITING').length * 10),
      actualWait: 0,
      status: 'WAITING',
      notes: newEntry.notes || undefined,
      tablePreference: newEntry.tablePreference,
      createdAt: new Date(),
    };

    setWaitlist([...waitlist, entry]);
    setNewEntry({ guestName: '', phone: '', partySize: 2, notes: '', tablePreference: 'Any' });
    setShowAddModal(false);
  };

  const waitingEntries = waitlist.filter(e => e.status === 'WAITING');
  const notifiedEntries = waitlist.filter(e => e.status === 'NOTIFIED');
  const seatedToday = waitlist.filter(e => e.status === 'SEATED').length;
  const noShowToday = waitlist.filter(e => e.status === 'NO_SHOW').length;
  const avgWaitTime = waitingEntries.length > 0
    ? Math.round(waitingEntries.reduce((sum, e) => sum + getWaitTime(e.createdAt), 0) / waitingEntries.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
          <p className="text-gray-600">Manage walk-in guests waiting for tables</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg font-mono text-gray-700">
            {currentTime.toLocaleTimeString()}
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <UserPlus className="h-4 w-4" />
            Add to Waitlist
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Currently Waiting</p>
              <p className="text-3xl font-bold text-yellow-700">{waitingEntries.length}</p>
            </div>
            <Users className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Notified (Ready)</p>
              <p className="text-3xl font-bold text-blue-700">{notifiedEntries.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Seated Today</p>
              <p className="text-3xl font-bold text-green-700">{seatedToday}</p>
            </div>
            <Armchair className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Avg Wait Time</p>
              <p className="text-3xl font-bold text-orange-700">{avgWaitTime} min</p>
            </div>
            <Timer className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Waitlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Queue */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Waiting Queue ({waitingEntries.length})
            </h2>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {waitingEntries.map((entry, idx) => {
              const waitTime = getWaitTime(entry.createdAt);
              const isOverdue = waitTime > entry.estimatedWait;
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl p-4 border-2 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => moveInQueue(entry.id, 'up')}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          disabled={idx === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                        <button
                          onClick={() => moveInQueue(entry.id, 'down')}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          disabled={idx === waitingEntries.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{entry.guestName}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.phone}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600">
                            <Users className="h-3 w-3 inline mr-1" />
                            {entry.partySize} guests
                          </span>
                          {entry.tablePreference && entry.tablePreference !== 'Any' && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {entry.tablePreference}
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-orange-600 mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {waitTime} min
                      </div>
                      <p className="text-xs text-gray-500">Est: {entry.estimatedWait} min</p>
                      {isOverdue && (
                        <span className="text-xs text-red-600 flex items-center gap-1 justify-end mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(entry.id, 'NOTIFIED')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Notify
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(entry.id, 'SEATED')}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <Armchair className="h-3 w-3 mr-1" />
                      Seat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(entry.id, 'CANCELLED')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {waitingEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No guests waiting</p>
              </div>
            )}
          </div>
        </div>

        {/* Notified & Recent Activity */}
        <div className="space-y-6">
          {/* Notified */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notified - Ready to Seat ({notifiedEntries.length})
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
              {notifiedEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.guestName}</h3>
                    <p className="text-sm text-gray-600">
                      {entry.partySize} guests • Notified {entry.notifiedAt ? Math.floor((currentTime.getTime() - entry.notifiedAt.getTime()) / 60000) : 0} min ago
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(entry.id, 'SEATED')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Seat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(entry.id, 'NO_SHOW')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      No Show
                    </Button>
                  </div>
                </div>
              ))}
              {notifiedEntries.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No guests notified</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-2 max-h-[250px] overflow-y-auto">
              {waitlist
                .filter(e => e.status === 'SEATED' || e.status === 'NO_SHOW' || e.status === 'CANCELLED')
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className={`flex items-center justify-between p-2 rounded-lg ${getStatusColor(entry.status)}`}>
                    <div>
                      <span className="font-medium">{entry.guestName}</span>
                      <span className="text-sm ml-2">({entry.partySize} guests)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-medium">{entry.status.replace('_', ' ')}</span>
                      {entry.status === 'SEATED' && (
                        <span className="text-xs">Wait: {entry.actualWait} min</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Today&apos;s Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Parties</p>
                <p className="text-xl font-bold text-gray-900">{waitlist.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Guests</p>
                <p className="text-xl font-bold text-gray-900">
                  {waitlist.reduce((sum, e) => sum + e.partySize, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No Shows</p>
                <p className="text-xl font-bold text-red-600">{noShowToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {waitlist.length > 0 ? Math.round((seatedToday / waitlist.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Waitlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add to Waitlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  value={newEntry.guestName}
                  onChange={(e) => setNewEntry({ ...newEntry, guestName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newEntry.phone}
                  onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((size) => (
                    <button
                      key={size}
                      onClick={() => setNewEntry({ ...newEntry, partySize: size })}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        newEntry.partySize === size
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    onClick={() => setNewEntry({ ...newEntry, partySize: Math.min(20, newEntry.partySize + 1) })}
                    className={`px-4 h-10 rounded-lg font-medium ${
                      newEntry.partySize > 6
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {newEntry.partySize > 6 ? newEntry.partySize : '6+'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Preference</label>
                <select
                  value={newEntry.tablePreference}
                  onChange={(e) => setNewEntry({ ...newEntry, tablePreference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Any">Any Available</option>
                  <option value="Window">Window Seat</option>
                  <option value="Quiet">Quiet Area</option>
                  <option value="Outdoor">Outdoor/Patio</option>
                  <option value="Private">Private Dining</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Special occasion, allergies, etc."
                />
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm text-orange-700">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Estimated wait: ~{Math.max(10, waitingEntries.length * 10)} minutes
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addToWaitlist}
                disabled={!newEntry.guestName || !newEntry.phone}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Add to Waitlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
