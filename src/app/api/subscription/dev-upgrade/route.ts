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
    
    // Only allow this in development mode with bypass enabled
    if (process.env.NODE_ENV !== 'development' || process.env.DEV_BYPASS_PAYMENTS !== 'true') {
      return NextResponse.json({ error: 'Payment bypass is disabled. Please use Lemon Squeezy checkout.' }, { status: 403 });
    }
    
    const { plan } = await req.json();
    
    if (!plan || !['starter', 'Starter', 'professional', 'business', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    // Normalize plan name
    const normalizedPlan = plan === 'pro' ? 'professional' : 
                          plan === 'starter' ? 'Starter' : plan; // Map old lowercase to new capitalized
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user's subscription status for development
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: normalizedPlan,
        // Set fake Lemon Squeezy IDs for development
        lemonCustomerId: 'dev_customer_123',
        lemonSubscriptionId: 'dev_subscription_456',
      },
    });
    
    console.log(`✅ DEV MODE: Updated user ${user.email} to ${normalizedPlan} plan`);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully upgraded to ${normalizedPlan} plan`,
      plan: normalizedPlan,
      development: true
    });
  } catch (error) {
    console.error('Development upgrade error:', error);
    return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
  }
}