import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';

// This endpoint checks Lemon Squeezy API for subscription status
// Useful for local development or when webhooks fail
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check Lemon Squeezy API for subscriptions
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Lemon Squeezy not configured' }, { status: 500 });
    }
    
    // Query Lemon Squeezy API for subscriptions by email
    const response = await fetch('https://api.lemonsqueezy.com/v1/subscriptions', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
    
    const data = await response.json();
    const subscriptions = data.data || [];
    
    // Find active subscription for this user's email
    const activeSubscription = subscriptions.find((sub: any) => {
      const userEmail = sub.attributes?.user_email || 
                       sub.attributes?.customer_email ||
                       sub.meta?.custom_data?.user_email;
      const status = sub.attributes?.status;
      return userEmail === session.user.email && 
             (status === 'active' || status === 'on_trial');
    });
    
    if (activeSubscription) {
      // Map variant ID to plan type
      const variantId = activeSubscription.attributes?.variant_id?.toString();
      const VARIANT_TO_PLAN: Record<string, string> = {
        '972779': 'starter',
        '972781': 'professional',
      };
      const planType = variantId && VARIANT_TO_PLAN[variantId] ? VARIANT_TO_PLAN[variantId] : 'starter';
      
      // Update user subscription status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lemonSubscriptionId: activeSubscription.id,
          lemonCustomerId: activeSubscription.attributes?.customer_id?.toString(),
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
        },
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Subscription synced successfully',
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.attributes?.status,
          plan: planType,
          endsAt: activeSubscription.attributes?.ends_at,
        }
      });
    } else {
      // No active subscription found
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'inactive',
          subscriptionPlan: 'Free',
        },
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'No active subscription found',
        subscription: null
      });
    }
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json({ error: 'Failed to sync subscription' }, { status: 500 });
  }
}