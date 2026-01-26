import type { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { Resend } from "resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (!provider.from) {
          throw new Error("EMAIL_FROM is required")
        }

        await resend.emails.send({
          from: provider.from,
          to: identifier,
          subject: "Your sign-in link",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Sign in to Elf Forge</h2>
              <p>Click the button below to sign in:</p>
              <p>
                <a href="${url}" style="display:inline-block;padding:10px 16px;background:#0a5c43;color:#fff;border-radius:8px;text-decoration:none;">
                  Sign in
                </a>
              </p>
              <p>If the button does not work, copy and paste this URL:</p>
              <p>${url}</p>
            </div>
          `,
        })
      },
    }),
  ],
  callbacks: {
    session: async ({ session, user }: any) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
}
