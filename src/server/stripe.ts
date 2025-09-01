import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export { stripe };

// Plan to Price ID mapping
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || '',
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL || '',
  business: process.env.STRIPE_PRICE_ID_BUSINESS || '',
};

export async function createCheckoutSession(
  userEmail: string,
  priceId: string,
  planName: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        plan: planName,
        user_email: userEmail,
      },
      success_url: `${baseUrl}/dashboard?subscription=success&plan=${planName}`,
      cancel_url: `${baseUrl}/plan?subscription=cancelled`,
    });

    return session.url;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw new Error('Failed to create checkout session');
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    throw error;
  }
}

export async function getCustomerSubscriptions(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });
    
    return subscriptions.data;
  } catch (error) {
    console.error('Error fetching customer subscriptions:', error);
    return [];
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}