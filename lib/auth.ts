import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './db';
import UserModel from '@/models/User';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Important for deployments behind proxies (e.g. Vercel) and for non-localhost access.
  // Helps avoid host/origin mismatches that can break session flows on some clients.
  trustHost: true,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await UserModel.findOne({ email: credentials.email }).select('+password');

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = (user as { id?: string }).id;
        token.name = user.name;
        token.email = user.email;
        // next-auth uses `picture` internally for the image URL in many flows
        token.picture = (user as { image?: string }).image;
      }

      // Client-side `useSession().update(...)` support
      if (trigger === 'update' && session?.user) {
        token.name = session.user.name ?? token.name;
        token.email = session.user.email ?? token.email;
        token.picture = (session.user as { image?: string }).image ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        (session.user as { image?: string }).image = (token.picture as string) ?? (session.user as { image?: string }).image;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        await dbConnect();
        const existing = await UserModel.findOne({ email: user.email });
        if (!existing) {
          await UserModel.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
