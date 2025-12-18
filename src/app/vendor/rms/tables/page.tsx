'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Settings,
  Users,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Move,
  RotateCw,
  Save,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import RMSLayout from '@/components/layout/RMSLayout';
import toast from 'react-hot-toast';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  minCapacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'BLOCKED';
  shape: 'RECTANGLE' | 'SQUARE' | 'CIRCLE' | 'OVAL';
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  floorId: string;
  zoneId?: string;
  currentOrder?: {
    id: string;
    orderNumber: string;
    guestCount: number;
    total: number;
    duration: number;
  };
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

interface Zone {
  id: string;
  name: string;
  color: string;
}

const zones: Zone[] = [
  { id: 'z1', name: 'Window', color: '#3b82f6' },
  { id: 'z2', name: 'Patio', color: '#22c55e' },
  { id: 'z3', name: 'VIP', color: '#a855f7' },
  { id: 'z4', name: 'Bar Area', color: '#f97316' },
];

export default function TablesPage() {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchTablesData();
  }, []);

  const fetchTablesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendor-token');
      const outletId = localStorage.getItem('vendor-outletId');

      if (!token || !outletId) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/tables?outletId=${outletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to fetch tables');
        return;
      }

      // Group tables by floor
      const floorsMap: { [key: string]: Floor } = {};

      result.data.data.forEach((table: any) => {
        const floorId = table.floor?.id || 'default';
        const floorName = table.floor?.name || 'Main Floor';

        if (!floorsMap[floorId]) {
          floorsMap[floorId] = {
            id: floorId,
            name: floorName,
            tables: [],
          };
        }

        floorsMap[floorId].tables.push({
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          minCapacity: table.minCapacity || 1,
          status: table.status,
          shape: table.shape || 'RECTANGLE',
          positionX: table.positionX || 0,
          positionY: table.positionY || 0,
          width: table.width || 100,
          height: table.height || 80,
          rotation: table.rotation || 0,
          floorId: floorId,
          zoneId: table.zone?.id,
        });
      });

      const floorsArray = Object.values(floorsMap);
      setFloors(floorsArray);
      if (floorsArray.length > 0) {
        setSelectedFloor(floorsArray[0]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500 border-green-600';
      case 'OCCUPIED': return 'bg-red-500 border-red-600';
      case 'RESERVED': return 'bg-purple-500 border-purple-600';
      case 'CLEANING': return 'bg-yellow-500 border-yellow-600';
      case 'BLOCKED': return 'bg-gray-500 border-gray-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusBgColor = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100';
      case 'OCCUPIED': return 'bg-red-100';
      case 'RESERVED': return 'bg-purple-100';
      case 'CLEANING': return 'bg-yellow-100';
      case 'BLOCKED': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const stats = selectedFloor ? {
    total: selectedFloor.tables.length,
    available: selectedFloor.tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: selectedFloor.tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: selectedFloor.tables.filter(t => t.status === 'RESERVED').length,
    cleaning: selectedFloor.tables.filter(t => t.status === 'CLEANING').length,
    totalCapacity: selectedFloor.tables.reduce((sum, t) => sum + t.capacity, 0),
    currentGuests: selectedFloor.tables.filter(t => t.currentOrder).reduce((sum, t) => sum + (t.currentOrder?.guestCount || 0), 0),
  } : {
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    cleaning: 0,
    totalCapacity: 0,
    currentGuests: 0,
  };

  const updateTableStatus = async (tableId: string, newStatus: Table['status']) => {
    try {
      const token = localStorage.getItem('vendor-token');

      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to update table status');
        return;
      }

      // Update local state
      setFloors(floors.map(floor => ({
        ...floor,
        tables: floor.tables.map(table =>
          table.id === tableId ? { ...table, status: newStatus } : table
        ),
      })));

      toast.success('Table status updated');
      setShowStatusModal(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error updating table status:', error);
      toast.error('Failed to update table status');
    }
  };

  if (loading) {
    return (
      <RMSLayout title="Floor Plan" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </RMSLayout>
    );
  }

  if (!selectedFloor) {
    return (
      <RMSLayout title="Floor Plan" subtitle="No floors configured">
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <p className="text-lg mb-4">No floors or tables found</p>
          <Button onClick={() => setShowTableModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Table
          </Button>
        </div>
      </RMSLayout>
    );
  }

  return (
    <RMSLayout
      title="Floor Plan"
      subtitle={`${selectedFloor.name} - ${stats.available} tables available`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <><Save className="h-4 w-4 mr-1" /> Save Layout</> : <><Edit2 className="h-4 w-4 mr-1" /> Edit Layout</>}
          </Button>
          <Button size="sm" onClick={() => setShowTableModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Table
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-gray-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Tables</p>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{stats.available}</p>
              <p className="text-sm text-green-600">Available</p>
            </div>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">{stats.occupied}</p>
              <p className="text-sm text-red-600">Occupied</p>
            </div>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{stats.reserved}</p>
              <p className="text-sm text-purple-600">Reserved</p>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.cleaning}</p>
              <p className="text-sm text-yellow-600">Cleaning</p>
            </div>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.totalCapacity}</p>
              <p className="text-sm text-blue-600">Total Capacity</p>
            </div>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{stats.currentGuests}</p>
              <p className="text-sm text-orange-600">Current Guests</p>
            </div>
          </Card>
        </div>

        {/* Floor Tabs */}
        <div className="flex gap-2 border-b">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedFloor.id === floor.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Floor Plan Canvas */}
        <Card padding="none" className="overflow-hidden">
          <div className="relative bg-gray-100 min-h-[500px]" style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {selectedFloor.tables.map((table) => {
              const isCircle = table.shape === 'CIRCLE' || table.shape === 'OVAL';
              return (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    if (!isEditMode) {
                      setShowStatusModal(true);
                    }
                  }}
                  className={`absolute flex flex-col items-center justify-center border-2 transition-all hover:scale-105 ${
                    getStatusColor(table.status)
                  } ${isCircle ? 'rounded-full' : 'rounded-lg'} ${
                    isEditMode ? 'cursor-move' : 'cursor-pointer'
                  } ${selectedTable?.id === table.id ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                  style={{
                    left: table.positionX,
                    top: table.positionY,
                    width: table.width,
                    height: table.height,
                    transform: `rotate(${table.rotation}deg)`,
                  }}
                >
                  <span className="text-white font-bold text-lg">{table.tableNumber}</span>
                  <span className="text-white text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {table.capacity}
                  </span>
                  {table.currentOrder && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded px-2 py-0.5 text-xs shadow whitespace-nowrap">
                      ₹{table.currentOrder.total} • {table.currentOrder.duration}m
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 bg-white border-t flex items-center gap-6 flex-wrap">
            <span className="text-sm text-gray-500 font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-purple-500 rounded" />
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-500 rounded" />
              <span className="text-sm">Blocked</span>
            </div>
          </div>
        </Card>

        {/* Table List View */}
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">All Tables</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Table</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Current Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedFloor.tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{table.tableNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">{table.capacity} seats</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBgColor(table.status)} ${
                        table.status === 'AVAILABLE' ? 'text-green-700' :
                        table.status === 'OCCUPIED' ? 'text-red-700' :
                        table.status === 'RESERVED' ? 'text-purple-700' :
                        table.status === 'CLEANING' ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {table.currentOrder ? (
                        <div>
                          <p className="font-medium text-gray-900">{table.currentOrder.orderNumber}</p>
                          <p className="text-sm text-gray-500">₹{table.currentOrder.total} • {table.currentOrder.guestCount} guests</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {table.currentOrder ? (
                        <span className="text-gray-600">{table.currentOrder.duration} min</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTable(table);
                            setShowStatusModal(true);
                          }}
                        >
                          Change Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedTable(null);
        }}
        title={`Update ${selectedTable?.tableNumber || 'Table'}`}
        size="sm"
      >
        {selectedTable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'BLOCKED'] as Table['status'][]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateTableStatus(selectedTable.id, status)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedTable.status === status
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(status)}`} />
                  <p className="font-medium text-gray-900">{status}</p>
                </button>
              ))}
            </div>
            {selectedTable.currentOrder && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-gray-900">Current Order</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Order: {selectedTable.currentOrder.orderNumber}</p>
                  <p className="text-gray-600">Guests: {selectedTable.currentOrder.guestCount}</p>
                  <p className="text-gray-600">Total: ₹{selectedTable.currentOrder.total}</p>
                  <p className="text-gray-600">Duration: {selectedTable.currentOrder.duration} min</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Table Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        title="Add New Table"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
              <input type="text" className="w-full border rounded-lg p-2" placeholder="e.g., T-09" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" className="w-full border rounded-lg p-2" placeholder="e.g., 4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
              <select className="w-full border rounded-lg p-2">
                <option value="RECTANGLE">Rectangle</option>
                <option value="SQUARE">Square</option>
                <option value="CIRCLE">Circle</option>
                <option value="OVAL">Oval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <select className="w-full border rounded-lg p-2">
                <option value="">No Zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowTableModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Add Table</Button>
          </div>
        </div>
      </Modal>
    </RMSLayout>
  );
}
