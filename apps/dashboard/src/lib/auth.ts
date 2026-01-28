import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';

const nextAuth = NextAuth({
  trustHost: true,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id ?? undefined;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

// Type assertions to work around next-auth v5 beta type portability issues
export const handlers: typeof nextAuth.handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn: any = nextAuth.signIn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut: any = nextAuth.signOut;
export const { GET, POST } = handlers;
