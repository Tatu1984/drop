'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  Users,
  Calculator,
  Plus,
  AlertTriangle,
  Check,
  X,
  Printer,
  Download,
  RefreshCw,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface Shift {
  id: string;
  shiftNumber: string;
  startedBy: string;
  startTime: Date;
  endTime?: Date;
  status: 'OPEN' | 'CLOSED';
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  cashDifference?: number;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  tips: number;
  discounts: number;
  refunds: number;
  cashDrops: CashDrop[];
}

interface CashDrop {
  id: string;
  amount: number;
  time: Date;
  reason: string;
  droppedBy: string;
}

interface ShiftSummary {
  paymentMethod: string;
  amount: number;
  transactions: number;
  icon: React.ReactNode;
  color: string;
}

const mockCurrentShift: Shift = {
  id: '1',
  shiftNumber: 'SH-2024-0115',
  startedBy: 'Rahul Kumar',
  startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
  status: 'OPEN',
  openingCash: 5000,
  totalSales: 45680,
  totalOrders: 42,
  cashSales: 12500,
  cardSales: 18200,
  upiSales: 14980,
  tips: 2850,
  discounts: 1200,
  refunds: 500,
  cashDrops: [
    { id: '1', amount: 5000, time: new Date(Date.now() - 3 * 60 * 60 * 1000), reason: 'Safe deposit', droppedBy: 'Rahul Kumar' },
  ],
};

const mockPastShifts: Shift[] = [
  {
    id: '2',
    shiftNumber: 'SH-2024-0114',
    startedBy: 'Priya Sharma',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 14 * 60 * 60 * 1000),
    status: 'CLOSED',
    openingCash: 5000,
    closingCash: 14200,
    expectedCash: 14500,
    cashDifference: -300,
    totalSales: 52400,
    totalOrders: 58,
    cashSales: 14500,
    cardSales: 21800,
    upiSales: 16100,
    tips: 3200,
    discounts: 800,
    refunds: 200,
    cashDrops: [
      { id: '1', amount: 5000, time: new Date(Date.now() - 20 * 60 * 60 * 1000), reason: 'Safe deposit', droppedBy: 'Priya Sharma' },
    ],
  },
  {
    id: '3',
    shiftNumber: 'SH-2024-0113',
    startedBy: 'Amit Verma',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 38 * 60 * 60 * 1000),
    status: 'CLOSED',
    openingCash: 5000,
    closingCash: 16800,
    expectedCash: 16800,
    cashDifference: 0,
    totalSales: 48900,
    totalOrders: 45,
    cashSales: 16800,
    cardSales: 19200,
    upiSales: 12900,
    tips: 2900,
    discounts: 1500,
    refunds: 0,
    cashDrops: [],
  },
];

