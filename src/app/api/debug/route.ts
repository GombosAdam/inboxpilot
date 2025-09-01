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

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all email summaries for the user
    const emails = await prisma.emailSummary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get usage stats
    const usageStats = await prisma.usageDaily.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return NextResponse.json({ 
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      dbUserId: user.id,
      dbUserEmail: user.email,
      emailCount: emails.length,
      usageRecords: usageStats.length,
      emails: emails.map(e => ({
        id: e.id,
        subject: e.subject,
        sender: e.sender,
        summary: e.summary,
        priority: e.priority,
        label: e.label,
        read: e.read,
        readAt: e.readAt,
        createdAt: e.createdAt,
      })),
      usage: usageStats
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action !== 'reset-account') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset account data
    const [deletedEmails, deletedUsage] = await Promise.all([
      // Delete all email summaries
      prisma.emailSummary.deleteMany({
        where: { userId: user.id }
      }),
      // Delete all usage records
      prisma.usageDaily.deleteMany({
        where: { userId: user.id }
      })
    ]);

    console.log(`🧹 Reset account data for user ${user.email}: ${deletedEmails.count} emails, ${deletedUsage.count} usage records`);

    return NextResponse.json({
      success: true,
      message: 'Account data reset successfully',
      deleted: {
        emails: deletedEmails.count,
        usageRecords: deletedUsage.count
      }
    });
    
  } catch (error) {
    console.error('Account reset error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset account data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}