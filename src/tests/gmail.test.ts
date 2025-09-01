import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGmailClient, getUnreadEmails, markEmailAsRead } from '@/server/gmail';

// Mock googleapis
const mockGmail = {
  users: {
    messages: {
      list: vi.fn(),
      get: vi.fn(),
      modify: vi.fn(),
    },
    labels: {
      list: vi.fn(),
      create: vi.fn(),
    },
  },
};

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
      })),
    },
    gmail: vi.fn(() => mockGmail),
  },
}));

// Mock database
vi.mock('@/server/db', () => ({
  db: {
    account: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock crypto
vi.mock('@/server/crypto', () => ({
  decrypt: vi.fn((token) => `decrypted-${token}`),
}));

describe('GmailService', () => {
  let gmailService: GmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    gmailService = new GmailService('access-token', 'refresh-token', 'user-123');
  });

  describe('getMessages', () => {
    it('should fetch and format messages correctly', async () => {
      const mockMessagesList = {
        data: {
          messages: [
            { id: 'msg-1' },
            { id: 'msg-2' },
          ],
        },
      };

      const mockMessageDetail = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Subject' },
              { name: 'From', value: 'sender@example.com' },
              { name: 'Date', value: 'Wed, 10 Jan 2024 10:00:00 +0000' },
            ],
            body: {
              data: Buffer.from('Test email body').toString('base64'),
            },
          },
        },
      };

      mockGmail.users.messages.list.mockResolvedValue(mockMessagesList);
      mockGmail.users.messages.get.mockResolvedValue(mockMessageDetail);

      const messages = await gmailService.getMessages(10);

      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        id: 'msg-1',
        subject: 'Test Subject',
        from: 'sender@example.com',
        date: new Date('Wed, 10 Jan 2024 10:00:00 +0000'),
        body: 'Test email body',
        threadId: 'thread-1',
      });

      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        maxResults: 10,
        q: 'in:inbox -category:promotions -category:social',
      });
    });

    it('should return empty array when no messages', async () => {
      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: null },
      });

      const messages = await gmailService.getMessages();

      expect(messages).toEqual([]);
    });

    it('should handle multipart messages', async () => {
      const mockMessageDetail = {
        data: {
          id: 'msg-1',
          threadId: 'thread-1',
          payload: {
            headers: [
              { name: 'Subject', value: 'Multipart Subject' },
              { name: 'From', value: 'sender@example.com' },
              { name: 'Date', value: 'Wed, 10 Jan 2024 10:00:00 +0000' },
            ],
            parts: [
              {
                mimeType: 'text/plain',
                body: {
                  data: Buffer.from('Multipart body').toString('base64'),
                },
              },
              {
                mimeType: 'text/html',
                body: {
                  data: Buffer.from('<p>HTML body</p>').toString('base64'),
                },
              },
            ],
          },
        },
      };

      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: [{ id: 'msg-1' }] },
      });
      mockGmail.users.messages.get.mockResolvedValue(mockMessageDetail);

      const messages = await gmailService.getMessages();

      expect(messages[0].body).toBe('Multipart body');
    });

    it('should throw error when API fails', async () => {
      mockGmail.users.messages.list.mockRejectedValue(new Error('API Error'));

      await expect(gmailService.getMessages()).rejects.toThrow('API Error');
    });
  });

  describe('createLabel', () => {
    it('should create label with correct parameters', async () => {
      const mockLabel = {
        data: {
          id: 'label-123',
          name: 'Test Label',
        },
      };

      mockGmail.users.labels.create.mockResolvedValue(mockLabel);

      const result = await gmailService.createLabel('Test Label');

      expect(result).toEqual(mockLabel.data);
      expect(mockGmail.users.labels.create).toHaveBeenCalledWith({
        userId: 'me',
        requestBody: {
          name: 'Test Label',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
    });

    it('should throw error when label creation fails', async () => {
      mockGmail.users.labels.create.mockRejectedValue(new Error('Label creation failed'));

      await expect(gmailService.createLabel('Test Label')).rejects.toThrow('Label creation failed');
    });
  });

  describe('applyLabel', () => {
    it('should apply label to message', async () => {
      mockGmail.users.messages.modify.mockResolvedValue({});

      await gmailService.applyLabel('msg-123', 'label-456');

      expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
        userId: 'me',
        id: 'msg-123',
        requestBody: {
          addLabelIds: ['label-456'],
        },
      });
    });

    it('should throw error when applying label fails', async () => {
      mockGmail.users.messages.modify.mockRejectedValue(new Error('Apply label failed'));

      await expect(gmailService.applyLabel('msg-123', 'label-456')).rejects.toThrow('Apply label failed');
    });
  });

  describe('getLabels', () => {
    it('should fetch all labels', async () => {
      const mockLabels = {
        data: {
          labels: [
            { id: 'label-1', name: 'Label 1' },
            { id: 'label-2', name: 'Label 2' },
          ],
        },
      };

      mockGmail.users.labels.list.mockResolvedValue(mockLabels);

      const labels = await gmailService.getLabels();

      expect(labels).toEqual(mockLabels.data.labels);
      expect(mockGmail.users.labels.list).toHaveBeenCalledWith({
        userId: 'me',
      });
    });

    it('should return empty array when no labels', async () => {
      mockGmail.users.labels.list.mockResolvedValue({
        data: { labels: null },
      });

      const labels = await gmailService.getLabels();

      expect(labels).toEqual([]);
    });
  });

  describe('fromUser', () => {
    it('should create GmailService from user account', async () => {
      const { db } = await import('@/server/db');
      const { decrypt } = await import('@/server/crypto');

      vi.mocked(db.account.findFirst).mockResolvedValue({
        id: 'account-123',
        access_token: 'encrypted-access',
        refresh_token: 'encrypted-refresh',
        userId: 'user-123',
        provider: 'google',
        providerAccountId: 'google-123',
        type: 'oauth',
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null,
      });

      vi.mocked(decrypt)
        .mockReturnValueOnce('decrypted-access')
        .mockReturnValueOnce('decrypted-refresh');

      const service = await GmailService.fromUser('user-123');

      expect(service).toBeInstanceOf(GmailService);
      expect(db.account.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123', provider: 'google' },
      });
    });

    it('should throw error when no account found', async () => {
      const { db } = await import('@/server/db');

      vi.mocked(db.account.findFirst).mockResolvedValue(null);

      await expect(GmailService.fromUser('user-123')).rejects.toThrow('No Google account found for user');
    });

    it('should throw error when tokens missing', async () => {
      const { db } = await import('@/server/db');

      vi.mocked(db.account.findFirst).mockResolvedValue({
        id: 'account-456',
        access_token: null,
        refresh_token: 'encrypted-refresh',
        userId: 'user-123',
        provider: 'google',
        providerAccountId: 'google-123',
        type: 'oauth',
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null,
      });

      await expect(GmailService.fromUser('user-123')).rejects.toThrow('No Google account found for user');
    });
  });
});