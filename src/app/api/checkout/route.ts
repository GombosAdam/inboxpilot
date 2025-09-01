import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/server/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { plan } = await req.json();
    
    console.log('🔍 Environment check:', { 
      NODE_ENV: process.env.NODE_ENV, 
      DEV_BYPASS_PAYMENTS: process.env.DEV_BYPASS_PAYMENTS,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    });

    // Development mode bypass - simulate successful checkout
    if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_PAYMENTS === 'true') {
      console.log('🧪 DEV MODE: Simulating successful checkout for plan:', plan);
      
      // Return a mock success URL that redirects back to dashboard
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const mockCheckoutUrl = `${baseUrl}/dashboard?subscription=success&plan=${plan}&dev=true`;
      
      return NextResponse.json({ checkoutUrl: mockCheckoutUrl });
    }
    
    // Map plan names to Stripe price IDs
    const priceMap: Record<string, string> = {
      starter: STRIPE_PRICE_IDS.starter,
      Starter: STRIPE_PRICE_IDS.starter, // backwards compatibility
      professional: STRIPE_PRICE_IDS.professional,
      pro: STRIPE_PRICE_IDS.professional, // Support both names
      business: STRIPE_PRICE_IDS.business,
    };
    
    const priceId = priceMap[plan];
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or missing price ID' }, { status: 400 });
    }
    
    console.log('📋 Stripe checkout request:', { plan, priceId, userEmail: session.user.email });
    
    const checkoutUrl = await createCheckoutSession(session.user.email, priceId, plan);
    
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}