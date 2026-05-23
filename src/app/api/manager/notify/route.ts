import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeoutRetry } from '@/app/api/_lib/http';

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ ok: false, skipped: true, reason: 'telegram env missing' }, { status: 200 });
    }

    const { title, lines } = await request.json();
    const safeTitle = typeof title === 'string' ? title : 'Новое обращение';
    const safeLines = Array.isArray(lines) ? lines : [];
    const message = [`📩 ${safeTitle}`, ...safeLines].join('\n');

    const response = await fetchWithTimeoutRetry(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
      cache: 'no-store',
    }, { timeoutMs: 8000, retries: 2, retryDelayMs: 300 });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ ok: false, error: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
