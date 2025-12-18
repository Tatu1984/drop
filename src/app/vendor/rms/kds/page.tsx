'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  AlertTriangle,
  RefreshCw,
  Volume2,
  VolumeX,
  ChevronDown,
  Flame,
  Timer,
  ChefHat,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
  status: 'PENDING' | 'COOKING' | 'DONE';
}

interface KDSTicket {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: KDSItem[];
  status: 'NEW' | 'IN_PROGRESS' | 'READY';
  createdAt: Date;
  isRush: boolean;
  courseNumber: number;
  specialInstructions?: string;
}

const stations = [
  { id: 'all', name: 'All Stations', color: 'bg-gray-500' },
  { id: 'hot', name: 'Hot Kitchen', color: 'bg-red-500' },
  { id: 'cold', name: 'Cold Kitchen', color: 'bg-blue-500' },
  { id: 'grill', name: 'Grill', color: 'bg-orange-500' },
  { id: 'bar', name: 'Bar', color: 'bg-purple-500' },
];

export default function KDSPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTickets();
    // Poll for new tickets every 10 seconds
    const pollInterval = setInterval(fetchTickets, 10000);
    return () => clearInterval(pollInterval);
  }, [selectedStation]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('vendor-token');
      const stationId = localStorage.getItem('vendor-kds-stationId');

      if (!token || !stationId) {
        toast.error('KDS station not configured');
        return;
      }

      const response = await fetch(`/api/rms/kds/tickets?stationId=${stationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to fetch tickets');
        return;
      }

      // Map API response to local KDSTicket interface
      const mappedTickets: KDSTicket[] = result.data.map((ticket: any) => ({
        id: ticket.id,
        orderNumber: ticket.orderNumber,
        tableNumber: ticket.tableNumber || 'TAKEAWAY',
        orderType: ticket.orderType,
        status: ticket.status,
        createdAt: new Date(ticket.createdAt),
        isRush: ticket.isRush || false,
        courseNumber: ticket.courseNumber || 1,
        specialInstructions: ticket.specialInstructions,
        items: ticket.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          modifiers: item.modifiers ? JSON.parse(item.modifiers) : undefined,
          notes: item.specialInstructions,
          status: item.status || 'PENDING',
        })),
      }));

      setTickets(mappedTickets);
    } catch (error) {
      console.error('Error fetching KDS tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getTicketAge = (createdAt: Date) => {
    const diff = currentTime.getTime() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { minutes, seconds, total: diff };
  };

  const getTimeColor = (minutes: number) => {
    if (minutes >= 15) return 'text-red-500 bg-red-100';
    if (minutes >= 10) return 'text-orange-500 bg-orange-100';
    if (minutes >= 5) return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  const getStatusColor = (status: KDSTicket['status']) => {
    switch (status) {
      case 'NEW': return 'border-blue-500 bg-blue-50';
      case 'IN_PROGRESS': return 'border-yellow-500 bg-yellow-50';
      case 'READY': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getItemStatusColor = (status: KDSItem['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-700';
      case 'COOKING': return 'bg-yellow-100 text-yellow-700';
      case 'DONE': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: KDSTicket['status']) => {
    try {
      const token = localStorage.getItem('vendor-token');

      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/kds/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to update ticket status');
        return;
      }

      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return { ...ticket, status: newStatus };
        }
        return ticket;
      }));
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const updateItemStatus = async (ticketId: string, itemId: string, newStatus: KDSItem['status']) => {
    try {
      const token = localStorage.getItem('vendor-token');

      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/kds/tickets/${ticketId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to update item status');
        return;
      }

      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          const updatedItems = ticket.items.map(item => {
            if (item.id === itemId) {
              return { ...item, status: newStatus };
            }
            return item;
          });
          // Check if all items are done
          const allDone = updatedItems.every(item => item.status === 'DONE');
          return {
            ...ticket,
            items: updatedItems,
            status: allDone ? 'READY' : ticket.status === 'NEW' ? 'IN_PROGRESS' : ticket.status
          };
        }
        return ticket;
      }));
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const bumpTicket = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('vendor-token');

      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/kds/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to bump ticket');
        return;
      }

      // Remove from local state
      setTickets(tickets.filter(t => t.id !== ticketId));
      toast.success('Ticket bumped');
    } catch (error) {
      console.error('Error bumping ticket:', error);
      toast.error('Failed to bump ticket');
    }
  };

  const newTickets = tickets.filter(t => t.status === 'NEW');
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const readyTickets = tickets.filter(t => t.status === 'READY');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold">Kitchen Display</h1>
            </div>
            <div className="flex items-center gap-2">
              {stations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStation === station.id
                      ? `${station.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button onClick={fetchTickets} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-6 text-sm border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>New: {newTickets.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>In Progress: {inProgressTickets.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Ready: {readyTickets.length}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span>{tickets.filter(t => getTicketAge(t.createdAt).minutes >= 10).length} tickets over 10 min</span>
        </div>
      </div>

      {/* KDS Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => {
            const age = getTicketAge(ticket.createdAt);
            return (
              <div
                key={ticket.id}
                className={`rounded-xl border-2 overflow-hidden ${getStatusColor(ticket.status)} ${
                  ticket.isRush ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''
                }`}
              >
                {/* Ticket Header */}
                <div className={`p-3 border-b ${
                  ticket.status === 'NEW' ? 'bg-blue-500' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                  'bg-green-500'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{ticket.tableNumber}</span>
                      {ticket.isRush && (
                        <span className="bg-red-600 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                          RUSH
                        </span>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-sm font-mono ${getTimeColor(age.minutes)}`}>
                      <Timer className="h-4 w-4 inline mr-1" />
                      {age.minutes}:{age.seconds.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-sm opacity-90">
                    <span>{ticket.orderNumber}</span>
                    <span className="uppercase">{ticket.orderType.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Special Instructions */}
                {ticket.specialInstructions && (
                  <div className="bg-red-100 border-b border-red-200 px-3 py-2 text-red-700 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {ticket.specialInstructions}
                  </div>
                )}

                {/* Items */}
                <div className="p-3 space-y-2 bg-white">
                  {ticket.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{item.quantity}×</span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-sm text-orange-600 ml-6">
                            {item.modifiers.join(', ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-red-600 ml-6 font-medium">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const nextStatus = item.status === 'PENDING' ? 'COOKING' :
                                           item.status === 'COOKING' ? 'DONE' : 'DONE';
                          updateItemStatus(ticket.id, item.id, nextStatus);
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${getItemStatusColor(item.status)}`}
                      >
                        {item.status === 'PENDING' && 'Start'}
                        {item.status === 'COOKING' && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 animate-pulse" />
                            Cooking
                          </span>
                        )}
                        {item.status === 'DONE' && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Done
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ticket Actions */}
                <div className="p-3 bg-gray-100 border-t flex gap-2">
                  {ticket.status === 'NEW' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600"
                    >
                      Start All
                    </button>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'READY')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                    >
                      Mark Ready
                    </button>
                  )}
                  {ticket.status === 'READY' && (
                    <button
                      onClick={() => bumpTicket(ticket.id)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
                    >
                      Bump / Served
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400">
                    Recall
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <ChefHat className="h-16 w-16 mb-4" />
            <p className="text-xl font-medium">No orders in queue</p>
            <p className="text-sm">New orders will appear here automatically</p>
          </div>
        )}
      </div>
    </div>
  );
}
