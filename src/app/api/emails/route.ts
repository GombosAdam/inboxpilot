import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';
import { markEmailAsRead, markMultipleEmailsAsRead } from '@/server/gmail';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info - try by ID first, then by email as fallback
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });

    // Fallback: find by email if ID lookup fails
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true },
      });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        debug: { sessionId: session.user.id, sessionEmail: session.user.email }
      }, { status: 404 });
    }

    // Get email summaries for the user, ordered by actual email received date (newest first)
    const emails = await prisma.emailSummary.findMany({
      where: { 
        userId: user.id
      },
      orderBy: { receivedAt: 'desc' },
      take: 100, // Limit to 100 most recent
    });

    console.log(`Emails API: Found ${emails.length} emails for user ${user.id}`);

    return NextResponse.json({ 
      emails,
      count: emails.length,
      user: {
        id: user.id,
        email: user.email,
      }
    });
    
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch emails',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, emailIds } = body;

    if (action !== 'mark-as-read') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!emailIds || !Array.isArray(emailIds)) {
      return NextResponse.json({ error: 'Invalid email IDs' }, { status: 400 });
    }

    // Get user info
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, googleRefreshToken: true },
    });

    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, googleRefreshToken: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.googleRefreshToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Get email records from database
    const emails = await prisma.emailSummary.findMany({
      where: {
        userId: user.id,
        id: { in: emailIds }
      },
      select: {
        id: true,
        gmailMessageId: true,
        read: true
      }
    });

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No emails found' }, { status: 404 });
    }

    // Filter only unread emails
    const unreadEmails = emails.filter(email => !email.read);
    
    if (unreadEmails.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All selected emails are already marked as read',
        markedAsRead: 0 
      });
    }

    const gmailMessageIds = unreadEmails.map(email => email.gmailMessageId);

    // Mark emails as read in Gmail
    let gmailSuccess = false;
    if (gmailMessageIds.length === 1) {
      gmailSuccess = await markEmailAsRead(user.googleRefreshToken, gmailMessageIds[0]);
    } else {
      gmailSuccess = await markMultipleEmailsAsRead(user.googleRefreshToken, gmailMessageIds);
    }

    // Update read status in our database regardless of Gmail API result
    const updateResult = await prisma.emailSummary.updateMany({
      where: {
        userId: user.id,
        id: { in: unreadEmails.map(e => e.id) }
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    console.log(`📧 Marked ${updateResult.count} emails as read for user ${user.email}`);

    return NextResponse.json({
      success: true,
      markedAsRead: updateResult.count,
      gmailSyncSuccess: gmailSuccess,
      message: gmailSuccess 
        ? `Marked ${updateResult.count} emails as read in both app and Gmail`
        : `Marked ${updateResult.count} emails as read in app (Gmail sync failed - will retry later)`
    });

  } catch (error) {
    console.error('Error marking emails as read:', error);
    return NextResponse.json({ 
      error: 'Failed to mark emails as read',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}