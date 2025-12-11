'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Award,
  AlertCircle,
  CheckCircle,
  Timer,
  Wallet,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  joinDate: Date;
  hourlyRate: number;
  totalHours: number;
  avatar?: string;
  skills: string[];
  isClockedIn: boolean;
  clockInTime?: Date;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  role: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'LATE';
}

interface TimeEntry {
  id: string;
  employeeName: string;
  date: Date;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  overtime: number;
  status: 'PENDING' | 'APPROVED' | 'DISPUTED';
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    role: 'Head Chef',
    department: 'Kitchen',
    phone: '+91 98765 43210',
    email: 'rahul@restaurant.com',
    status: 'ACTIVE',
    joinDate: new Date('2022-03-15'),
    hourlyRate: 350,
    totalHours: 168,
    skills: ['Indian Cuisine', 'Tandoor', 'Continental'],
    isClockedIn: true,
    clockInTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'Server',
    department: 'Front of House',
    phone: '+91 98765 43211',
    email: 'priya@restaurant.com',
    status: 'ACTIVE',
    joinDate: new Date('2023-01-10'),
    hourlyRate: 180,
    totalHours: 145,
    skills: ['Customer Service', 'POS', 'Wine Knowledge'],
    isClockedIn: true,
    clockInTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Amit Patel',
    role: 'Sous Chef',
    department: 'Kitchen',
    phone: '+91 98765 43212',
    email: 'amit@restaurant.com',
    status: 'ACTIVE',
    joinDate: new Date('2022-08-20'),
    hourlyRate: 280,
    totalHours: 156,
    skills: ['Prep Work', 'Sauces', 'Plating'],
    isClockedIn: false,
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    role: 'Hostess',
    department: 'Front of House',
    phone: '+91 98765 43213',
    email: 'sneha@restaurant.com',
    status: 'ON_LEAVE',
    joinDate: new Date('2023-06-01'),
    hourlyRate: 150,
    totalHours: 120,
    skills: ['Reservations', 'Guest Relations'],
    isClockedIn: false,
  },
  {
    id: '5',
    name: 'Ravi Singh',
    role: 'Bartender',
    department: 'Bar',
    phone: '+91 98765 43214',
    email: 'ravi@restaurant.com',
    status: 'ACTIVE',
    joinDate: new Date('2022-11-15'),
    hourlyRate: 220,
    totalHours: 140,
    skills: ['Mixology', 'Inventory', 'Customer Service'],
    isClockedIn: true,
    clockInTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
];

const mockShifts: Shift[] = [
  { id: '1', employeeId: '1', employeeName: 'Rahul Kumar', date: new Date(), startTime: '10:00', endTime: '18:00', role: 'Head Chef', status: 'IN_PROGRESS' },
  { id: '2', employeeId: '2', employeeName: 'Priya Sharma', date: new Date(), startTime: '11:00', endTime: '19:00', role: 'Server', status: 'IN_PROGRESS' },
  { id: '3', employeeId: '5', employeeName: 'Ravi Singh', date: new Date(), startTime: '16:00', endTime: '24:00', role: 'Bartender', status: 'SCHEDULED' },
  { id: '4', employeeId: '3', employeeName: 'Amit Patel', date: new Date(), startTime: '14:00', endTime: '22:00', role: 'Sous Chef', status: 'SCHEDULED' },
];

const mockTimeEntries: TimeEntry[] = [
  { id: '1', employeeName: 'Rahul Kumar', date: new Date(Date.now() - 86400000), clockIn: '10:05', clockOut: '18:15', hoursWorked: 8.17, overtime: 0.17, status: 'APPROVED' },
  { id: '2', employeeName: 'Priya Sharma', date: new Date(Date.now() - 86400000), clockIn: '10:58', clockOut: '19:30', hoursWorked: 8.53, overtime: 0.53, status: 'PENDING' },
  { id: '3', employeeName: 'Amit Patel', date: new Date(Date.now() - 86400000), clockIn: '14:00', clockOut: '22:00', hoursWorked: 8, overtime: 0, status: 'APPROVED' },
  { id: '4', employeeName: 'Ravi Singh', date: new Date(Date.now() - 86400000), clockIn: '16:10', clockOut: '00:05', hoursWorked: 7.92, overtime: 0, status: 'DISPUTED' },
];

