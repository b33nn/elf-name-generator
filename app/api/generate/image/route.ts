import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/providers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, race, oc } = body;

    // 检查是否配置了 AI API
    const useAI = process.env.AI_PROVIDER && (process.env.GEMINI_API_KEY || process.env.QWEN_API_KEY || process.env.OPENAI_API_KEY);

    if (useAI) {
      // 使用真实 AI API
      const aiProvider = getAIProvider();
      const prompt = `Create a fantasy character portrait for:
Name: ${name}
Race: ${race}
Class: ${oc?.class || 'Adventurer'}
Personality: ${oc?.personality?.join(', ') || 'Mysterious'}

Style: Fantasy digital art, detailed character portrait, high quality, ${race} features`;

      const imageUrl = await aiProvider.generateImage(prompt);
      return NextResponse.json({ imageUrl });
    } else {
      // 使用占位符（开发模式）
      const mockImageUrl = `https://placehold.co/400x400/6366f1/ffffff?text=${encodeURIComponent(name)}`;
      return NextResponse.json({ imageUrl: mockImageUrl });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
