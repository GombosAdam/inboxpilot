import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processEmails } from '@/server/ai';
import type { EmailSummary } from '@/server/ai';

// Mock Anthropic SDK
const mockMessages = {
  create: vi.fn(),
};

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: mockMessages,
    })),
  };
});

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    vi.clearAllMocks();
    aiService = new AIService();
  });

  describe('categorizeEmails', () => {
    const mockEmails: EmailMessage[] = [
      {
        id: 'email-1',
        subject: 'Meeting Tomorrow',
        from: 'boss@company.com',
        date: new Date('2024-01-10T10:00:00Z'),
        body: 'We have a meeting scheduled for tomorrow at 10 AM to discuss the project.',
      },
      {
        id: 'email-2',
        subject: 'Your order has been shipped',
        from: 'orders@amazon.com',
        date: new Date('2024-01-10T12:00:00Z'),
        body: 'Your recent order #12345 has been shipped and should arrive in 2-3 business days.',
      },
    ];

    it('should categorize emails successfully', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            classifications: [
              {
                id: 'email-1',
                category: 'Work',
                confidence: 85,
                reasoning: 'Meeting with boss about project'
              },
              {
                id: 'email-2',
                category: 'Shopping',
                confidence: 95,
                reasoning: 'Order confirmation from Amazon'
              }
            ]
          })
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      const result = await aiService.categorizeEmails(mockEmails);

      expect(result.size).toBe(2);
      expect(result.get('email-1')).toEqual({
        category: 'Work',
        confidence: 85,
        reasoning: 'Meeting with boss about project'
      });
      expect(result.get('email-2')).toEqual({
        category: 'Shopping',
        confidence: 95,
        reasoning: 'Order confirmation from Amazon'
      });

      expect(mockMessages.create).toHaveBeenCalledWith({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ 
          role: 'user', 
          content: expect.stringContaining('You are an email categorization assistant')
        }],
      });
    });

    it('should return empty map for empty email list', async () => {
      const result = await aiService.categorizeEmails([]);

      expect(result.size).toBe(0);
      expect(mockMessages.create).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockMessages.create.mockRejectedValue(new Error('API Error'));

      const result = await aiService.categorizeEmails(mockEmails);

      expect(result.size).toBe(0);
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: 'Invalid JSON response'
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      const result = await aiService.categorizeEmails(mockEmails);

      expect(result.size).toBe(0);
    });

    it('should include correct email data in prompt', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            classifications: []
          })
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      await aiService.categorizeEmails(mockEmails);

      const promptCall = mockMessages.create.mock.calls[0][0];
      const prompt = promptCall.messages[0].content;

      expect(prompt).toContain('Meeting Tomorrow');
      expect(prompt).toContain('boss@company.com');
      expect(prompt).toContain('Your order has been shipped');
      expect(prompt).toContain('orders@amazon.com');
      expect(prompt).toContain('We have a meeting scheduled');
      expect(prompt).toContain('Your recent order #12345');
    });

    it('should limit email body to 200 characters', async () => {
      const longBodyEmail: EmailMessage = {
        id: 'email-long',
        subject: 'Long Email',
        from: 'test@example.com',
        date: new Date(),
        body: 'A'.repeat(500), // 500 character body
      };

      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            classifications: []
          })
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      await aiService.categorizeEmails([longBodyEmail]);

      const promptCall = mockMessages.create.mock.calls[0][0];
      const prompt = promptCall.messages[0].content;

      // Should only include first 200 characters
      expect(prompt).toContain('A'.repeat(200));
      expect(prompt).not.toContain('A'.repeat(201));
    });
  });

  describe('generateRules', () => {
    const mockPreferences = [
      'I want work emails to be organized by priority',
      'Shopping emails should be grouped by vendor',
      'Personal emails from family should be highlighted'
    ];

    it('should generate rules successfully', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: `Emails from @company.com should be labeled as Work
Emails with 'invoice' or 'payment' in subject should be labeled as Finance
Newsletters from known senders should be labeled as News
Emails from family members should be labeled as Personal
Shopping confirmations should be labeled as Shopping`
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      const result = await aiService.generateRules(mockPreferences);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe('Emails from @company.com should be labeled as Work');
      expect(result[1]).toBe("Emails with 'invoice' or 'payment' in subject should be labeled as Finance");

      expect(mockMessages.create).toHaveBeenCalledWith({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ 
          role: 'user', 
          content: expect.stringContaining('Based on the following user preferences')
        }],
      });
    });

    it('should include user preferences in prompt', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: 'Rule 1\nRule 2'
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      await aiService.generateRules(mockPreferences);

      const promptCall = mockMessages.create.mock.calls[0][0];
      const prompt = promptCall.messages[0].content;

      expect(prompt).toContain('I want work emails to be organized by priority');
      expect(prompt).toContain('Shopping emails should be grouped by vendor');
      expect(prompt).toContain('Personal emails from family should be highlighted');
    });

    it('should filter out empty rules', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: `Rule 1

Rule 2


Rule 3
`
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      const result = await aiService.generateRules(mockPreferences);

      expect(result).toEqual(['Rule 1', 'Rule 2', 'Rule 3']);
    });

    it('should handle API errors gracefully', async () => {
      mockMessages.create.mockRejectedValue(new Error('API Error'));

      const result = await aiService.generateRules(mockPreferences);

      expect(result).toEqual([]);
    });

    it('should return empty array for invalid response', async () => {
      const mockResponse = {
        content: [{
          type: 'not-text',
          text: 'Should not be processed'
        }]
      };

      mockMessages.create.mockResolvedValue(mockResponse);

      const result = await aiService.generateRules(mockPreferences);

      expect(result).toEqual([]);
    });
  });
});