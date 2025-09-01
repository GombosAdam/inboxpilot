import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';
import { getPlanFromStatus, PLAN_LIMITS } from '@/lib/subscription-limits';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json().catch(() => ({ action: 'auto' }));
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get retention policy based on subscription plan
    const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
    const retentionDays = PLAN_LIMITS[plan].retentionDays;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`📦 Archiving emails older than ${retentionDays} days (${cutoffDate.toDateString()}) for ${plan} plan user ${user.id}`);

    // Archive old emails (soft delete - mark as archived)
    const result = await prisma.emailSummary.updateMany({
      where: {
        userId: user.id,
        receivedAt: {
          lt: cutoffDate
        },
        archived: false
      },
      data: {
        archived: true,
        archivedAt: new Date()
      }
    });

    // Hard delete very old archived emails (30 days after archiving)
    const hardDeleteCutoff = new Date();
    hardDeleteCutoff.setDate(hardDeleteCutoff.getDate() - 30);
    
    const deleted = await prisma.emailSummary.deleteMany({
      where: {
        userId: user.id,
        archived: true,
        archivedAt: {
          lt: hardDeleteCutoff
        }
      }
    });

    console.log(`✅ Cleanup complete: Archived ${result.count} emails, permanently deleted ${deleted.count} old archived emails`);

    return NextResponse.json({
      success: true,
      archived: result.count,
      deleted: deleted.count,
      retentionDays,
      plan,
      message: `${plan} Plan: Archived ${result.count} emails older than ${retentionDays} days. Permanently deleted ${deleted.count} old archived emails.`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup emails' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get retention policy based on subscription plan
    const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
    const retentionDays = PLAN_LIMITS[plan].retentionDays;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [totalEmails, activeEmails, archivedEmails, emailsToArchive] = await Promise.all([
      // Total emails
      prisma.emailSummary.count({
        where: { userId: user.id }
      }),
      // Active emails
      prisma.emailSummary.count({
        where: {
          userId: user.id,
          archived: false
        }
      }),
      // Archived emails
      prisma.emailSummary.count({
        where: {
          userId: user.id,
          archived: true
        }
      }),
      // Emails that would be archived (older than retention period)
      prisma.emailSummary.count({
        where: {
          userId: user.id,
          archived: false,
          receivedAt: { lt: cutoffDate }
        }
      })
    ]);

    return NextResponse.json({
      plan,
      retentionDays,
      totalEmails,
      activeEmails,
      archivedEmails,
      emailsToArchive,
      cutoffDate: cutoffDate.toISOString(),
      retentionPolicy: {
        Free: `${PLAN_LIMITS.Free.retentionDays} days`,
        Starter: `${PLAN_LIMITS.Starter.retentionDays} days`,
        professional: `${PLAN_LIMITS.professional.retentionDays} days`,
        business: `${PLAN_LIMITS.business.retentionDays} days`
      }
    });
  } catch (error) {
    console.error('Cleanup stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get cleanup stats' },
      { status: 500 }
    );
  }
}