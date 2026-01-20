import type { RaceConfig, Morpheme } from '../types';

export function assembleMeaning(
  parts: Array<{ morpheme: Morpheme; text: string }>,
  race: RaceConfig
): string {
  if (parts.length === 0) return '';
  const meanings = parts.map(p => p.morpheme.meaning);
  if (race.meaningTemplate.order === 'stem-first') {
    const stemIndex = parts.findIndex(p => p.morpheme.position === 'stem');
    if (stemIndex !== -1) {
      const stem = meanings[stemIndex];
      const others = meanings.filter((_, i) => i !== stemIndex);
      return [stem, ...others].join(race.meaningTemplate.joiner);
    }
  }
  return meanings.join(race.meaningTemplate.joiner);
}
