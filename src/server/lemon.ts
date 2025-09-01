import { createHmac } from 'crypto';

// Lemon Squeezy checkout integration
export async function createCheckoutSession(userEmail: string, variantId: string) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID || '217160';
  const storeDomain = process.env.LEMONSQUEEZY_STORE_DOMAIN || 'ai-mailbox.lemonsqueezy.com';
  
  // Generate checkout URL with your store and variant
  const checkoutUrl = new URL(`https://${storeDomain}/buy/${variantId}`);
  
  // Pre-fill customer email
  checkoutUrl.searchParams.set('checkout[email]', userEmail);
  
  // Add custom data to track the user
  checkoutUrl.searchParams.set('checkout[custom][user_email]', userEmail);
  
  // Determine the base URL based on environment
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000';
  
  // Set redirect URLs based on environment
  checkoutUrl.searchParams.set('checkout[success_url]', `${baseUrl}/dashboard?subscription=success`);
  checkoutUrl.searchParams.set('checkout[cancel_url]', `${baseUrl}/pricing?subscription=cancelled`);
  
  console.log('🛒 Creating checkout session:', {
    storeDomain,
    variantId,
    userEmail,
    checkoutUrl: checkoutUrl.toString()
  });
  
  return checkoutUrl.toString();
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('SECURITY WARNING: No webhook secret configured');
    // Only allow in development mode, fail in production
    return process.env.NODE_ENV === 'development';
  }
  
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const hmac = createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');
  
  return digest === signature;
}

export interface WebhookEvent {
  eventName: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  userEmail?: string;
}

export function parseWebhookEvent(body: any): WebhookEvent {
  return {
    eventName: body.meta?.event_name || 'unknown',
    customerId: body.data?.attributes?.customer_id?.toString(),
    subscriptionId: body.data?.id?.toString(),
    status: body.data?.attributes?.status,
    userEmail: body.meta?.custom_data?.user_email || body.data?.attributes?.user_email,
  };
}