import type { RaceConfig, Morpheme, NameResult, GeneratorOptions, MorphemePosition } from '../types';
import { createSeededRNG } from './rng';
import { selectWeighted, filterByGender } from './selector';
import { applyPhonotactics } from './phonotactics';
import { assembleMeaning } from './meaning';

export function generateName(
  race: RaceConfig,
  morphemes: Morpheme[],
  options: GeneratorOptions
): NameResult {
  const rng = createSeededRNG(options.seed);
  const pattern = selectWeighted(race.patterns, rng);

  const morphemesByPosition: Record<MorphemePosition, Morpheme[]> = {
    prefix: morphemes.filter(m => m.position === 'prefix' && m.raceIds.includes(race.id)),
    stem: morphemes.filter(m => m.position === 'stem' && m.raceIds.includes(race.id)),
    suffix: morphemes.filter(m => m.position === 'suffix' && m.raceIds.includes(race.id))
  };

  const selectedParts: Array<{ morpheme: Morpheme; text: string }> = [];

  for (const token of pattern.tokens) {
    let candidates = morphemesByPosition[token];
    candidates = filterByGender(candidates, options.gender);
    if (candidates.length === 0) {
      candidates = morphemesByPosition[token];
    }
    const selected = selectWeighted(candidates, rng);
    selectedParts.push({ morpheme: selected, text: selected.text });
  }

  let name = selectedParts.map(p => p.text).join('');
  name = applyPhonotactics(name, race);
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const meaning = assembleMeaning(selectedParts, race);

  return {
    name,
    meaning,
    raceId: race.id,
    parts: selectedParts.map(p => ({
      text: p.text,
      meaning: p.morpheme.meaning
    }))
  };
}
