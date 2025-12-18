import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy-load Razorpay instance to avoid build-time errors
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials not configured');
    }

    razorpayInstance = new Razorpay({ key_id, key_secret });
  }
  return razorpayInstance;
}

export interface CreateOrderParams {
  amount: number; // Amount in paise (INR * 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

// Create a Razorpay order
export async function createRazorpayOrder(params: CreateOrderParams): Promise<PaymentOrder> {
  const { amount, currency = 'INR', receipt, notes = {} } = params;

  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt,
    notes,
  });

  return order as PaymentOrder;
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Fetch payment details
export async function fetchPayment(paymentId: string) {
  return getRazorpay().payments.fetch(paymentId);
}

// Initiate refund
export async function initiateRefund(
  paymentId: string,
  amount?: number, // Amount in paise
  notes?: Record<string, string>
) {
  const refundParams: { amount?: number; notes?: Record<string, string> } = {};

  if (amount) {
    refundParams.amount = amount;
  }

  if (notes) {
    refundParams.notes = notes;
  }

  return getRazorpay().payments.refund(paymentId, refundParams);
}

// Create a customer
export async function createCustomer(
  name: string,
  email?: string,
  phone?: string
) {
  return getRazorpay().customers.create({
    name,
    email,
    contact: phone,
  });
}

export default { getRazorpay };
