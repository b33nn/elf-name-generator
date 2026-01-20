export class RunAnytimeProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://runanytime.hxi.me',
    model: string = 'claude-sonnet-4-5-20250929'
  ) {
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

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`RunAnytime API returned invalid JSON: ${raw}`);
    }

    if (!response.ok) {
      const message = typeof data?.error === 'string' ? data.error : raw;
      throw new Error(`RunAnytime API error ${response.status}: ${message}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('RunAnytime API returned no content');
    }

    return content;
  }
}
