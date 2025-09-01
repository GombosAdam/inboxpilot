import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  vi.stubEnv('GOOGLE_CLIENT_ID', 'test-google-client-id');
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
  vi.stubEnv('NEXTAUTH_SECRET', 'test-nextauth-secret');
  vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
  vi.stubEnv('DATABASE_URL', 'file:./test.db');
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key');
  vi.stubEnv('LEMONSQUEEZY_API_KEY', 'test-lemonsqueezy-key');
  vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', 'test-webhook-secret');
  vi.stubEnv('LEMONSQUEEZY_PRO_PLAN_ID', 'test-pro-plan-id');
  vi.stubEnv('CRON_SECRET', 'test-cron-secret');
  vi.stubEnv('ENCRYPTION_KEY', 'test-encryption-key-32-characters-long');
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  vi.unstubAllEnvs();
});