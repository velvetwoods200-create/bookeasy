import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    slug?: string | null;
    businessName?: string | null;
    subscriptionStatus?: string | null;
    trialEnd?: number | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      slug?: string | null;
      businessName?: string | null;
      subscriptionStatus?: string | null;
      trialEnd?: number | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    slug?: string | null;
    businessName?: string | null;
    subscriptionStatus?: string | null;
    trialEnd?: number | null;
  }
}
