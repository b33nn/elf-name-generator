// Hotaru API 适配器（OpenAI 兼容格式）
export class HotaruProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.hotaruapi.top', model: string = 'gemini-3-pro-image-preview') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateText(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateImage(prompt: string): Promise<string> {
    // 图片生成暂时返回占位符
    return `https://placehold.co/512x512/6366f1/ffffff?text=${encodeURIComponent('AI+Image')}`;
  }
}
