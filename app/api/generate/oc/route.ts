import { NextResponse } from 'next/server';
import { RunAnytimeProvider } from '@/lib/ai/runanytime-provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, race, gender } = body;

    // 检查是否配置了文本生成 API
    const useAI = process.env.TEXT_API_KEY;

    if (useAI) {
      // 使用真实 AI API
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

Format your response as JSON:
{
  "class": "...",
  "personality": ["...", "...", "..."],
  "background": "..."
}`;

      const response = await textProvider.generateText(prompt);

      // 清理 AI 返回的内容，移除可能的 markdown 代码块标记
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const oc = JSON.parse(cleanedResponse);
      return NextResponse.json({ oc });
    } else {
      // 使用模拟数据（开发模式）
      const mockOC = {
        class: getRandomClass(race),
        personality: getRandomPersonality(),
        background: `${name} is a ${gender || 'mysterious'} ${race} with a rich history. Born under the ancient stars, they have dedicated their life to mastering the arcane arts and protecting their homeland from dark forces.`
      };
      return NextResponse.json({ oc: mockOC });
    }
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