export default function ShiftsPage() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(mockCurrentShift);
  const [pastShifts] = useState<Shift[]>(mockPastShifts);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStartShiftModal, setShowStartShiftModal] = useState(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [showCashDropModal, setShowCashDropModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('5000');
  const [closingCash, setClosingCash] = useState('');
  const [cashDropAmount, setCashDropAmount] = useState('');
  const [cashDropReason, setCashDropReason] = useState('Safe deposit');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getShiftDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || currentTime;
    const diff = end.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateExpectedCash = () => {
    if (!currentShift) return 0;
    const totalCashDrops = currentShift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0);
    return currentShift.openingCash + currentShift.cashSales - totalCashDrops;
  };

  const handleStartShift = () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      shiftNumber: `SH-2024-${String(Date.now()).slice(-4)}`,
      startedBy: 'Current User',
      startTime: new Date(),
      status: 'OPEN',
      openingCash: parseFloat(openingCash) || 5000,
      totalSales: 0,
      totalOrders: 0,
      cashSales: 0,
      cardSales: 0,
      upiSales: 0,
      tips: 0,
      discounts: 0,
      refunds: 0,
      cashDrops: [],
    };
    setCurrentShift(newShift);
    setShowStartShiftModal(false);
  };

  const handleEndShift = () => {
    if (!currentShift) return;
    const closingAmount = parseFloat(closingCash) || 0;
    const expectedCash = calculateExpectedCash();
    setCurrentShift({
      ...currentShift,
      status: 'CLOSED',
      endTime: new Date(),
      closingCash: closingAmount,
      expectedCash,
      cashDifference: closingAmount - expectedCash,
    });
    setShowEndShiftModal(false);
  };

  const handleCashDrop = () => {
    if (!currentShift) return;
    const amount = parseFloat(cashDropAmount) || 0;
    if (amount <= 0) return;

    const newDrop: CashDrop = {
      id: Date.now().toString(),
      amount,
      time: new Date(),
      reason: cashDropReason,
      droppedBy: 'Current User',
    };

    setCurrentShift({
      ...currentShift,
      cashDrops: [...currentShift.cashDrops, newDrop],
    });
    setCashDropAmount('');
    setShowCashDropModal(false);
  };

  const paymentSummary: ShiftSummary[] = currentShift ? [
    { paymentMethod: 'Cash', amount: currentShift.cashSales, transactions: 15, icon: <Banknote className="h-5 w-5" />, color: 'bg-green-100 text-green-600' },
    { paymentMethod: 'Card', amount: currentShift.cardSales, transactions: 18, icon: <CreditCard className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
    { paymentMethod: 'UPI', amount: currentShift.upiSales, transactions: 9, icon: <Smartphone className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600">Manage daily shifts and cash reconciliation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg font-mono text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            {currentTime.toLocaleTimeString()}
          </div>
          {currentShift?.status === 'OPEN' ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCashDropModal(true)}
                className="flex items-center gap-2"
              >
                <ArrowDownRight className="h-4 w-4" />
                Cash Drop
              </Button>
              <Button
                onClick={() => setShowEndShiftModal(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
              >
                <Lock className="h-4 w-4" />
                End Shift
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowStartShiftModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <Unlock className="h-4 w-4" />
              Start Shift
            </Button>
          )}
        </div>
      </div>

      {/* Current Shift */}
      {currentShift && currentShift.status === 'OPEN' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-green-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <h2 className="text-lg font-bold">Current Shift Active</h2>
                </div>
                <p className="text-green-100 mt-1">{currentShift.shiftNumber} • Started by {currentShift.startedBy}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{getShiftDuration(currentShift.startTime)}</p>
                <p className="text-green-100">Started at {currentShift.startTime.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{currentShift.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{currentShift.totalOrders}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Tips Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{currentShift.tips.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{currentShift.totalOrders > 0 ? Math.round(currentShift.totalSales / currentShift.totalOrders).toLocaleString() : 0}
                </p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <h3 className="font-medium text-gray-900 mb-3">Payment Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {paymentSummary.map((payment) => (
                <div key={payment.paymentMethod} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${payment.color}`}>
                      {payment.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                      <p className="text-xl font-bold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{payment.transactions} transactions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cash Management */}
            <h3 className="font-medium text-gray-900 mb-3">Cash Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600">Opening Cash</p>
                <p className="text-xl font-bold text-blue-700">₹{currentShift.openingCash.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600">Cash Sales</p>
                <p className="text-xl font-bold text-green-700">+₹{currentShift.cashSales.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-orange-600">Cash Drops</p>
                <p className="text-xl font-bold text-orange-700">
                  -₹{currentShift.cashDrops.reduce((s, d) => s + d.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-purple-600">Expected in Drawer</p>
                <p className="text-xl font-bold text-purple-700">₹{calculateExpectedCash().toLocaleString()}</p>
              </div>
            </div>

            {/* Cash Drops History */}
            {currentShift.cashDrops.length > 0 && (
              <>
                <h3 className="font-medium text-gray-900 mb-3">Cash Drops</h3>
                <div className="space-y-2 mb-6">
                  {currentShift.cashDrops.map((drop) => (
                    <div key={drop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ArrowDownRight className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-gray-900">₹{drop.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{drop.reason} • {drop.droppedBy}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{drop.time.toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Deductions */}
            <h3 className="font-medium text-gray-900 mb-3">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-700">Discounts Given</span>
                <span className="font-bold text-yellow-700">₹{currentShift.discounts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-700">Refunds</span>
                <span className="font-bold text-red-700">₹{currentShift.refunds.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Active Shift */}
      {(!currentShift || currentShift.status === 'CLOSED') && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Shift</h2>
          <p className="text-gray-600 mb-6">Start a new shift to begin accepting orders and tracking sales.</p>
          <Button
            onClick={() => setShowStartShiftModal(true)}
            className="bg-green-500 hover:bg-green-600"
          >
            <Unlock className="h-4 w-4 mr-2" />
            Start New Shift
          </Button>
        </div>
      )}

      {/* Past Shifts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Past Shifts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cash Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{shift.shiftNumber}</p>
                    <p className="text-xs text-gray-500">{shift.startTime.toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{shift.startedBy}</td>
                  <td className="px-4 py-4 text-gray-600">{getShiftDuration(shift.startTime, shift.endTime)}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">₹{shift.totalSales.toLocaleString()}</td>
                  <td className="px-4 py-4 text-gray-600">{shift.totalOrders}</td>
                  <td className="px-4 py-4 text-gray-900">₹{shift.closingCash?.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (shift.cashDifference || 0) === 0
                        ? 'bg-green-100 text-green-700'
                        : (shift.cashDifference || 0) > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(shift.cashDifference || 0) >= 0 ? '+' : ''}₹{shift.cashDifference?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Printer className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Start New Shift</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Cash (₹)</label>
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="5000"
                />
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  <Check className="h-4 w-4 inline mr-1" />
                  Count and verify the cash in the drawer before starting the shift.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowStartShiftModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartShift}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Start Shift
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">End Shift</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-2">Expected Cash in Drawer:</p>
                <p className="text-2xl font-bold text-blue-700">₹{calculateExpectedCash().toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Closing Cash (₹)</label>
                <input
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder={calculateExpectedCash().toString()}
                />
              </div>
              {closingCash && (
                <div className={`rounded-lg p-4 ${
                  parseFloat(closingCash) === calculateExpectedCash()
                    ? 'bg-green-50'
                    : parseFloat(closingCash) > calculateExpectedCash()
                    ? 'bg-blue-50'
                    : 'bg-red-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    parseFloat(closingCash) === calculateExpectedCash()
                      ? 'text-green-700'
                      : parseFloat(closingCash) > calculateExpectedCash()
                      ? 'text-blue-700'
                      : 'text-red-700'
                  }`}>
                    {parseFloat(closingCash) === calculateExpectedCash()
                      ? '✓ Cash matches expected amount'
                      : parseFloat(closingCash) > calculateExpectedCash()
                      ? `+₹${(parseFloat(closingCash) - calculateExpectedCash()).toLocaleString()} overage`
                      : `-₹${(calculateExpectedCash() - parseFloat(closingCash)).toLocaleString()} shortage`
                    }
                  </p>
                </div>
              )}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  This will close the current shift. Make sure all orders are settled.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEndShiftModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndShift}
                disabled={!closingCash}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                End Shift
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Drop Modal */}
      {showCashDropModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cash Drop</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={cashDropAmount}
                  onChange={(e) => setCashDropAmount(e.target.value)}
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={cashDropReason}
                  onChange={(e) => setCashDropReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Safe deposit">Safe Deposit</option>
                  <option value="Bank deposit">Bank Deposit</option>
                  <option value="Petty cash">Petty Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  <ArrowDownRight className="h-4 w-4 inline mr-1" />
                  This will reduce the expected cash in the drawer.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCashDropModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCashDrop}
                disabled={!cashDropAmount || parseFloat(cashDropAmount) <= 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Record Drop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
