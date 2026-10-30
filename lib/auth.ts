import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

type GoogleRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.error("Google access token expired without a refresh token.");
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:
        process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "",
      client_secret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Google token refresh failed:",
      response.status,
      errorText.slice(0, 500),
    );
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const refreshed = (await response.json()) as GoogleRefreshResponse;
  return {
    ...token,
    accessToken: refreshed.access_token,
    accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID!,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope:
            "openid https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (
          !email ||
          !password ||
          new TextEncoder().encode(password).byteLength > 72
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await compare(password, user.password))) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.accessToken = account.access_token;
        const expiresAt = Number(account.expires_at);
        const expiresIn = Number(account.expires_in);
        token.accessTokenExpires =
          Number.isFinite(expiresAt) && expiresAt > 0
            ? expiresAt * 1000
            : Date.now() +
              (Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600) *
                1000;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        return token;
      }

      if (!token.accessToken) {
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60_000
      ) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        session.error = token.error;
      }
      return session;
    },
  },
};
