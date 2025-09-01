import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';
import { checkLimit, getPlanFromStatus, PLAN_LIMITS } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        lemonSubscriptionId: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get this month's usage only (no daily limits anymore)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyUsage = await prisma.usageDaily.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth
        }
      },
      _sum: {
        prompts: true
      }
    });
    
    const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
    const monthCount = monthlyUsage._sum.prompts || 0;
    
    const limitCheck = checkLimit(monthCount, plan);
    
    return NextResponse.json({
      plan,
      usage: {
        month: monthCount
      },
      limits: {
        monthly: PLAN_LIMITS[plan].emailsPerMonth
      },
      canProcess: limitCheck.allowed,
      limitReason: limitCheck.reason
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}