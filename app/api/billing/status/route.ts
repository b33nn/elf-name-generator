import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ authenticated: false });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      imageCredits: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ authenticated: true, plan: 'FREE', imageCredits: 0 });
  }

  return NextResponse.json({
    authenticated: true,
    plan: dbUser.plan ?? 'FREE',
    subscriptionStatus: dbUser.subscriptionStatus,
    subscriptionCurrentPeriodEnd: dbUser.subscriptionCurrentPeriodEnd
      ? dbUser.subscriptionCurrentPeriodEnd.toISOString()
      : null,
    imageCredits: dbUser.imageCredits ?? 0,
  });
}
