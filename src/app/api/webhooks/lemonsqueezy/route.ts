import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyWebhookSignature, parseWebhookEvent } from '@/server/lemon';

// Map Lemon Squeezy variant IDs to plan types
const VARIANT_TO_PLAN: Record<string, string> = {
  '972779': 'Starter', // Updated to use capitalized Starter
  '972781': 'professional',
  // Add more variant IDs as needed
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature');
    
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const body = JSON.parse(rawBody);
    const event = parseWebhookEvent(body);
    
    if (!event.userEmail) {
      return NextResponse.json({ error: 'No user email' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: event.userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    switch (event.eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        // Determine the plan type from the variant ID
        const variantId = body.data?.attributes?.variant_id?.toString();
        const planType = variantId && VARIANT_TO_PLAN[variantId] ? VARIANT_TO_PLAN[variantId] : 'Starter';
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lemonCustomerId: event.customerId,
            lemonSubscriptionId: event.subscriptionId,
            subscriptionStatus: event.status === 'active' || event.status === 'on_trial' ? 'active' : event.status,
            subscriptionPlan: planType,
          },
        });
        break;
        
      case 'subscription_cancelled':
      case 'subscription_expired':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionPlan: 'Free',
          },
        });
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}