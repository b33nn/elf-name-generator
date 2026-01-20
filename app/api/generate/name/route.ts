import { NextResponse } from 'next/server';
import { generateName } from '@/lib/name-generator/engine/generator';
import { races, morphemes, getRaceById } from '@/lib/name-generator/data';
import type { GeneratorOptions } from '@/lib/name-generator/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raceId, gender, count = 1 } = body;

    if (!raceId) {
      return NextResponse.json({ error: 'Race ID is required' }, { status: 400 });
    }

    const race = getRaceById(raceId);
    if (!race) {
      return NextResponse.json({ error: 'Invalid race ID' }, { status: 400 });
    }

    const results = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const options: GeneratorOptions = { raceId, gender };
      const result = generateName(race, morphemes, options);
      results.push(result);
    }

    return NextResponse.json({ characters: results });
  } catch (error) {
    console.error('Name generation error:', error);
    return NextResponse.json({ error: 'Failed to generate names' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ races: races.map(r => ({ id: r.id, displayName: r.displayName, description: r.description })) });
}
