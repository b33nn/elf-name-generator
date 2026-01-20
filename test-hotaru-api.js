// 测试 Hotaru API 是否正常工作
async function testHotaruAPI() {
  const apiKey = 'sk-6hvgTF1tkCl9lF02sXlkYq3CGFFpQBGl91moMga1LU3WjpeQ';
  const baseUrl = 'https://api.hotaruapi.top';
  const model = 'claude-sonnet-4-5-20250929';

  console.log('Testing Hotaru API...\n');

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: 'Generate a JSON object with: {"class": "Mage", "personality": ["Wise", "Calm", "Ancient"], "background": "A brief story"}. Return ONLY the JSON, no markdown.'
        }]
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\nExtracted content:');
    console.log(data.choices[0].message.content);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testHotaruAPI();
