import { HotaruProvider } from './hotaru-provider';

// AI 适配器接口定义
export interface AIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  generateImage(prompt: string, options?: any): Promise<string>;
}

// Google Gemini 适配器
export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateImage(prompt: string): Promise<string> {
    // Gemini 目前不直接支持图片生成，使用 Imagen API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
      })
    });
    const data = await response.json();
    return data.predictions[0].bytesBase64Encoded;
  }
}

// 通义千问适配器示例
export class QwenProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: { prompt },
        parameters: { max_tokens: 500 }
      })
    });
    const data = await response.json();
    return data.output.text;
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: { prompt },
        parameters: { size: '512*512' }
      })
    });
    const data = await response.json();
    return data.output.results[0].url;
  }
}

// OpenAI 适配器示例
export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'standard'
      })
    });
    const data = await response.json();
    return data.data[0].url;
  }
}

// AI 提供商工厂
export function getAIProvider(type?: string): AIProvider {
  const providerType = type || process.env.AI_PROVIDER || 'hotaru';

  switch (providerType) {
    case 'hotaru':
      return new HotaruProvider(
        process.env.HOTARU_API_KEY!,
        process.env.HOTARU_BASE_URL,
        process.env.HOTARU_MODEL
      );
    case 'gemini':
      return new GeminiProvider(process.env.GEMINI_API_KEY!);
    case 'qwen':
      return new QwenProvider(process.env.QWEN_API_KEY!);
    case 'openai':
      return new OpenAIProvider(process.env.OPENAI_API_KEY!);
    default:
      throw new Error(`Unknown AI provider: ${providerType}`);
  }
}
