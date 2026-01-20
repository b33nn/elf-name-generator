import type { Morpheme, Gender } from '../types';

export function selectWeighted<T extends { weight: number }>(
  items: T[],
  rng: () => number
): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = rng() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

export function filterByGender(
  morphemes: Morpheme[],
  gender?: Gender
): Morpheme[] {
  if (!gender) return morphemes;
  return morphemes.filter(m => !m.gender || m.gender === gender || m.gender === "neutral");
}
