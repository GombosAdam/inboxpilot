import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';
import { getUnreadEmails } from '@/server/gmail';
import { processEmails } from '@/server/ai';
import { checkLimit, getPlanFromStatus, PLAN_LIMITS } from '@/lib/subscription-limits';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to find user by ID first, then by email as fallback
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        googleRefreshToken: true,
      },
    });

    // Fallback: find by email if ID lookup fails
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          googleRefreshToken: true,
        },
      });
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found. Please sign out and sign back in.',
        details: `Session ID: ${session.user.id}, Email: ${session.user.email}`
      }, { status: 404 });
    }

    if (!user.googleRefreshToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Check monthly usage limits only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyUsage = await prisma.usageDaily.aggregate({
      where: {
        userId: user.id,
        date: { gte: startOfMonth },
      },
      _sum: { prompts: true },
    });

    const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
    const monthCount = monthlyUsage._sum.prompts || 0;
    
    const limitCheck = checkLimit(monthCount, plan);
    
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.reason,
        plan,
        usage: { month: monthCount }
      }, { status: 429 });
    }

    // Fetch UNREAD emails from Gmail inbox (last 3 days only)
    console.log('🚀 Starting sync: Fetching UNREAD emails from inbox (last 3 days)...');
    const emails = await getUnreadEmails(user.googleRefreshToken);
    
    if (!emails.length) {
      console.log('✅ Sync complete: No unread emails found in the last 3 days');
      return NextResponse.json({ 
        message: 'No unread emails found in the last 3 days',
        emailsProcessed: 0,
        plan,
        usage: { month: monthCount }
      });
    }

    // Filter out already processed emails to avoid duplicate AI processing
    console.log(`🔍 Checking which emails are already processed...`);
    const emailIds = emails.map(email => email.id);
    const existingEmails = await prisma.emailSummary.findMany({
      where: {
        userId: user.id,
        gmailMessageId: { in: emailIds }
      },
      select: { gmailMessageId: true }
    });
    
    const existingEmailIds = new Set(existingEmails.map(e => e.gmailMessageId));
    const newEmails = emails.filter(email => !existingEmailIds.has(email.id));
    
    console.log(`📊 Email status: ${emails.length} total, ${existingEmails.length} already processed, ${newEmails.length} new emails to process`);
    
    if (newEmails.length === 0) {
      console.log('✅ All unread emails have already been processed - no AI processing needed');
      return NextResponse.json({ 
        message: 'All unread emails from the last 3 days have already been processed',
        emailsProcessed: 0,
        emailsSkipped: existingEmails.length,
        plan,
        usage: { month: monthCount }
      });
    }

    console.log(`🤖 Processing ${newEmails.length} NEW emails with AI (skipping ${existingEmails.length} already processed)...`);
    
    // Process only NEW emails with AI
    const summaries = await processEmails(newEmails);
    console.log(`✨ AI processing completed. Generated ${summaries.length} summaries for new emails.`);
    
    // Save summaries to database
    const savePromises = summaries.map(async (summary, index) => {
      const email = newEmails[index];
      if (!email || !summary) return null;

      try {
        return await prisma.emailSummary.upsert({
          where: {
            userId_gmailMessageId: {
              userId: user.id,
              gmailMessageId: email.id,
            },
          },
          update: {
            summary: summary.summary,
            priority: summary.priority,
            label: summary.label,
            suggestedReply: summary.suggestedReply,
          },
          create: {
            userId: user.id,
            gmailMessageId: email.id,
            sender: summary.sender,
            subject: summary.subject,
            snippet: email.snippet,
            summary: summary.summary,
            priority: summary.priority,
            label: summary.label,
            suggestedReply: summary.suggestedReply,
            receivedAt: email.receivedAt || new Date(),
          },
        });
      } catch (error) {
        console.error('Error saving summary:', error);
        return null;
      }
    });

    const savedResults = await Promise.all(savePromises);
    const successfulSaves = savedResults.filter(result => result !== null).length;
    console.log(`Successfully saved ${successfulSaves} out of ${summaries.length} email summaries.`);

    // Update usage stats
    await prisma.usageDaily.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        prompts: { increment: newEmails.length }, // Only increment for NEW emails
      },
      create: {
        userId: user.id,
        date: today,
        prompts: newEmails.length, // Only count NEW emails processed
      },
    });

    console.log(`✅ Sync completed! Processed ${newEmails.length} new emails, skipped ${existingEmails.length} already processed emails`);

    // Automatic cleanup: Run cleanup after successful sync to enforce retention policies
    try {
      console.log(`🧹 Running automatic cleanup for user ${user.id} (${plan} plan)...`);
      
      // Get retention policy based on subscription plan
      const retentionDays = PLAN_LIMITS[plan].retentionDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Archive old emails (soft delete - mark as archived)
      const archivedResult = await prisma.emailSummary.updateMany({
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
      
      const deletedResult = await prisma.emailSummary.deleteMany({
        where: {
          userId: user.id,
          archived: true,
          archivedAt: {
            lt: hardDeleteCutoff
          }
        }
      });

      if (archivedResult.count > 0 || deletedResult.count > 0) {
        console.log(`🗂️ Auto-cleanup completed: Archived ${archivedResult.count} emails, permanently deleted ${deletedResult.count} old archived emails`);
      }
    } catch (cleanupError) {
      console.log('⚠️ Auto-cleanup error (non-critical):', cleanupError);
      // Don't fail the sync if cleanup fails
    }

    return NextResponse.json({ 
      message: `Sync completed successfully. Processed ${newEmails.length} new emails, skipped ${existingEmails.length} already processed.`,
      emailsProcessed: newEmails.length,
      emailsSkipped: existingEmails.length,
      emailsTotal: emails.length,
      summariesCreated: summaries.length,
      plan,
      usage: { 
        month: monthCount + newEmails.length // Only add NEW emails to usage
      }
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    
    // Return specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Gmail API')) {
      return NextResponse.json({ error: 'Gmail connection failed' }, { status: 400 });
    }
    if (errorMessage.includes('AI processing')) {
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Sync failed', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 });
  }
}