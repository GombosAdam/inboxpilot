import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getPlanFromStatus, PLAN_LIMITS } from '@/lib/subscription-limits';

// This endpoint can be called by a cron job service (e.g., Vercel Cron, GitHub Actions, or external service)
// Example: Set up a daily cron job to hit this endpoint at midnight
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their subscription info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      }
    });

    let totalArchived = 0;
    let totalDeleted = 0;
    const errors: string[] = [];

    // Process each user's emails
    for (const user of users) {
      try {
        const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
        const retentionDays = PLAN_LIMITS[plan].retentionDays;
        
        const archiveCutoff = new Date();
        archiveCutoff.setDate(archiveCutoff.getDate() - retentionDays);
        
        const deleteCutoff = new Date(); // Hard delete after 30 days of being archived
        deleteCutoff.setDate(deleteCutoff.getDate() - 30);

        // Archive old active emails
        const archived = await prisma.emailSummary.updateMany({
          where: {
            userId: user.id,
            receivedAt: {
              lt: archiveCutoff
            },
            archived: false
          },
          data: {
            archived: true,
            archivedAt: new Date()
          }
        });

        // Hard delete very old archived emails (30 days after archiving)
        const deleted = await prisma.emailSummary.deleteMany({
          where: {
            userId: user.id,
            archived: true,
            archivedAt: {
              lt: deleteCutoff
            }
          }
        });

        console.log(`🧹 User ${user.id} (${plan} plan): Archived ${archived.count} emails, deleted ${deleted.count} old archived emails`);

        totalArchived += archived.count;
        totalDeleted += deleted.count;

        // Clean up old usage data (older than 6 months)
        const usageCutoff = new Date();
        usageCutoff.setDate(usageCutoff.getDate() - 180);
        await prisma.usageDaily.deleteMany({
          where: {
            userId: user.id,
            date: {
              lt: usageCutoff
            }
          }
        });

      } catch (error) {
        errors.push(`Error processing user ${user.id}: ${error}`);
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      processed: users.length,
      totalArchived,
      totalDeleted,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log(`Cleanup cron completed:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Manual trigger for testing (requires authentication)
export async function POST(request: Request) {
  try {
    // This allows manual triggering from the admin dashboard
    // You could add admin authentication here
    const response = await GET(request);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger cleanup' },
      { status: 500 }
    );
  }
}