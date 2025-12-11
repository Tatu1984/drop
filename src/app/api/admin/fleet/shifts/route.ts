import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get rider counts
    const [totalRiders, onlineRiders] = await Promise.all([
      prisma.rider.count({ where: { documentVerified: true } }),
      prisma.rider.count({ where: { isOnline: true } }),
    ]);

    const currentHour = new Date().getHours();

    // Define standard shifts
    const shifts = [
      {
        id: 'morning',
        name: 'Morning Shift',
        startTime: '06:00',
        endTime: '14:00',
        ridersAssigned: Math.floor(totalRiders * 0.3),
        ridersActive: currentHour >= 6 && currentHour < 14 ? Math.floor(onlineRiders * 0.4) : 0,
        type: 'morning',
        zones: ['Zone A', 'Zone B', 'Zone C'],
        status: currentHour >= 6 && currentHour < 14 ? 'active' : currentHour < 6 ? 'upcoming' : 'completed',
      },
      {
        id: 'afternoon',
        name: 'Afternoon Shift',
        startTime: '11:00',
        endTime: '19:00',
        ridersAssigned: Math.floor(totalRiders * 0.4),
        ridersActive: currentHour >= 11 && currentHour < 19 ? Math.floor(onlineRiders * 0.5) : 0,
        type: 'afternoon',
        zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
        status: currentHour >= 11 && currentHour < 19 ? 'active' : currentHour < 11 ? 'upcoming' : 'completed',
      },
      {
        id: 'evening',
        name: 'Evening Shift',
        startTime: '17:00',
        endTime: '23:00',
        ridersAssigned: Math.floor(totalRiders * 0.5),
        ridersActive: currentHour >= 17 && currentHour < 23 ? Math.floor(onlineRiders * 0.6) : 0,
        type: 'evening',
        zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
        status: currentHour >= 17 && currentHour < 23 ? 'active' : currentHour < 17 ? 'upcoming' : 'completed',
      },
      {
        id: 'night',
        name: 'Night Shift',
        startTime: '21:00',
        endTime: '03:00',
        ridersAssigned: Math.floor(totalRiders * 0.2),
        ridersActive: currentHour >= 21 || currentHour < 3 ? Math.floor(onlineRiders * 0.2) : 0,
        type: 'night',
        zones: ['Zone A', 'Zone B'],
        status: currentHour >= 21 || currentHour < 3 ? 'active' : currentHour < 21 ? 'upcoming' : 'completed',
      },
    ];

    // Get some riders for assignments simulation
    const riders = await prisma.rider.findMany({
      take: 20,
      where: { documentVerified: true },
      select: { id: true, name: true, phone: true },
    });

    const assignments = riders.map((rider, index) => {
      const shiftIndex = index % shifts.length;
      const shift = shifts[shiftIndex];
      const isActiveShift = shift.status === 'active';

      return {
        id: `assignment-${rider.id}`,
        riderName: rider.name,
        riderPhone: rider.phone,
        shiftName: shift.name,
        date: dateStr,
        status: isActiveShift ? 'active' : shift.status === 'completed' ? 'completed' : 'scheduled',
        checkIn: isActiveShift || shift.status === 'completed' ? shift.startTime : undefined,
        checkOut: shift.status === 'completed' ? shift.endTime : undefined,
      };
    });

    return successResponse({ shifts, assignments });
  } catch (error) {
    console.error('Admin shifts error:', error);
    return errorResponse('Failed to fetch shift data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { name, startTime, endTime, zones } = body;

    if (!name || !startTime || !endTime) {
      return errorResponse('Name, start time, and end time required', 400);
    }

    // In a real implementation, this would create a shift in the database
    return successResponse({
      message: 'Shift created successfully',
      shift: { id: `shift-${Date.now()}`, name, startTime, endTime, zones },
    });
  } catch (error) {
    console.error('Admin create shift error:', error);
    return errorResponse('Failed to create shift', 500);
  }
}
