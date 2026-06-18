import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb, DbUser } from './database';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const db = getDb();
          const user = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get(credentials.email) as DbUser | undefined;

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            slug: user.slug,
            businessName: user.business_name,
            subscriptionStatus: user.subscription_status,
            trialEnd: user.trial_end,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.slug = user.slug;
        token.businessName = user.businessName;
        token.subscriptionStatus = user.subscriptionStatus;
        token.trialEnd = user.trialEnd;
      }
      if (trigger === 'update') {
        // Refresh user data from DB on session update
        try {
          const db = getDb();
          const freshUser = db
            .prepare('SELECT * FROM users WHERE id = ?')
            .get(Number(token.id)) as DbUser | undefined;
          if (freshUser) {
            token.slug = freshUser.slug;
            token.businessName = freshUser.business_name;
            token.subscriptionStatus = freshUser.subscription_status;
            token.trialEnd = freshUser.trial_end;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.slug = token.slug as string | null;
      session.user.businessName = token.businessName as string | null;
      session.user.subscriptionStatus = token.subscriptionStatus as string | null;
      session.user.trialEnd = token.trialEnd as number | null;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
