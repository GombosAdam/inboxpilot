import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        settings: true,
        usageDaily: {
          where: {
            date: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
    });
    
    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        image: user?.image,
        subscriptionStatus: user?.subscriptionStatus,
        dailyQuota: user?.dailyQuota,
        googleConnected: !!user?.googleRefreshToken,
      },
      settings: user?.settings,
      usage: {
        today: user?.usageDaily[0]?.prompts || 0,
        limit: user?.dailyQuota || 300,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}