import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'], // Minimal logging for performance
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export as 'db' for backward compatibility
export const db = prisma;