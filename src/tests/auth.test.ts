import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';

// Mock the database
vi.mock('@/server/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
}));

describe('Authentication Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct provider configuration', () => {
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe('google');
  });

  it('should have proper session strategy', () => {
    expect(authOptions.session?.strategy).toBe('database');
  });

  it('should have custom pages configured', () => {
    expect(authOptions.pages).toEqual({
      signIn: '/auth/signin',
      error: '/auth/error',
    });
  });

  it('should have proper callback URLs', () => {
    const googleProvider = authOptions.providers[0] as any;
    expect(googleProvider.authorization.params.scope).toContain('gmail.modify');
    expect(googleProvider.authorization.params.access_type).toBe('offline');
  });

  describe('Session Callback', () => {
    it('should add user ID to session when user exists', async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = {};

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: { id: '123', ...mockToken },
      } as any);

      expect(result?.user?.id).toBe('123');
    });

    it('should return session unchanged when no user', async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      const mockToken = {};

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        user: null,
      } as any);

      expect(result).toEqual(mockSession);
    });
  });

  describe('JWT Callback', () => {
    it('should add tokens and user ID when account and user exist', async () => {
      const mockToken = {};
      const mockAccount = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };
      const mockUser = { id: '123' };

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        account: mockAccount,
        user: mockUser,
      } as any);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: '123',
      });
    });

    it('should return token unchanged when no account', async () => {
      const mockToken = { existing: 'data' };

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        account: null,
        user: null,
      } as any);

      expect(result).toEqual(mockToken);
    });
  });
});