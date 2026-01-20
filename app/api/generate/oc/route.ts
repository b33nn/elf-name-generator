import { NextResponse } from 'next/server';
import { RunAnytimeProvider } from '@/lib/ai/runanytime-provider';

type OC = {
  class: string;
  personality: string[];
  background: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, race, gender } = body;
    const fallbackOC = buildMockOC(name, race, gender);
    const useAI = process.env.TEXT_API_KEY;

    if (useAI) {
      const textProvider = new RunAnytimeProvider(
        process.env.TEXT_API_KEY!,
        process.env.TEXT_API_URL,
        process.env.TEXT_MODEL
      );

      const prompt = `Generate a detailed character profile for an elf named ${name}.
Race: ${race}
Gender: ${gender || 'neutral'}

Please provide:
1. Class/Role (one word)
2. Three personality traits (comma-separated)
3. A brief background story (2-3 sentences)

Format your response as JSON. Return ONLY valid JSON, no markdown or extra text:
{
  "class": "...",
  "personality": ["...", "...", "..."],
  "background": "..."
}`;

      try {
        const response = await textProvider.generateText(prompt);
        const oc = parseOCResponse(response, fallbackOC);
        return NextResponse.json({ oc });
      } catch (error) {
        console.error('OC generation error:', error);
        return NextResponse.json({ oc: fallbackOC });
      }
    }

    return NextResponse.json({ oc: fallbackOC });
  } catch (error) {
    console.error('OC generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to generate OC',
      details: errorMessage,
      hasApiKey: !!process.env.TEXT_API_KEY
    }, { status: 500 });
  }
}

function buildMockOC(name: string, race: string, gender?: string): OC {
  return {
    class: getRandomClass(race),
    personality: getRandomPersonality(),
    background: `${name} is a ${gender || 'mysterious'} ${race} with a rich history. Born under the ancient stars, they have dedicated their life to mastering the arcane arts and protecting their homeland from dark forces.`
  };
}

function parseOCResponse(raw: string, fallback: OC): OC {
  const cleaned = stripCodeFences(raw);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in AI response');
  }
  const jsonText = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(jsonText) as Partial<OC> & { personality?: string | string[] };
  const personality = Array.isArray(parsed.personality)
    ? parsed.personality.map((trait) => String(trait).trim()).filter(Boolean)
    : typeof parsed.personality === 'string'
      ? parsed.personality.split(',').map((trait) => trait.trim()).filter(Boolean)
      : fallback.personality;

  return {
    class: typeof parsed.class === 'string' && parsed.class.trim() ? parsed.class.trim() : fallback.class,
    personality: personality.length > 0 ? personality : fallback.personality,
    background: typeof parsed.background === 'string' && parsed.background.trim() ? parsed.background.trim() : fallback.background
  };
}

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function getRandomClass(race: string): string {
  const classes: Record<string, string[]> = {
    'high-elf': ['Mage', 'Enchanter', 'Scholar', 'Archmage'],
    'wood-elf': ['Ranger', 'Druid', 'Hunter', 'Scout'],
    'dark-elf': ['Assassin', 'Warlock', 'Shadow Mage', 'Rogue'],
    'night-elf': ['Priestess', 'Sentinel', 'Huntress', 'Warden'],
    'blood-elf': ['Spellbreaker', 'Magister', 'Blood Mage', 'Paladin']
  };
  const options = classes[race] || ['Adventurer'];
  return options[Math.floor(Math.random() * options.length)];
}

function getRandomPersonality(): string[] {
  const traits = ['Wise', 'Brave', 'Cunning', 'Mysterious', 'Noble', 'Fierce', 'Calm', 'Proud', 'Ancient', 'Swift'];
  const selected: string[] = [];
  for (let i = 0; i < 3; i++) {
    const trait = traits[Math.floor(Math.random() * traits.length)];
    if (!selected.includes(trait)) selected.push(trait);
  }
  return selected;
}
