export type MorphemePosition = "prefix" | "stem" | "suffix";
export type Gender = "neutral" | "feminine" | "masculine";

export type Morpheme = {
  id: string;
  text: string;
  meaning: string;
  position: MorphemePosition;
  tags: string[];
  weight: number;
  raceIds: string[];
  gender?: Gender;
};

export type GenerationPattern = {
  id: string;
  tokens: MorphemePosition[];
  weight: number;
  gender?: Gender;
};

export type RaceConfig = {
  id: string;
  displayName: string;
  description: string;
  allowedTags: string[];
  patterns: GenerationPattern[];
  constraints: {
    minLength: number;
    maxLength: number;
    avoidDoubleVowels: boolean;
    bannedClusters: string[];
    substitutions: Array<{ from: string; to: string }>;
  };
  meaningTemplate: {
    order: "prefix-first" | "stem-first";
    joiner: string;
  };
};

export type NameResult = {
  name: string;
  meaning: string;
  raceId: string;
  parts: Array<{ text: string; meaning: string }>;
};

export type GeneratorOptions = {
  raceId: string;
  gender?: Gender;
  seed?: string;
};
