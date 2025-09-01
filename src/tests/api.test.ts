import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock server modules
vi.mock('@/server/auth', () => ({
  authOptions: {},
}));

vi.mock('@/server/gmail', () => ({
  GmailService: {
    fromUser: vi.fn(),
  },
}));

vi.mock('@/server/ai', () => ({
  AIService: vi.fn().mockImplementation(() => ({
    categorizeEmails: vi.fn(),
  })),
}));

vi.mock('@/server/lemon', () => ({
  LemonSqueezyService: {
    hasActiveSubscription: vi.fn(),
  },
}));

vi.mock('@/server/db', () => ({
  db: {
    emailCategorization: {
      upsert: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

describe('/api/sync endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/sync', () => {
    it('should require authentication', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Dynamically import to avoid hoisting issues
      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should process emails successfully for authenticated user', async () => {
      const { getServerSession } = await import('next-auth');
      const { getUnreadEmails } = await import('@/server/gmail');
      const { processEmails } = await import('@/server/ai');
      const { createCheckoutSession } = await import('@/server/lemon');
      const { db } = await import('@/server/db');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      // Mock subscription check
      vi.mocked(LemonSqueezyService.hasActiveSubscription).mockResolvedValue(false);

      // Mock Gmail service
      const mockGmailService = {
        getMessages: vi.fn().mockResolvedValue([
          {
            id: 'email-1',
            subject: 'Test Email',
            from: 'test@example.com',
            date: new Date(),
            body: 'Test body',
            threadId: 'thread-1',
          },
        ]),
        getLabels: vi.fn().mockResolvedValue([]),
        createLabel: vi.fn().mockResolvedValue({ id: 'label-1', name: 'Test Label' }),
        applyLabel: vi.fn().mockResolvedValue({}),
      };
      vi.mocked(GmailService.fromUser).mockResolvedValue(mockGmailService as any);

      // Mock AI service
      const mockAIService = {
        categorizeEmails: vi.fn().mockResolvedValue(new Map([
          ['email-1', { category: 'Work', confidence: 85, reasoning: 'Test reasoning' }]
        ])),
      };
      vi.mocked(AIService).mockImplementation(() => mockAIService as any);

      // Mock database operations
      // vi.mocked(db.emailCategorization.upsert).mockResolvedValue({} as any);
      vi.mocked(db.user.update).mockResolvedValue({} as any);

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 20 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.processed).toBe(1);
      expect(data.total).toBe(1);

      // Verify Gmail service was called with limited emails for free user
      expect(mockGmailService.getMessages).toHaveBeenCalledWith(10); // Limited to 10 for free users
    });

    it('should limit free users to 10 emails', async () => {
      const { getServerSession } = await import('next-auth');
      const { GmailService } = await import('@/server/gmail');
      const { LemonSqueezyService } = await import('@/server/lemon');

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      vi.mocked(LemonSqueezyService.hasActiveSubscription).mockResolvedValue(false);

      const mockGmailService = {
        getMessages: vi.fn().mockResolvedValue([]),
        getLabels: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(GmailService.fromUser).mockResolvedValue(mockGmailService as any);

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 100 }),
      });

      await POST(request);

      expect(mockGmailService.getMessages).toHaveBeenCalledWith(10);
    });

    it('should allow unlimited emails for pro users', async () => {
      const { getServerSession } = await import('next-auth');
      const { GmailService } = await import('@/server/gmail');
      const { LemonSqueezyService } = await import('@/server/lemon');

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      vi.mocked(LemonSqueezyService.hasActiveSubscription).mockResolvedValue(true);

      const mockGmailService = {
        getMessages: vi.fn().mockResolvedValue([]),
        getLabels: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(GmailService.fromUser).mockResolvedValue(mockGmailService as any);

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 100 }),
      });

      await POST(request);

      expect(mockGmailService.getMessages).toHaveBeenCalledWith(100);
    });

    it('should validate request data', async () => {
      const { getServerSession } = await import('next-auth');

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: -1 }), // Invalid data
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should handle no emails gracefully', async () => {
      const { getServerSession } = await import('next-auth');
      const { GmailService } = await import('@/server/gmail');
      const { LemonSqueezyService } = await import('@/server/lemon');

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      vi.mocked(LemonSqueezyService.hasActiveSubscription).mockResolvedValue(false);

      const mockGmailService = {
        getMessages: vi.fn().mockResolvedValue([]), // No emails
      };
      vi.mocked(GmailService.fromUser).mockResolvedValue(mockGmailService as any);

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.processed).toBe(0);
      expect(data.message).toBe('No emails to process');
    });

    it('should handle service errors', async () => {
      const { getServerSession } = await import('next-auth');
      const { GmailService } = await import('@/server/gmail');

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      vi.mocked(GmailService.fromUser).mockRejectedValue(new Error('Gmail service error'));

      const { POST } = await import('@/app/api/sync/route');
      
      const request = new NextRequest('http://localhost:3000/api/sync', {
        method: 'POST',
        body: JSON.stringify({ maxEmails: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});