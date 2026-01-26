export type BillingCycle = 'monthly' | 'yearly';
export type PlanId = 'initiate' | 'ranger' | 'lorekeeper' | 'mythic';

const planPriceIds: Record<PlanId, { monthly?: string; yearly?: string }> = {
  initiate: {
    monthly: process.env.STRIPE_PRICE_INITIATE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_INITIATE_YEARLY,
  },
  ranger: {
    monthly: process.env.STRIPE_PRICE_RANGER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_RANGER_YEARLY,
  },
  lorekeeper: {
    monthly: process.env.STRIPE_PRICE_LOREKEEPER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_LOREKEEPER_YEARLY,
  },
  mythic: {
    monthly: process.env.STRIPE_PRICE_MYTHIC_MONTHLY,
    yearly: process.env.STRIPE_PRICE_MYTHIC_YEARLY,
  },
};

const imagePacks = {
  'portrait-pack': {
    credits: 20,
    priceId: process.env.STRIPE_PRICE_IMAGE_PACK,
  },
};

export function getPlanPriceId(planId: PlanId, cycle: BillingCycle): string | null {
  return planPriceIds[planId]?.[cycle] ?? null;
}

export function getPlanIdFromPriceId(priceId: string): PlanId | null {
  const entries = Object.entries(planPriceIds) as Array<[PlanId, { monthly?: string; yearly?: string }]>;
  for (const [planId, prices] of entries) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return planId;
    }
  }
  return null;
}

export function getImagePack(packId: keyof typeof imagePacks) {
  return imagePacks[packId];
}

export const imagePackIds = Object.keys(imagePacks) as Array<keyof typeof imagePacks>;
