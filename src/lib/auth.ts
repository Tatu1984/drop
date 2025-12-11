import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export interface JWTPayload {
  userId: string;
  phone?: string;
  email?: string;
  type: 'user' | 'rider' | 'admin' | 'vendor';
}

export interface OTPRecord {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory OTP store (in production, use Redis)
const otpStore = new Map<string, OTPRecord>();

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP
export function storeOTP(phone: string, otp: string): void {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
  otpStore.set(phone, {
    phone,
    otp,
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    attempts: 0,
  });
}

// Verify OTP
export function verifyOTP(phone: string, otp: string): { valid: boolean; error?: string } {
  const record = otpStore.get(phone);

  if (!record) {
    return { valid: false, error: 'OTP not found. Please request a new one.' };
  }

  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  if (new Date() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: 'OTP expired. Please request a new one.' };
  }

  if (record.otp !== otp) {
    record.attempts++;
    return { valid: false, error: 'Invalid OTP. Please try again.' };
  }

  // OTP is valid, remove it
  otpStore.delete(phone);
  return { valid: true };
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Hash password (for admin accounts)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get current user from request
export async function getCurrentUser(request: Request): Promise<{ user: JWTPayload | null; error?: string }> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Try to get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return { user: null, error: 'No authentication token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user: payload };
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user: payload };
}

// Get full user from database
export async function getFullUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      wallet: true,
      subscription: true,
      loyaltyPoints: true,
    },
  });
}

// Get full rider from database
export async function getFullRider(riderId: string) {
  return prisma.rider.findUnique({
    where: { id: riderId },
  });
}

// Get full admin from database
export async function getFullAdmin(adminId: string) {
  return prisma.admin.findUnique({
    where: { id: adminId },
  });
}
