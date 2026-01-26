import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getPlanPriceId, getImagePack, imagePackIds, type BillingCycle, type PlanId } from '@/lib/billing';

export const dynamic = 'force-dynamic';

type CheckoutPayload =
  | { type: 'subscription'; planId: PlanId; billingCycle: BillingCycle }
  | { type: 'image_pack'; packId: (typeof imagePackIds)[number] };

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await req.json()) as CheckoutPayload;
  const baseUrl = getBaseUrl();

  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: user.name ? { name: user.name } : {},
    create: {
      email: user.email,
      name: user.name ?? null,
    },
  });

  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId: customerId },
    });
  }

  if (payload.type === 'subscription') {
    const priceId = getPlanPriceId(payload.planId, payload.billingCycle);
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/pricing?success=1`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      subscription_data: {
        metadata: {
          userId: dbUser.id,
          planId: payload.planId,
          billingCycle: payload.billingCycle,
        },
      },
      metadata: {
        userId: dbUser.id,
        planId: payload.planId,
        billingCycle: payload.billingCycle,
      },
    });

    return NextResponse.json({ url: session.url });
  }

  if (payload.type === 'image_pack') {
    const pack = getImagePack(payload.packId);
    if (!pack?.priceId) {
      return NextResponse.json({ error: 'Invalid pack configuration' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [{ price: pack.priceId, quantity: 1 }],
      automatic_payment_methods: { enabled: true },
      success_url: `${baseUrl}/pricing?success=1&pack=${payload.packId}`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      payment_intent_data: {
        metadata: {
          userId: dbUser.id,
          packId: payload.packId,
          credits: String(pack.credits),
        },
      },
      metadata: {
        userId: dbUser.id,
        packId: payload.packId,
        credits: String(pack.credits),
      },
    });

    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
}
