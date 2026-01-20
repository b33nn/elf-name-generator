import type { RaceConfig, Morpheme } from './types';
import highElfRace from './data/races/high-elf.json';
import woodElfRace from './data/races/wood-elf.json';
import darkElfRace from './data/races/dark-elf.json';
import nightElfRace from './data/races/night-elf.json';
import bloodElfRace from './data/races/blood-elf.json';
import highElfMorphemes from './data/morphemes/high-elf.json';
import woodElfMorphemes from './data/morphemes/wood-elf.json';
import darkElfMorphemes from './data/morphemes/dark-elf.json';
import nightElfMorphemes from './data/morphemes/night-elf.json';
import bloodElfMorphemes from './data/morphemes/blood-elf.json';

export const races: RaceConfig[] = [
  highElfRace as RaceConfig,
  woodElfRace as RaceConfig,
  darkElfRace as RaceConfig,
  nightElfRace as RaceConfig,
  bloodElfRace as RaceConfig
];

export const morphemes: Morpheme[] = [
  ...highElfMorphemes as Morpheme[],
  ...woodElfMorphemes as Morpheme[],
  ...darkElfMorphemes as Morpheme[],
  ...nightElfMorphemes as Morpheme[],
  ...bloodElfMorphemes as Morpheme[]
];

export function getRaceById(raceId: string): RaceConfig | undefined {
  return races.find(r => r.id === raceId);
}
