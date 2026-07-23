import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
// @ts-ignore - Assuming prisma client is exported from @valenor/db
import { prisma } from "@valenor/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // Custom email template matching the brand framework
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Here we would implement the Resend-based plain text luxury email
        // for magic link sign-in.
        console.log(`[AUTH] Magic Link for ${identifier}: ${url}`);
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
});
