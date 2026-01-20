import type { RaceConfig } from '../types';

export function applyPhonotactics(name: string, race: RaceConfig): string {
  let result = name;
  for (const sub of race.constraints.substitutions) {
    result = result.replace(new RegExp(sub.from, 'g'), sub.to);
  }
  if (race.constraints.avoidDoubleVowels) {
    result = result.replace(/([aeiou])\1+/gi, '$1');
  }
  for (const cluster of race.constraints.bannedClusters) {
    result = result.replace(new RegExp(cluster, 'gi'), cluster[0]);
  }
  return result;
}
