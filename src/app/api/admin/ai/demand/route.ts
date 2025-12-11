import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    // Get order stats for demand prediction simulation
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentOrders = await prisma.order.count({
      where: { createdAt: { gte: lastWeek } },
    });

    const vendorCounts = await prisma.vendor.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    // Generate zone predictions
    const zones = [
      'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield',
      'Marathahalli', 'JP Nagar', 'Jayanagar', 'BTM Layout',
      'Electronic City', 'Sarjapur Road'
    ];

    const zonePredictions = zones.map((zone, index) => {
      const baseDemand = 50 + (index * 10);
      const variance = Math.floor(Math.random() * 30) - 15;
      const predictedOrders = baseDemand + variance;
      const currentRiders = Math.floor(predictedOrders * 0.3);
      const requiredRiders = Math.ceil(predictedOrders * 0.4);

      return {
        id: `zone-${index + 1}`,
        name: zone,
        predictedOrders,
        currentRiders,
        requiredRiders,
        riderShortage: Math.max(0, requiredRiders - currentRiders),
        peakHours: index % 3 === 0 ? ['12:00-14:00', '19:00-21:00'] : ['18:00-21:00'],
        demandTrend: index % 3 === 0 ? 'increasing' : index % 3 === 1 ? 'stable' : 'decreasing',
        confidenceScore: 75 + Math.floor(Math.random() * 20),
      };
    });

    // Hourly predictions
    const hourlyPredictions = Array.from({ length: 24 }, (_, hour) => {
      const isDinner = hour >= 18 && hour <= 21;
      const isLunch = hour >= 11 && hour <= 14;
      const isBreakfast = hour >= 7 && hour <= 10;

      let baseOrders = 20;
      if (isDinner) baseOrders = 150;
      else if (isLunch) baseOrders = 100;
      else if (isBreakfast) baseOrders = 60;
      else if (hour >= 22 || hour <= 6) baseOrders = 15;

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        predictedOrders: baseOrders + Math.floor(Math.random() * 20),
        predictedRidersNeeded: Math.ceil(baseOrders * 0.35),
      };
    });

    // Category predictions
    const categoryPredictions = [
      { category: 'Food', predictedOrders: 450, growth: 12 },
      { category: 'Grocery', predictedOrders: 280, growth: 8 },
      { category: 'Pharmacy', predictedOrders: 120, growth: 15 },
      { category: 'Wine & Spirits', predictedOrders: 95, growth: 5 },
      { category: 'Meat & Seafood', predictedOrders: 75, growth: 10 },
    ];

    const stats = {
      totalPredictedOrders: zonePredictions.reduce((sum, z) => sum + z.predictedOrders, 0),
      totalRidersNeeded: zonePredictions.reduce((sum, z) => sum + z.requiredRiders, 0),
      zonesWithShortage: zonePredictions.filter(z => z.riderShortage > 0).length,
      avgConfidence: Math.round(zonePredictions.reduce((sum, z) => sum + z.confidenceScore, 0) / zonePredictions.length),
    };

    return successResponse({
      stats,
      zonePredictions,
      hourlyPredictions,
      categoryPredictions,
    });
  } catch (error) {
    console.error('Admin demand prediction error:', error);
    return errorResponse('Failed to fetch demand predictions', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { date } = body;

    // In production, this would trigger the ML model to run predictions
    // For now, we simulate the prediction run

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return successResponse({
      message: 'Prediction model executed successfully',
      date: date || new Date().toISOString().split('T')[0],
      modelVersion: '1.2.0',
      predictionCount: 10,
      executedAt: new Date().toISOString(),
      executedBy: admin.userId,
    });
  } catch (error) {
    console.error('Admin run demand prediction error:', error);
    return errorResponse('Failed to run demand prediction', 500);
  }
}
