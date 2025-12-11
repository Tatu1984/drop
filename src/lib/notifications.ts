import prisma from './prisma';
import { Prisma } from '@prisma/client';

// SMS Service (using Twilio-like interface)
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // In production, integrate with Twilio, MSG91, or similar
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    console.log(`[SMS Mock] To: ${phone}, Message: ${message}`);
    return true;
  }

  try {
    // Twilio integration would go here
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: fromNumber,
    //   to: phone,
    // });
    console.log(`[SMS] Sent to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

// Email Service (using SendGrid-like interface)
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@drop.com';

  if (!apiKey) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return true;
  }

  try {
    // SendGrid integration would go here
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(apiKey);
    // await sgMail.send({
    //   to,
    //   from: fromEmail,
    //   subject,
    //   html,
    // });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Send OTP via SMS
export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  const message = `Your Drop verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`;
  return sendSMS(phone, message);
}

// Create in-app notification
export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: 'ORDER_UPDATE' | 'PROMOTION' | 'SYSTEM' | 'REMINDER',
  data?: Record<string, unknown>
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      data: (data || {}) as Prisma.InputJsonValue,
    },
  });
}

// Order status notification templates
export const orderNotifications = {
  confirmed: (orderNumber: string) => ({
    title: 'Order Confirmed!',
    body: `Your order #${orderNumber} has been confirmed by the restaurant.`,
  }),
  preparing: (orderNumber: string) => ({
    title: 'Preparing Your Order',
    body: `Your order #${orderNumber} is being prepared.`,
  }),
  pickedUp: (orderNumber: string, riderName: string) => ({
    title: 'Order Picked Up',
    body: `${riderName} has picked up your order #${orderNumber}.`,
  }),
  outForDelivery: (orderNumber: string, eta: string) => ({
    title: 'Out for Delivery',
    body: `Your order #${orderNumber} is on the way! ETA: ${eta}`,
  }),
  delivered: (orderNumber: string) => ({
    title: 'Order Delivered!',
    body: `Your order #${orderNumber} has been delivered. Enjoy!`,
  }),
  cancelled: (orderNumber: string, reason: string) => ({
    title: 'Order Cancelled',
    body: `Your order #${orderNumber} has been cancelled. Reason: ${reason}`,
  }),
};

// Send order status notification
export async function sendOrderNotification(
  userId: string,
  orderId: string,
  status: keyof typeof orderNotifications,
  params: Record<string, string>
): Promise<void> {
  const template = orderNotifications[status];
  const { title, body } = template(
    params.orderNumber,
    params.riderName || '',
  );

  await createNotification(userId, title, body, 'ORDER_UPDATE', {
    orderId,
    status,
  });

  // Also send push notification (in production)
  // await sendPushNotification(userId, title, body);
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Drop!',
    html: `
      <h1>Welcome to Drop, ${name}!</h1>
      <p>Thank you for joining Drop. Start exploring restaurants, grocery stores, and more.</p>
      <p>Use code <strong>WELCOME50</strong> for 50% off your first order!</p>
    `,
  }),
  orderConfirmation: (orderNumber: string, total: number, items: string[]) => ({
    subject: `Order Confirmed - #${orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Your order #${orderNumber} has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
      <p><strong>Total: ₹${total}</strong></p>
    `,
  }),
  orderDelivered: (orderNumber: string) => ({
    subject: `Order Delivered - #${orderNumber}`,
    html: `
      <h1>Order Delivered!</h1>
      <p>Your order #${orderNumber} has been delivered.</p>
      <p>We hope you enjoyed your order. Don't forget to rate your experience!</p>
    `,
  }),
  refundInitiated: (orderNumber: string, amount: number) => ({
    subject: `Refund Initiated - #${orderNumber}`,
    html: `
      <h1>Refund Initiated</h1>
      <p>A refund of ₹${amount} has been initiated for order #${orderNumber}.</p>
      <p>The amount will be credited within 5-7 business days.</p>
    `,
  }),
};
