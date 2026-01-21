import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

export async function GET() {
  try {
    let content = '';
    if (existsSync(ENV_PATH)) {
      content = readFileSync(ENV_PATH, 'utf-8');
    }

    const config = {
      runanytimeApiKey: extractValue(content, 'RUNANYTIME_API_KEY'),
      runanytimeBaseUrl: extractValue(content, 'RUNANYTIME_BASE_URL') || 'https://runanytime.hxi.me',
      runanytimeModel: extractValue(content, 'RUNANYTIME_MODEL') || 'claude-sonnet-4-5-20250929',
    };

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { runanytimeApiKey, runanytimeBaseUrl, runanytimeModel } = body;

    let content = '';
    if (existsSync(ENV_PATH)) {
      content = readFileSync(ENV_PATH, 'utf-8');
    }

    content = updateValue(content, 'RUNANYTIME_API_KEY', runanytimeApiKey);
    content = updateValue(content, 'RUNANYTIME_BASE_URL', runanytimeBaseUrl);
    content = updateValue(content, 'RUNANYTIME_MODEL', runanytimeModel);

    writeFileSync(ENV_PATH, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

function extractValue(content: string, key: string): string {
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

function updateValue(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}
