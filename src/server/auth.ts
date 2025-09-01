import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';
import { encrypt } from './crypto';

export const authOptions: NextAuthOptions = {
  // No adapter when using JWT sessions
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: process.env.GOOGLE_AUTH_SCOPES || 'openid email profile https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Ensure user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create user if doesn't exist
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                googleEmail: user.email,
              },
            });
          }

          // Save refresh token if available
          if (account.refresh_token) {
            const encryptedToken = encrypt(account.refresh_token);
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                googleEmail: user.email,
                googleRefreshToken: encryptedToken,
              },
            });
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // Don't fail signin - just log the error
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && user.email) {
        // On first login, get the actual database user ID
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, subscriptionStatus: true, dailyQuota: true },
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.dailyQuota = dbUser.dailyQuota;
        }
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        // Use cached data from token to avoid database calls on every session check
        session.user.id = (token.id as string) || (token.sub as string) || '';
        session.user.subscriptionStatus = token.subscriptionStatus as string || 'inactive';
        session.user.dailyQuota = token.dailyQuota as number || 1000;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      subscriptionStatus?: string;
      dailyQuota?: number;
    };
  }
}