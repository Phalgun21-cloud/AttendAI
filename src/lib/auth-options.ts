import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect, { isMockDb } from '@/lib/db';
import { User } from '@/lib/models/User';
import { mockDbHelper } from '@/lib/mockDb';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        // Hardcoded Super Admin Login
        if (credentials.email === 'admin@attendai.com' && credentials.password === 'superadmin123') {
          return {
            id: 'super-admin-id',
            name: 'Super Admin',
            email: 'admin@attendai.com',
            role: 'SUPER_ADMIN',
          };
        }

        await dbConnect();

        let user = null;
        if (isMockDb()) {
          user = mockDbHelper.getUserByEmail(credentials.email);
        } else {
          user = await User.findOne({ email: credentials.email.toLowerCase() });
        }

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        } as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-fallback-secret-123456789',
};
