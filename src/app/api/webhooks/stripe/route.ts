import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { constructWebhookEvent } from '@/server/stripe';
import Stripe from 'stripe';

// Map Stripe price IDs to plan types
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_ID_STARTER || '']: 'Starter',
  [process.env.STRIPE_PRICE_ID_PROFESSIONAL || '']: 'professional', 
  [process.env.STRIPE_PRICE_ID_BUSINESS || '']: 'business',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = await constructWebhookEvent(body, signature);
    
    console.log('🔔 Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, 'active');
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, 'canceled');
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          console.log('💳 Payment failed for subscription:', invoice.subscription);
          // Could implement payment retry logic here
        }
        break;
      }
      
      default:
        console.log(`🤷‍♂️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userEmail = session.metadata?.user_email || session.customer_email;
  const planName = session.metadata?.plan;
  
  if (!userEmail) {
    console.error('❌ No user email in checkout session');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error('❌ User not found:', userEmail);
    return;
  }

  console.log('🎉 Processing successful payment for:', userEmail, 'Plan:', planName);

  // Update user subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: session.customer as string,
      subscriptionStatus: 'active',
      subscriptionPlan: planName || 'Starter',
    },
  });
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  status: 'active' | 'canceled'
) {
  if (!subscription.customer) return;

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (!user) {
    console.error('❌ User not found for customer:', subscription.customer);
    return;
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planName = priceId ? PRICE_TO_PLAN[priceId] || 'Starter' : 'Free';

  console.log(`🔄 Subscription ${status} for user:`, user.email, 'Plan:', planName);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
      subscriptionPlan: status === 'active' ? planName : 'Free',
      stripeSubscriptionId: subscription.id,
    },
  });
}