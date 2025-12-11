import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser, adminUnauthorizedResponse } from '@/lib/admin-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'general';

    // Get system config
    const configs = await prisma.systemConfig.findMany();
    const configMap = configs.reduce((acc, c) => {
      acc[c.key] = c.value as string;
      return acc;
    }, {} as Record<string, string>);

    // All settings organized by tab
    const settings = {
      general: {
        platformName: configMap['platform_name'] || 'Drop',
        supportEmail: configMap['support_email'] || 'support@drop.com',
        supportPhone: configMap['support_phone'] || '+91 9876543210',
        currency: configMap['currency'] || 'INR',
        language: configMap['language'] || 'en',
        timezone: configMap['timezone'] || 'Asia/Kolkata',
        businessHours: {
          openingTime: configMap['opening_time'] || '08:00',
          closingTime: configMap['closing_time'] || '23:00',
        },
      },
      delivery: {
        baseFee: parseFloat(configMap['base_delivery_fee'] || '40'),
        freeDeliveryAbove: parseFloat(configMap['free_delivery_above'] || '199'),
        perKmCharge: parseFloat(configMap['per_km_charge'] || '8'),
        maxDistance: parseFloat(configMap['max_delivery_distance'] || '15'),
        avgSpeed: parseFloat(configMap['avg_delivery_speed'] || '20'),
        prepBuffer: parseInt(configMap['prep_buffer_minutes'] || '10'),
        deliverySlots: [
          { id: '1', name: 'Express', duration: 30, extraCharge: 20 },
          { id: '2', name: 'Standard', duration: 45, extraCharge: 0 },
          { id: '3', name: 'Scheduled', duration: 60, extraCharge: 0 },
        ],
        surgeSettings: {
          enabled: configMap['surge_enabled'] === 'true',
          minMultiplier: 1.0,
          maxMultiplier: 2.5,
          demandThreshold: 80,
        },
      },
      payments: {
        enabledMethods: ['UPI', 'CARD', 'WALLET', 'COD'],
        gateway: {
          provider: 'razorpay',
          keyId: process.env.RAZORPAY_KEY_ID ? '***configured***' : 'not_configured',
        },
        cod: {
          enabled: configMap['cod_enabled'] !== 'false',
          maxAmount: parseFloat(configMap['cod_max_amount'] || '2000'),
          minOrderForCOD: parseFloat(configMap['cod_min_order'] || '100'),
        },
      },
      notifications: {
        channels: {
          push: true,
          email: !!process.env.SENDGRID_API_KEY,
          sms: !!process.env.TWILIO_ACCOUNT_SID,
          whatsapp: false,
        },
        emailConfig: {
          provider: 'sendgrid',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@drop.com',
          configured: !!process.env.SENDGRID_API_KEY,
        },
        smsConfig: {
          provider: 'twilio',
          configured: !!process.env.TWILIO_ACCOUNT_SID,
        },
      },
      commissions: {
        categories: [
          { category: 'RESTAURANT', commission: 15 },
          { category: 'GROCERY', commission: 12 },
          { category: 'WINE_SHOP', commission: 10 },
          { category: 'PHARMACY', commission: 8 },
          { category: 'MEAT_SHOP', commission: 12 },
        ],
        riderEarnings: {
          basePerDelivery: parseFloat(configMap['rider_base_earning'] || '30'),
          perKm: parseFloat(configMap['rider_per_km'] || '5'),
          peakBonus: parseFloat(configMap['rider_peak_bonus'] || '20'),
          incentiveTarget: parseInt(configMap['rider_incentive_target'] || '15'),
          incentiveBonus: parseFloat(configMap['rider_incentive_bonus'] || '200'),
        },
        payoutSettings: {
          frequency: configMap['payout_frequency'] || 'weekly',
          minPayout: parseFloat(configMap['min_payout'] || '500'),
          payoutDay: configMap['payout_day'] || 'monday',
        },
      },
      security: {
        twoFactorEnabled: configMap['2fa_enabled'] === 'true',
        sessionTimeout: parseInt(configMap['session_timeout'] || '30'),
        ipWhitelist: configMap['ip_whitelist']?.split(',') || [],
        adminRoles: [
          { id: 'super_admin', name: 'Super Admin', permissions: ['all'] },
          { id: 'admin', name: 'Admin', permissions: ['read', 'write', 'orders', 'users', 'vendors', 'riders'] },
          { id: 'finance', name: 'Finance', permissions: ['read', 'finance', 'payouts'] },
          { id: 'support', name: 'Support', permissions: ['read', 'orders', 'users', 'support'] },
        ],
      },
    };

    return successResponse({ settings });
  } catch (error) {
    console.error('Admin settings error:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await getAdminUser(request);
    if (!admin) return adminUnauthorizedResponse(error);

    const body = await request.json();
    const { tab, settings } = body;

    if (!tab || !settings) {
      return errorResponse('Tab and settings required', 400);
    }

    // Map settings to config keys and update
    const configUpdates: { key: string; value: string }[] = [];

    if (tab === 'general') {
      if (settings.platformName) configUpdates.push({ key: 'platform_name', value: settings.platformName });
      if (settings.supportEmail) configUpdates.push({ key: 'support_email', value: settings.supportEmail });
      if (settings.supportPhone) configUpdates.push({ key: 'support_phone', value: settings.supportPhone });
      if (settings.currency) configUpdates.push({ key: 'currency', value: settings.currency });
      if (settings.language) configUpdates.push({ key: 'language', value: settings.language });
      if (settings.timezone) configUpdates.push({ key: 'timezone', value: settings.timezone });
      if (settings.businessHours?.openingTime) configUpdates.push({ key: 'opening_time', value: settings.businessHours.openingTime });
      if (settings.businessHours?.closingTime) configUpdates.push({ key: 'closing_time', value: settings.businessHours.closingTime });
    }

    if (tab === 'delivery') {
      if (settings.baseFee !== undefined) configUpdates.push({ key: 'base_delivery_fee', value: String(settings.baseFee) });
      if (settings.freeDeliveryAbove !== undefined) configUpdates.push({ key: 'free_delivery_above', value: String(settings.freeDeliveryAbove) });
      if (settings.perKmCharge !== undefined) configUpdates.push({ key: 'per_km_charge', value: String(settings.perKmCharge) });
      if (settings.maxDistance !== undefined) configUpdates.push({ key: 'max_delivery_distance', value: String(settings.maxDistance) });
    }

    if (tab === 'payments') {
      if (settings.cod?.enabled !== undefined) configUpdates.push({ key: 'cod_enabled', value: String(settings.cod.enabled) });
      if (settings.cod?.maxAmount !== undefined) configUpdates.push({ key: 'cod_max_amount', value: String(settings.cod.maxAmount) });
    }

    if (tab === 'commissions') {
      if (settings.riderEarnings?.basePerDelivery !== undefined)
        configUpdates.push({ key: 'rider_base_earning', value: String(settings.riderEarnings.basePerDelivery) });
      if (settings.riderEarnings?.perKm !== undefined)
        configUpdates.push({ key: 'rider_per_km', value: String(settings.riderEarnings.perKm) });
      if (settings.payoutSettings?.frequency)
        configUpdates.push({ key: 'payout_frequency', value: settings.payoutSettings.frequency });
    }

    // Upsert all config values
    for (const config of configUpdates) {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: { key: config.key, value: config.value },
      });
    }

    return successResponse({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Admin update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