const departments = ['All', 'Kitchen', 'Front of House', 'Bar', 'Management'];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'schedule' | 'timesheets' | 'tips'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">On Leave</span>;
      case 'INACTIVE':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactive</span>;
    }
  };

  const getShiftStatusBadge = (status: Shift['status']) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      ABSENT: 'bg-red-100 text-red-700',
      LATE: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status.replace('_', ' ')}</span>;
  };

  const getTimeStatusBadge = (status: TimeEntry['status']) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      DISPUTED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const activeCount = mockEmployees.filter(e => e.status === 'ACTIVE').length;
  const clockedInCount = mockEmployees.filter(e => e.isClockedIn).length;
  const onLeaveCount = mockEmployees.filter(e => e.status === 'ON_LEAVE').length;
  const totalHoursToday = mockShifts.reduce((sum, s) => sum + 8, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage employees, schedules, and timesheets</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Clock In/Out
          </Button>
          <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{mockEmployees.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clocked In Now</p>
              <p className="text-2xl font-bold text-green-600">{clockedInCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{onLeaveCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <UserX className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours Today</p>
              <p className="text-2xl font-bold text-gray-900">{totalHoursToday}h</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'staff', label: 'Staff Directory', icon: Users },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'timesheets', label: 'Timesheets', icon: Clock },
              { id: 'tips', label: 'Tips & Payroll', icon: Wallet },
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

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        employee.isClockedIn ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.role}</p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Department</span>
                      <span className="text-gray-900">{employee.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      {getStatusBadge(employee.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Hours (MTD)</span>
                      <span className="text-gray-900">{employee.totalHours}h</span>
                    </div>
                    {employee.isClockedIn && employee.clockInTime && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">
                          Clocked in at {employee.clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="font-medium text-gray-900">
                  {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Shift
              </Button>
            </div>

            {/* Schedule Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 w-48">Employee</th>
                    {weekDays.map((day, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-center text-xs font-medium uppercase bg-gray-50 ${
                          day.toDateString() === new Date().toDateString() ? 'text-orange-600 bg-orange-50' : 'text-gray-500'
                        }`}
                      >
                        <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-bold">{day.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockEmployees.filter(e => e.status === 'ACTIVE').map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-white">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.role}</p>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((day, idx) => {
                        const shift = mockShifts.find(s => s.employeeId === employee.id && s.date.toDateString() === day.toDateString());
                        return (
                          <td key={idx} className="px-2 py-2 text-center">
                            {shift ? (
                              <div className={`px-2 py-1 rounded text-xs ${
                                shift.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                                shift.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {shift.startTime} - {shift.endTime}
                              </div>
                            ) : (
                              <button className="w-full py-1 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:border-orange-500 hover:text-orange-500">
                                + Add
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Today's Shifts */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Today&apos;s Shifts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {mockShifts.map((shift) => (
                  <div key={shift.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{shift.employeeName}</span>
                      {getShiftStatusBadge(shift.status)}
                    </div>
                    <p className="text-sm text-gray-600">{shift.role}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timesheets Tab */}
        {activeTab === 'timesheets' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Time Entries</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline">Export</Button>
                <Button className="bg-green-500 hover:bg-green-600">Approve All</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockTimeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{entry.employeeName}</td>
                      <td className="px-4 py-4 text-gray-600">{entry.date.toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-gray-600">{entry.clockIn}</td>
                      <td className="px-4 py-4 text-gray-600">{entry.clockOut}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{entry.hoursWorked}h</td>
                      <td className="px-4 py-4">
                        {entry.overtime > 0 ? (
                          <span className="text-orange-600 font-medium">+{entry.overtime}h</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{getTimeStatusBadge(entry.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {entry.status === 'PENDING' && (
                            <>
                              <button className="p-1 hover:bg-green-100 rounded text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="p-1 hover:bg-red-100 rounded text-red-600">
                                <AlertCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                            <Edit className="h-4 w-4" />
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

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Tips & Payroll Summary</h3>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>This Pay Period</option>
                  <option>Last Pay Period</option>
                  <option>This Month</option>
                </select>
                <Button variant="outline">Export</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600">Total Tips Collected</p>
                <p className="text-2xl font-bold text-green-700">₹24,850</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600">Total Hours Worked</p>
                <p className="text-2xl font-bold text-blue-700">729h</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-purple-600">Payroll Total</p>
                <p className="text-2xl font-bold text-purple-700">₹1,45,800</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tips</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockEmployees.filter(e => e.status === 'ACTIVE').map((employee) => {
                    const basePay = employee.hourlyRate * employee.totalHours;
                    const tips = Math.floor(Math.random() * 5000) + 2000;
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-gray-900">{employee.name}</td>
                        <td className="px-4 py-4 text-gray-600">{employee.role}</td>
                        <td className="px-4 py-4 text-gray-900">{employee.totalHours}h</td>
                        <td className="px-4 py-4 text-orange-600">+{Math.floor(employee.totalHours * 0.05)}h</td>
                        <td className="px-4 py-4 text-gray-900">₹{basePay.toLocaleString()}</td>
                        <td className="px-4 py-4 text-green-600">₹{tips.toLocaleString()}</td>
                        <td className="px-4 py-4 font-bold text-gray-900">₹{(basePay + tips).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
