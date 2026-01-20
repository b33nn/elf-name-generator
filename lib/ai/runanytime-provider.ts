// RunAnytime API 适配器（用于文本生成）
export class RunAnytimeProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string = 'https://runanytime.hxi.me', model: string = 'claude-sonnet-4-5-20250929') {
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
}
