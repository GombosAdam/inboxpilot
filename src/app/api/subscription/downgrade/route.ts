import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';

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
    
    // In development mode, directly downgrade
    if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_PAYMENTS === 'true') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'inactive',
          subscriptionPlan: 'Free',
          lemonCustomerId: null,
          lemonSubscriptionId: null,
        },
      });
      
      console.log(`✅ DEV MODE: Downgraded user ${user.email} to Free plan`);
      
      return NextResponse.json({ 
        success: true,
        message: 'Successfully downgraded to Free plan',
        plan: 'Free',
        development: true
      });
    }
    
    // In production, we would cancel the Lemon Squeezy subscription
    if (user.lemonSubscriptionId) {
      try {
        // Cancel subscription via Lemon Squeezy API
        const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${user.lemonSubscriptionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Lemon Squeezy API error: ${response.status}`);
        }
        
        // Update user in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionPlan: 'Free',
          },
        });
        
        return NextResponse.json({ 
          success: true,
          message: 'Subscription canceled successfully. You will retain access until the end of your billing period.',
          plan: 'Free'
        });
      } catch (error) {
        console.error('Failed to cancel Lemon Squeezy subscription:', error);
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
      }
    } else {
      // User doesn't have an active subscription
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'inactive',
          subscriptionPlan: 'Free',
        },
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Switched to Free plan',
        plan: 'Free'
      });
    }
  } catch (error) {
    console.error('Downgrade error:', error);
    return NextResponse.json({ error: 'Failed to downgrade subscription' }, { status: 500 });
  }
}